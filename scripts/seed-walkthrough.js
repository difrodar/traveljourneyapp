#!/usr/bin/env node
// One-off pre-seed for the TripTales walkthrough video.
// Creates two demo users (`demo_anna`, `demo_max`) and fills `demo_anna` with
// representative content for every feature shown in the recording.
// Requires `npm run dev` running on http://localhost:5173.
// Run with: node scripts/seed-walkthrough.js

import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";

const BASE_URL = "http://localhost:5173";
const ANNA = { username: "demo_anna", password: "demo_anna_pw" };
const MAX = { username: "demo_max", password: "demo_max_pw" };

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

// Note: memory images are intentionally NOT uploaded in this seed.
// JourneyCard already falls back to each event's Wikimedia image when the
// memory has no own images, which looks far better than any placeholder.
// The avatar is left unset for the same reason — the nav uses initials.

function makeClient(label) {
	let cookie = "";
	const setCookie = (response) => {
		const header = response.headers.get("set-cookie");
		if (!header) return;
		const match = header.match(/triptales_session=([^;]+)/);
		if (match) cookie = `triptales_session=${match[1]}`;
	};
	async function action(path, name, fields) {
		const fd = new FormData();
		for (const [key, value] of Object.entries(fields)) {
			if (Array.isArray(value)) {
				for (const v of value) {
					if (v instanceof Blob) fd.append(key, v, v.name || "upload.bin");
					else fd.append(key, String(v));
				}
			} else if (value instanceof Blob) {
				fd.append(key, value, value.name || "upload.bin");
			} else if (value !== undefined && value !== null) {
				fd.set(key, String(value));
			}
		}
		const headers = { Origin: BASE_URL };
		if (cookie) headers.Cookie = cookie;
		const response = await fetch(`${BASE_URL}${path}?/${name}`, {
			method: "POST",
			redirect: "manual",
			headers,
			body: fd
		});
		setCookie(response);
		const text = await response.text();
		let envelope;
		try {
			envelope = JSON.parse(text);
		} catch {
			throw new Error(`POST ${path}?/${name} non-JSON (status ${response.status}): ${text.slice(0, 300)}`);
		}
		if (envelope.type === "failure" || envelope.type === "error") {
			throw new Error(`POST ${path}?/${name} ${envelope.type}: ${text.slice(0, 400)}`);
		}
		return envelope;
	}
	return {
		label,
		action,
		async login(creds) {
			const result = await action("/login", "login", { username: creds.username, password: creds.password });
			if (result.type !== "redirect") throw new Error(`[${label}] login unexpected: ${JSON.stringify(result)}`);
		},
		async signup(creds) {
			const result = await action("/login", "signup", { username: creds.username, password: creds.password });
			if (result.type !== "redirect") throw new Error(`[${label}] signup unexpected: ${JSON.stringify(result)}`);
		}
	};
}

async function ensureUser(client, creds) {
	try {
		await client.signup(creds);
		return "created";
	} catch (error) {
		if (/already taken/i.test(error.message)) {
			await client.login(creds);
			return "existing";
		}
		throw error;
	}
}

async function createEvent(client, fields) {
	const result = await client.action("/events/new", "create", {
		repeatFrequency: "none",
		repeatCount: "1",
		status: "planned",
		country: "USA",
		...fields
	});
	const match = result.type === "redirect" ? result.location?.match(/^\/events\/([0-9a-f]+)$/) : null;
	if (!match) throw new Error(`createEvent unexpected: ${JSON.stringify(result)}`);
	return match[1];
}

async function addMemory(client, eventId, memoryText) {
	const result = await client.action(`/events/${eventId}`, "complete", { memoryText });
	if (result.type !== "success") throw new Error(`addMemory unexpected: ${JSON.stringify(result)}`);
}

async function createTrip(client, fields) {
	const result = await client.action("/trips", "create", fields);
	const match = result.type === "redirect" ? result.location?.match(/^\/trips\/([0-9a-f]+)$/) : null;
	if (!match) throw new Error(`createTrip unexpected: ${JSON.stringify(result)}`);
	return match[1];
}

async function createIdea(client, fields) {
	const result = await client.action("/ideas", "create", { priority: "Medium", country: "USA", ...fields });
	if (result.type !== "success") throw new Error(`createIdea unexpected: ${JSON.stringify(result)}`);
}

