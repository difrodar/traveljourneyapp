#!/usr/bin/env node
// Reset the three usability-test demo accounts (demo_anna, demo_max, demo_traveler)
// to their freshly-seeded baseline. Use between test sessions when multiple
// testers share the same accounts.
//
// What it does:
//   1. Wipes all per-user content from MongoDB (events, locations, trips,
//      ideas, journey entries, shares, active sessions) for the three demo
//      users. The user accounts themselves are kept so the credentials stay
//      valid — only their data is purged.
//   2. Re-runs the four existing setup scripts in order to restore the
//      baseline state expected by the walkthrough and by the usability test.
//
// Requires: dev server running on http://localhost:5173, MONGODB_URI in .env.
// Run with: node scripts/reset-test-state.js

import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { MongoClient } from "mongodb";

const DEMO_USERS = ["demo_anna", "demo_max", "demo_traveler"];
const SEED_SCRIPTS = [
	"scripts/seed-walkthrough.js",
	"scripts/fix-walkthrough-images.js",
	"scripts/fix-walkthrough-trip-journey.js",
	"scripts/seed-usability-test-account.js"
];

function loadEnv() {
	try {
		const raw = readFileSync(".env", "utf8");
		for (const line of raw.split(/\r?\n/)) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) continue;
			const idx = trimmed.indexOf("=");
			if (idx === -1) continue;
			const key = trimmed.slice(0, idx).trim();
			const value = trimmed.slice(idx + 1).trim().replace(/^"|"$/g, "");
			if (!process.env[key]) process.env[key] = value;
		}
	} catch {}
}
loadEnv();

async function wipeUserData() {
	const uri = process.env.MONGODB_URI;
	if (!uri) throw new Error("MONGODB_URI missing in .env");
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db(process.env.MONGODB_DB || "triptales");
		const users = await db.collection("users").find({ username: { $in: DEMO_USERS } }).toArray();
		if (users.length === 0) {
			console.log("  (no demo users found in DB yet — first-time setup)");
			return;
		}
		const userIds = users.map((u) => u._id);
		console.log(`  Wiping data for: ${users.map((u) => u.username).join(", ")}`);
		const eventsOwned = await db.collection("events").find({ userId: { $in: userIds } }).project({ _id: 1 }).toArray();
		const eventIds = eventsOwned.map((e) => e._id);
		const [evt, loc, jrn, trp, idea, shr, ses] = await Promise.all([
			db.collection("events").deleteMany({ userId: { $in: userIds } }),
			db.collection("locations").deleteMany({ userId: { $in: userIds } }),
			db.collection("journeyEntries").deleteMany({ userId: { $in: userIds } }),
			db.collection("trips").deleteMany({ userId: { $in: userIds } }),
			db.collection("travelIdeas").deleteMany({ userId: { $in: userIds } }),
			db.collection("shares").deleteMany({ userId: { $in: userIds } }),
			db.collection("sessions").deleteMany({ userId: { $in: userIds } })
		]);
		// Also clear invitations that target these users (e.g. an invitation
		// the previous tester sent to demo_max from an account we're NOT
		// resetting — unlikely in practice, but cheap to handle).
		await db.collection("events").updateMany(
			{ invitedUserIds: { $in: userIds } },
			{ $pull: { invitedUserIds: { $in: userIds }, invitations: { userId: { $in: userIds } } } }
		);
		// Drop avatars so the nav shows initial chips again.
		await db.collection("users").updateMany({ _id: { $in: userIds } }, { $unset: { avatarUrl: "" } });

		console.log(`  Deleted: ${evt.deletedCount} events, ${loc.deletedCount} locations, ${jrn.deletedCount} memories, ${trp.deletedCount} trips, ${idea.deletedCount} ideas, ${shr.deletedCount} shares, ${ses.deletedCount} sessions`);
		console.log(`  Cleared event ids referenced elsewhere: ${eventIds.length}`);
	} finally {
		await client.close();
	}
}

function runScript(scriptPath) {
	console.log(`\n--- ${scriptPath} ---`);
	const result = spawnSync(process.execPath, [scriptPath], { stdio: "inherit" });
	if (result.status !== 0) {
		console.error(`\n${scriptPath} failed with exit code ${result.status}`);
		process.exit(result.status || 1);
	}
}

async function main() {
	console.log("TripTales — reset test state");
	console.log("\n[1/2] Wiping per-user data from MongoDB");
	await wipeUserData();

	console.log("\n[2/2] Re-running seed scripts in order");
	for (const script of SEED_SCRIPTS) {
		runScript(script);
	}

	console.log("\n✅ Reset complete. Ready for next tester.");
	console.log("\n  demo_anna     / demo_anna_pw      (Aufgaben 1-6)");
	console.log("  demo_max      / demo_max_pw       (statisten-account, kein Login durch Testperson)");
	console.log("  demo_traveler / demo_traveler_pw  (Aufgaben 7-8)");
}

main().catch((error) => {
	console.error("\n" + (error.stack || error.message));
	process.exit(1);
});
