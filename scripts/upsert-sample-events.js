import { readFileSync, existsSync } from "node:fs";
import { MongoClient } from "mongodb";
import { resolveLocationMedia } from "../src/lib/media.js";

function loadLocalEnv() {
	if (!existsSync(".env")) return;
	const lines = readFileSync(".env", "utf8").split(/\r?\n/);
	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
		const [key, ...valueParts] = trimmed.split("=");
		if (!process.env[key]) process.env[key] = valueParts.join("=").trim();
	}
}

loadLocalEnv();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "triptales";

if (!uri) {
	console.error("MONGODB_URI is missing. Add it to .env before running npm run upsert:samples.");
	process.exit(1);
}

const now = new Date();
const client = new MongoClient(uri);

const locationSeeds = [
	{
		key: "losAngeles",
		name: "Griffith Observatory",
		address: "2800 E Observatory Rd",
		city: "Los Angeles",
		country: "USA",
		coordinates: { lat: 34.1184, lng: -118.3004 },
		backgroundType: "weekend trip"
	},
	{
		key: "tijuana",
		name: "Avenida Revolucion",
		address: "Zona Centro",
		city: "Tijuana",
		country: "Mexico",
		coordinates: { lat: 32.5325, lng: -117.0386 },
		backgroundType: "culture"
	},
	{
		key: "denver",
		name: "Red Rocks Park and Amphitheatre",
		address: "18300 W Alameda Pkwy",
		city: "Morrison",
		country: "USA",
		coordinates: { lat: 39.6654, lng: -105.2057 },
		backgroundType: "outdoor"
	},
	{
		key: "sanFrancisco",
		name: "Golden Gate Bridge",
		address: "Golden Gate Bridge",
		city: "San Francisco",
		country: "USA",
		coordinates: { lat: 37.8199, lng: -122.4783 },
		backgroundType: "sightseeing"
	},
	{
		key: "newYorkCity",
		name: "Central Park",
		address: "Central Park",
		city: "New York City",
		country: "USA",
		coordinates: { lat: 40.7829, lng: -73.9654 },
		backgroundType: "weekend trip"
	}
];

const eventSeeds = [
	{
		title: "Weekend Trip to Los Angeles",
		date: "2026-06-07",
		time: "07:30",
		locationKey: "losAngeles",
		category: "Weekend Trip",
		description: "Roadtrip weekend to Los Angeles with Griffith Observatory, Venice Beach and food stops.",
		status: "planned",
		friendNames: ["Mia", "Noah"]
	},
	{
		title: "Day Trip to Tijuana",
		date: "2026-06-01",
		time: "10:00",
		locationKey: "tijuana",
		category: "Culture",
		description: "Cross-border day trip for street food, markets and Avenida Revolucion.",
		status: "planned",
		friendNames: ["Mia", "Luca"]
	},
	{
		title: "Denver Mountain Weekend",
		date: "2026-06-14",
		time: "08:00",
		locationKey: "denver",
		category: "Weekend Trip",
		description: "Weekend escape to Denver with skyline views and a possible mountain day.",
		status: "planned",
		friendNames: ["Noah", "Sofia"]
	},
	{
		title: "Golden Gate Photo Walk",
		date: "2026-04-28",
		time: "16:30",
		locationKey: "sanFrancisco",
		category: "Sightseeing",
		description: "Photo walk around the Golden Gate Bridge during golden hour.",
		status: "completed",
		friendNames: ["Ava", "Luca"],
		journey: {
			rating: 5,
			memoryText:
				"The Golden Gate walk made the journey feel bigger than San Diego. Fog, wind and a lot of photos.",
			imageUrl: ""
		}
	},
	{
		title: "Weekend Trip to NYC",
		date: "2026-07-03",
		time: "07:00",
		locationKey: "newYorkCity",
		category: "Weekend Trip",
		description: "Long weekend in New York City with skyline views, food stops and museum time.",
		status: "planned",
		friendNames: ["Mia", "Noah", "Sofia"]
	}
];

async function upsertFriend(friends, name) {
	const result = await friends.findOneAndUpdate(
		{ name },
		{
			$setOnInsert: { name, invitationStatus: "invited", createdAt: now },
			$set: { updatedAt: now }
		},
		{ upsert: true, returnDocument: "after" }
	);
	return result._id;
}

try {
	await client.connect();
	const db = client.db(dbName);
	const locations = db.collection("locations");
	const events = db.collection("events");
	const friends = db.collection("friends");
	const journeyEntries = db.collection("journeyEntries");

	const locationIds = new Map();

	for (const seed of locationSeeds) {
		const media = resolveLocationMedia(seed);
		const result = await locations.findOneAndUpdate(
			{ name: seed.name, city: seed.city, country: seed.country },
			{
				$set: {
					name: seed.name,
					address: seed.address,
					city: seed.city,
					country: seed.country,
					coordinates: seed.coordinates,
					backgroundType: seed.backgroundType,
					...(media || {}),
					updatedAt: now
				},
				$setOnInsert: { createdAt: now }
			},
			{ upsert: true, returnDocument: "after" }
		);
		locationIds.set(seed.key, result._id);
	}

	for (const seed of eventSeeds) {
		const friendIds = [];
		for (const name of seed.friendNames) {
			friendIds.push(await upsertFriend(friends, name));
		}

		const result = await events.findOneAndUpdate(
			{ title: seed.title },
			{
				$set: {
					title: seed.title,
					date: seed.date,
					time: seed.time,
					locationId: locationIds.get(seed.locationKey),
					category: seed.category,
					description: seed.description,
					status: seed.status,
					friendIds,
					updatedAt: now
				},
				$setOnInsert: { createdAt: now }
			},
			{ upsert: true, returnDocument: "after" }
		);

		if (seed.journey) {
			await journeyEntries.findOneAndUpdate(
				{ eventId: result._id },
				{
					$set: {
						rating: seed.journey.rating,
						memoryText: seed.journey.memoryText,
						imageUrl: seed.journey.imageUrl,
						updatedAt: now
					},
					$setOnInsert: { eventId: result._id, createdAt: now }
				},
				{ upsert: true }
			);
		}
	}

	console.log("Sample events upserted without deleting existing data.");
} finally {
	await client.close();
}