async function fetchUserId(username) {
	const uri = process.env.MONGODB_URI;
	if (!uri) throw new Error("MONGODB_URI not in env; cannot resolve user id for invitations.");
	const client = new MongoClient(uri);
	try {
		await client.connect();
		const db = client.db(process.env.MONGODB_DB || "triptales");
		const user = await db.collection("users").findOne({ username: username.toLowerCase() });
		if (!user) throw new Error(`User ${username} not found in MongoDB after signup`);
		return user._id.toString();
	} finally {
		await client.close();
	}
}

async function step(name, fn) {
	process.stdout.write(`  ${name}... `);
	try {
		const result = await fn();
		console.log("ok");
		return result;
	} catch (error) {
		console.log("FAIL");
		throw error;
	}
}

async function main() {
	console.log(`TripTales walkthrough pre-seed against ${BASE_URL}`);

	const anna = makeClient("anna");
	const max = makeClient("max");

	console.log("\n[1/4] Signup / login both demo users");
	const annaState = await step("ensure demo_anna", () => ensureUser(anna, ANNA));
	const maxState = await step("ensure demo_max", () => ensureUser(max, MAX));
	console.log(`  demo_anna: ${annaState}, demo_max: ${maxState}`);

	const annaUserId = await step("lookup demo_anna _id", () => fetchUserId(ANNA.username));

	console.log("\n[2/4] Populate demo_anna with events, memories, trip, ideas, avatar");

	// 3 completed past events with memories. Categories chosen to hit
	// distinct Wikimedia fallbacks via locationMedia (category + city).
	const balboaId = await step("past: Balboa Park stroll", () =>
		createEvent(anna, {
			title: "Balboa Park stroll",
			category: "Sightseeing",
			date: "2026-04-20",
			time: "14:00",
			locationName: "Balboa Park",
			city: "San Diego",
			lat: "32.7341",
			lng: "-117.1442",
			description: "Spanish gardens, museums and the botanical building."
		})
	);
	await step("  + memory for Balboa", () =>
		addMemory(anna, balboaId, "Sonniger Nachmittag, Karussell gefahren und im Rosengarten gepicknickt.")
	);

	const tacoId = await step("past: Taco night Gaslamp", () =>
		createEvent(anna, {
			title: "Taco night Gaslamp Quarter",
			category: "Food",
			date: "2026-05-01",
			time: "19:30",
			locationName: "Gaslamp Quarter",
			city: "San Diego",
			lat: "32.7110",
			lng: "-117.1605",
			description: "Street tacos and live music downtown."
		})
	);
	await step("  + memory for Taco", () =>
		addMemory(anna, tacoId, "Beste Carne Asada Tacos — Live-Band auf der 5th Avenue, super Stimmung.", 0xa2)
	);

	const laJollaId = await step("past: La Jolla sunset", () =>
		createEvent(anna, {
			title: "La Jolla Cove sunset walk",
			category: "Outdoor",
			date: "2026-05-08",
			time: "18:45",
			locationName: "La Jolla Cove",
			city: "San Diego",
			lat: "32.8508",
			lng: "-117.2713",
			description: "Seals, kayakers and a postcard sunset."
		})
	);
	await step("  + memory for La Jolla", () =>
		addMemory(anna, laJollaId, "Seelöwen ganz nah, Himmel rosa-orange. Definitiv wieder kommen.", 0xa3)
	);

	// Future event in next 7 days — feeds "Upcoming soon" reminders.
	await step("future: Beach BBQ Coronado (May 18)", () =>
		createEvent(anna, {
			title: "Beach BBQ at Coronado",
			category: "Beach",
			date: "2026-05-18",
			time: "16:00",
			locationName: "Coronado Beach",
			city: "San Diego",
			lat: "32.6859",
			lng: "-117.1831",
			description: "Burgers, frisbee, sunset."
		})
	);

	// Recurring weekly study series — feeds recurring badge + delete-series dialog.
	await step("recurring: weekly study group x4", () =>
		createEvent(anna, {
			title: "Weekly study group",
			category: "Study",
			date: "2026-05-15",
			time: "10:00",
			locationName: "Geisel Library",
			city: "San Diego",
			lat: "32.8810",
			lng: "-117.2370",
			description: "UX research paper review.",
			repeatFrequency: "weekly",
			repeatCount: "4"
		})
	);

	// Trip + 2 trip events.
	const tripId = await step("trip: Italy June 2026", () =>
		createTrip(anna, {
			name: "Italy June 2026",
			dateFrom: "2026-06-15",
			dateTo: "2026-06-22",
			description: "Rome and Florence — pasta, art, gelato."
		})
	);
	const romeId = await step("trip event: Rome Colosseum", () =>
		createEvent(anna, {
			title: "Colosseum guided tour",
			category: "Culture",
			date: "2026-06-16",
			time: "11:00",
			locationName: "Colosseum",
			city: "Rome",
			country: "Italy",
			lat: "41.8902",
			lng: "12.4922",
			description: "Skip-the-line guided tour with arena floor access."
		})
	);
	await step("  attach Rome to trip", () =>
		anna.action(`/trips/${tripId}`, "addEvent", { eventId: romeId })
	);
	const florenceId = await step("trip event: Florence Uffizi", () =>
		createEvent(anna, {
			title: "Uffizi Gallery morning visit",
			category: "Culture",
			date: "2026-06-19",
			time: "09:30",
			locationName: "Uffizi Gallery",
			city: "Florence",
			country: "Italy",
			lat: "43.7678",
			lng: "11.2553",
			description: "Botticelli, Leonardo, Caravaggio."
		})
	);
	await step("  attach Florence to trip", () =>
		anna.action(`/trips/${tripId}`, "addEvent", { eventId: florenceId })
	);

	// 2 travel ideas.
	await step("idea: Tokyo cherry blossoms (High)", () =>
		createIdea(anna, {
			title: "Tokyo cherry blossoms in spring",
			location: "Ueno Park",
			city: "Tokyo",
			country: "Japan",
			category: "Sightseeing",
			priority: "High",
			notes: "End of March, hanami picnic, plan early — flights book up fast."
		})
	);
	await step("idea: Coronado bike ride (Low)", () =>
		createIdea(anna, {
			title: "Coronado island bike ride",
			location: "Coronado Bike Path",
			city: "San Diego",
			category: "Outdoor",
			priority: "Low",
			notes: "Rent cruiser bikes, loop the island, lunch at Hotel del."
		})
	);

	await step("avatar upload", () => uploadAvatar(anna));

	console.log("\n[3/4] demo_max creates an event and invites demo_anna");
	await step("invited event: Vegas weekend (May 22)", () =>
		createEvent(max, {
			title: "Friends weekend in Vegas",
			category: "Weekend Trip",
			date: "2026-05-22",
			time: "17:00",
			locationName: "Las Vegas Strip",
			city: "Las Vegas",
			lat: "36.1147",
			lng: "-115.1728",
			description: "Hotel booked — komm doch mit!",
			invitedUserIds: [annaUserId]
		})
	);

	console.log("\n[4/4] Done");
	console.log("\n✅ Pre-seed complete. Recording is ready to start.");
	console.log("\n  Recording login:");
	console.log(`    URL:      ${BASE_URL}/login`);
	console.log(`    Username: ${ANNA.username}`);
	console.log(`    Password: ${ANNA.password}`);
	console.log("\n  Second user (already used for the pending invitation):");
	console.log(`    Username: ${MAX.username}`);
	console.log(`    Password: ${MAX.password}`);
	console.log("\n  demo_anna should now show:");
	console.log("    • 3 completed events with memories (Apr 20, May 1, May 8)");
	console.log("    • 1 upcoming event (May 18 — Coronado BBQ)");
	console.log("    • 1 weekly recurring series ×4 starting May 15");
	console.log("    • Trip \"Italy June 2026\" with Rome + Florence events");
	console.log("    • 2 ideas (Tokyo High, Coronado Low)");
	console.log("    • Avatar uploaded");
	console.log("    • 1 pending invitation from demo_max (Vegas weekend, May 22)");
}

main().catch((error) => {
	if (error.cause?.code === "ECONNREFUSED") {
		console.error(`\nDev server not reachable at ${BASE_URL}. Start it with \`npm run dev\`.`);
	} else {
		console.error("\n" + (error.stack || error.message));
	}
	process.exit(1);
});
