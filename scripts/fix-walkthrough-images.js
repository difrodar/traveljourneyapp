#!/usr/bin/env node
// Walkthrough demo: attach licensed Wikimedia photos to every demo_anna event
// (and to demo_max's Vegas event that anna is invited to) plus to every memory.
// Idempotent — safe to re-run. Uses Wikimedia Commons "Special:FilePath" URLs
// matching the same convention as src/lib/media.js, so the credit metadata stays
// consistent with the rest of the app.

import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";

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

function wikimedia(fileName, width = 1200) {
	return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=${width}`;
}

// Maps lowercased location.name → image metadata block.
// All entries are CC-licensed Wikimedia Commons files — same pattern as media.js.
const imageByLocation = {
	"balboa park": {
		imageUrl: wikimedia("Balboa Park San Diego.jpg"),
		imageAlt: "Spanish-style buildings and gardens in Balboa Park, San Diego",
		imageCredit: "Hosiyar singh bhambhu / Wikimedia Commons",
		imageLicense: "CC BY-SA 4.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Balboa_Park_San_Diego.jpg"
	},
	"gaslamp quarter": {
		imageUrl: wikimedia("Fish taco-1.jpg"),
		imageAlt: "Fresh fish tacos with lime and salsa",
		imageCredit: "Leo Chiou / Wikimedia Commons",
		imageLicense: "CC BY-SA 4.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Fish_taco-1.jpg"
	},
	"la jolla cove": {
		imageUrl: wikimedia("La Jolla Cove, San Diego.jpg"),
		imageAlt: "Ocean cliffs and water at La Jolla Cove in San Diego",
		imageCredit: "Stephen Bay / Wikimedia Commons",
		imageLicense: "CC BY",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:La_Jolla_Cove,_San_Diego.jpg"
	},
	"coronado beach": {
		imageUrl: wikimedia("Coronado beach.jpg"),
		imageAlt: "Coronado Beach in California",
		imageCredit: "Ashley / Wikimedia Commons",
		imageLicense: "CC BY 2.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Coronado_beach.jpg"
	},
	"geisel library": {
		imageUrl: wikimedia("Geisel Library, UCSD 5.jpg"),
		imageAlt: "Geisel Library at UC San Diego",
		imageCredit: "Christian Cordova / Wikimedia Commons",
		imageLicense: "CC BY 2.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Geisel_Library,_UCSD_5.jpg"
	},
	colosseum: {
		imageUrl: wikimedia("Colosseo 2020.jpg"),
		imageAlt: "The Colosseum in Rome",
		imageCredit: "Diliff / Wikimedia Commons",
		imageLicense: "CC BY-SA 4.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Colosseo_2020.jpg"
	},
	"uffizi gallery": {
		imageUrl: wikimedia("Uffizi Gallery, Florence.jpg"),
		imageAlt: "Uffizi Gallery courtyard in Florence",
		imageCredit: "Petar Milošević / Wikimedia Commons",
		imageLicense: "CC BY-SA 4.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Uffizi_Gallery,_Florence.jpg"
	},
	"las vegas strip": {
		imageUrl: wikimedia("Las Vegas Strip at night.jpg"),
		imageAlt: "Las Vegas Strip at night",
		imageCredit: "Kapil Dubey / Wikimedia Commons",
		imageLicense: "CC BY-SA 4.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Las_Vegas_Strip_at_night.jpg"
	}
};

function memoryImage(meta, label) {
	return {
		url: meta.imageUrl,
		alt: label || meta.imageAlt,
		credit: meta.imageCredit,
		license: meta.imageLicense,
		sourceUrl: meta.imageSourceUrl
	};
}

const uri = process.env.MONGODB_URI;
if (!uri) {
	console.error("MONGODB_URI missing in .env");
	process.exit(1);
}

const client = new MongoClient(uri);
try {
	await client.connect();
	const db = client.db(process.env.MONGODB_DB || "triptales");

	const anna = await db.collection("users").findOne({ username: "demo_anna" });
	if (!anna) {
		console.error("demo_anna not found — run seed-walkthrough.js first.");
		process.exit(1);
	}
	const max = await db.collection("users").findOne({ username: "demo_max" });

	// Collect every location id referenced by either user's events, so we paint
	// the demo_max-owned Vegas location too (demo_anna sees it as an invitation).
	const ownerIds = [anna._id, ...(max ? [max._id] : [])];
	const events = await db.collection("events").find({ userId: { $in: ownerIds } }).toArray();
	const locationIds = [...new Set(events.map((event) => event.locationId?.toString()).filter(Boolean))];

	let locationsUpdated = 0;
	let locationsSkipped = 0;
	for (const id of locationIds) {
		const location = await db.collection("locations").findOne({ _id: events.find((e) => e.locationId?.toString() === id).locationId });
		if (!location) continue;
		const key = String(location.name || "").toLowerCase();
		const meta = imageByLocation[key];
		if (!meta) {
			console.warn(`  (no image mapping for location "${location.name}" — skipping)`);
			locationsSkipped += 1;
			continue;
		}
		await db.collection("locations").updateOne(
			{ _id: location._id },
			{ $set: { ...meta, updatedAt: new Date() } }
		);
		locationsUpdated += 1;
	}
	console.log(`Locations updated: ${locationsUpdated} (skipped: ${locationsSkipped})`);

	// Memory images: write a single Wikimedia photo per memory matching its event's location.
	const memoryUpdates = await db.collection("journeyEntries").find({ userId: anna._id }).toArray();
	let memoriesUpdated = 0;
	for (const entry of memoryUpdates) {
		const event = events.find((e) => e._id.toString() === entry.eventId?.toString());
		if (!event) continue;
		const location = await db.collection("locations").findOne({ _id: event.locationId });
		const key = String(location?.name || "").toLowerCase();
		const meta = imageByLocation[key];
		if (!meta) continue;
		await db.collection("journeyEntries").updateOne(
			{ _id: entry._id },
			{
				$set: {
					images: [memoryImage(meta, `${event.title} — memory photo`)],
					updatedAt: new Date()
				}
			}
		);
		memoriesUpdated += 1;
	}
	console.log(`Memories updated: ${memoriesUpdated}`);

	// Also drop the broken avatar (the nav falls back to a coloured initials chip).
	const avatarResult = await db.collection("users").updateOne(
		{ _id: anna._id },
		{ $unset: { avatarUrl: "" }, $currentDate: { updatedAt: true } }
	);
	console.log(`Avatar removed: matched=${avatarResult.matchedCount} modified=${avatarResult.modifiedCount}`);

	console.log("\n✅ Images attached. Reload the browser — events and memories should now show Wikimedia photos.");
} finally {
	await client.close();
}
