#!/usr/bin/env node
// Move the Italy trip from the future into the past so it actually shows up
// in /journey?groupBy=trip. The journey timeline only includes events with
// status="completed" + a journeyEntry — the original seed put the trip in
// June 2026 with no memories, so the trip group never appeared.

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

const ROME_META = {
	imageUrl: wikimedia("Colosseo 2020.jpg"),
	imageAlt: "The Colosseum in Rome",
	imageCredit: "Diliff / Wikimedia Commons",
	imageLicense: "CC BY-SA 4.0",
	imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Colosseo_2020.jpg"
};
const FLORENCE_META = {
	imageUrl: wikimedia("Uffizi Gallery, Florence.jpg"),
	imageAlt: "Uffizi Gallery courtyard in Florence",
	imageCredit: "Petar Milošević / Wikimedia Commons",
	imageLicense: "CC BY-SA 4.0",
	imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Uffizi_Gallery,_Florence.jpg"
};

const client = new MongoClient(process.env.MONGODB_URI);
try {
	await client.connect();
	const db = client.db(process.env.MONGODB_DB || "triptales");

	const anna = await db.collection("users").findOne({ username: "demo_anna" });
	if (!anna) {
		console.error("demo_anna not found — run seed-walkthrough.js first.");
		process.exit(1);
	}

	// Find the Italy trip (match by name to stay idempotent across renamings).
	const trip = await db.collection("trips").findOne({
		userId: anna._id,
		name: { $regex: /^italy /i }
	});
	if (!trip) {
		console.error("Italy trip not found for demo_anna.");
		process.exit(1);
	}

	const newTrip = {
		name: "Italy April 2026",
		dateFrom: "2026-04-05",
		dateTo: "2026-04-12",
		description: "Rome and Florence — pasta, art, gelato.",
		updatedAt: new Date()
	};
	await db.collection("trips").updateOne({ _id: trip._id }, { $set: newTrip });
	console.log(`Trip renamed/moved → "${newTrip.name}" (${newTrip.dateFrom} → ${newTrip.dateTo})`);

	// City lives on the location, not the event — resolve via locationId.
	const tripEvents = await db.collection("events").find({ userId: anna._id, tripId: trip._id }).toArray();
	const locationIds = tripEvents.map((event) => event.locationId).filter(Boolean);
	const locations = await db.collection("locations").find({ _id: { $in: locationIds } }).toArray();
	const cityById = new Map(locations.map((location) => [location._id.toString(), location.city]));
	const rome = tripEvents.find((event) => cityById.get(event.locationId?.toString()) === "Rome");
	const florence = tripEvents.find((event) => cityById.get(event.locationId?.toString()) === "Florence");
	if (!rome || !florence) {
		console.error(`Trip events not found. Found ${tripEvents.length} events, cities: ${[...cityById.values()].join(", ") || "(none)"}`);
		process.exit(1);
	}

	await db.collection("events").updateOne(
		{ _id: rome._id },
		{ $set: { date: "2026-04-06", status: "completed", updatedAt: new Date() } }
	);
	await db.collection("events").updateOne(
		{ _id: florence._id },
		{ $set: { date: "2026-04-09", status: "completed", updatedAt: new Date() } }
	);
	console.log("Rome + Florence events marked completed (2026-04-06, 2026-04-09)");

	const now = new Date();
	await db.collection("journeyEntries").findOneAndUpdate(
		{ userId: anna._id, eventId: rome._id },
		{
			$set: {
				memoryText: "Arena-Boden-Tour im Kolosseum, danach Aperitivo am Forum. Beeindruckende Akustik im Inneren.",
				images: [{ url: ROME_META.imageUrl, alt: "Colosseum memory photo", credit: ROME_META.imageCredit, license: ROME_META.imageLicense, sourceUrl: ROME_META.imageSourceUrl }],
				updatedAt: now
			},
			$setOnInsert: { userId: anna._id, eventId: rome._id, createdAt: now }
		},
		{ upsert: true }
	);
	await db.collection("journeyEntries").findOneAndUpdate(
		{ userId: anna._id, eventId: florence._id },
		{
			$set: {
				memoryText: "Uffizien am Morgen, leerer als gedacht. Botticelli-Saal hat uns am längsten gehalten.",
				images: [{ url: FLORENCE_META.imageUrl, alt: "Uffizi memory photo", credit: FLORENCE_META.imageCredit, license: FLORENCE_META.imageLicense, sourceUrl: FLORENCE_META.imageSourceUrl }],
				updatedAt: now
			},
			$setOnInsert: { userId: anna._id, eventId: florence._id, createdAt: now }
		},
		{ upsert: true }
	);
	console.log("Memories upserted for Rome + Florence");

	console.log("\n✅ Italy trip is now in the past. /journey?groupBy=trip should show 'Italy April 2026' as its own group.");
} finally {
	await client.close();
}
