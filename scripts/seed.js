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
	console.error("MONGODB_URI is missing. Add it to .env before running npm run seed.");
	process.exit(1);
}

const client = new MongoClient(uri);
const now = new Date();

function location(name, address, city, country, coordinates, backgroundType) {
	return {
		name,
		address,
		city,
		country,
		coordinates,
		backgroundType,
		...resolveLocationMedia({ name, city, backgroundType }),
		createdAt: now,
		updatedAt: now
	};
}

const locations = [
	location("La Jolla Cove", "1100 Coast Blvd", "San Diego", "USA", { lat: 32.8507, lng: -117.2729 }, "ocean"),
	location("Balboa Park", "1549 El Prado", "San Diego", "USA", { lat: 32.7341, lng: -117.1446 }, "culture"),
	location("Pacific Beach", "Garnet Ave", "San Diego", "USA", { lat: 32.8025, lng: -117.2366 }, "beach"),
	location("Gaslamp Quarter", "Fifth Ave", "San Diego", "USA", { lat: 32.7115, lng: -117.1604 }, "nightlife"),
	location(
		"Griffith Observatory",
		"2800 E Observatory Rd",
		"Los Angeles",
		"USA",
		{ lat: 34.1184, lng: -118.3004 },
		"weekend trip"
	),
	location("Avenida Revolucion", "Zona Centro", "Tijuana", "Mexico", { lat: 32.5325, lng: -117.0386 }, "culture"),
	location(
		"Red Rocks Park and Amphitheatre",
		"18300 W Alameda Pkwy",
		"Morrison",
		"USA",
		{ lat: 39.6654, lng: -105.2057 },
		"outdoor"
	),
	location(
		"Golden Gate Bridge",
		"Golden Gate Bridge",
		"San Francisco",
		"USA",
		{ lat: 37.8199, lng: -122.4783 },
		"sightseeing"
	),
	location("Central Park", "Central Park", "New York City", "USA", { lat: 40.7829, lng: -73.9654 }, "weekend trip")
];

try {
	await client.connect();
	const db = client.db(dbName);
	await db.collection("events").deleteMany({});
	await db.collection("locations").deleteMany({});
	await db.collection("friends").deleteMany({});
	await db.collection("journeyEntries").deleteMany({});
	await db.collection("travelIdeas").deleteMany({});

	const locationIds = Object.values((await db.collection("locations").insertMany(locations)).insertedIds);

	const eventIds = Object.values(
		(
			await db.collection("events").insertMany([
				{
					title: "Sunset Picnic at La Jolla",
					date: "2026-05-18",
					time: "18:30",
					locationId: locationIds[0],
					category: "Beach",
					description: "Watch the sunset after class and take photos near the cliffs.",
					status: "planned",
					invitedUserIds: [],
					createdAt: now,
					updatedAt: now
				},
				{
					title: "Balboa Park Museum Day",
					date: "2026-04-21",
					time: "11:00",
					locationId: locationIds[1],
					category: "Culture",
					description: "Explore the gardens and museums with the exchange group.",
					status: "completed",
					invitedUserIds: [],
					createdAt: now,
					updatedAt: now
				},
				{
					title: "Taco Tuesday in Pacific Beach",
					date: "2026-05-07",
					time: "19:00",
					locationId: locationIds[2],
					category: "Food",
					description: "Dinner after beach volleyball.",
					status: "planned",
					invitedUserIds: [],
					createdAt: now,
					updatedAt: now
				},
				{
					title: "Gaslamp Rooftop Night",
					date: "2026-04-12",
					time: "21:30",
					locationId: locationIds[3],
					category: "Party",
					description: "Rooftop evening downtown after finals week.",
					status: "completed",
					invitedUserIds: [],
					createdAt: now,
					updatedAt: now
				},
				{
					title: "Weekend Trip to Los Angeles",
					date: "2026-06-07",
					time: "07:30",
					locationId: locationIds[4],
					category: "Weekend Trip",
					description: "Roadtrip weekend to Los Angeles with Griffith Observatory, Venice Beach and food stops.",
					status: "planned",
					invitedUserIds: [],
					createdAt: now,
					updatedAt: now
				},
				{
					title: "Day Trip to Tijuana",
					date: "2026-06-01",
					time: "10:00",
					locationId: locationIds[5],
					category: "Culture",
					description: "Cross-border day trip for street food, markets and Avenida Revolucion.",
					status: "planned",
					invitedUserIds: [],
					createdAt: now,
					updatedAt: now
				},
				{
					title: "Denver Mountain Weekend",
					date: "2026-06-14",
					time: "08:00",
					locationId: locationIds[6],
					category: "Weekend Trip",
					description: "Weekend escape to Denver with skyline views and a possible mountain day.",
					status: "planned",
					invitedUserIds: [],
					createdAt: now,
					updatedAt: now
				},
				{
					title: "Golden Gate Photo Walk",
					date: "2026-04-28",
					time: "16:30",
					locationId: locationIds[7],
					category: "Sightseeing",
					description: "Photo walk around the Golden Gate Bridge during golden hour.",
					status: "completed",
					invitedUserIds: [],
					createdAt: now,
					updatedAt: now
				},
				{
					title: "Weekend Trip to NYC",
					date: "2026-07-03",
					time: "07:00",
					locationId: locationIds[8],
					category: "Weekend Trip",
					description: "Long weekend in New York City with skyline views, food stops and museum time.",
					status: "planned",
					invitedUserIds: [],
					createdAt: now,
					updatedAt: now
				}
			])
		).insertedIds
	);

	await db.collection("journeyEntries").insertMany([
		{
			eventId: eventIds[1],
			memoryText: "Balboa Park felt like a whole day of tiny discoveries. The botanical building was the highlight.",
			imageUrl: "",
			createdAt: now,
			updatedAt: now
		},
		{
			eventId: eventIds[3],
			memoryText: "Great skyline view, lots of new people, and one of the first nights where San Diego felt familiar.",
			imageUrl: "",
			createdAt: now,
			updatedAt: now
		},
		{
			eventId: eventIds[7],
			memoryText: "The Golden Gate walk made the journey feel bigger than San Diego. Fog, wind and a lot of photos.",
			imageUrl: "",
			createdAt: now,
			updatedAt: now
		}
	]);

	await db.collection("travelIdeas").insertMany([
		{
			title: "Weekend Trip to Los Angeles",
			location: "Los Angeles",
			city: "Los Angeles",
			country: "USA",
			category: "Weekend Trip",
			priority: "High",
			notes: "Plan transport, Griffith Observatory and Venice Beach.",
			convertedToEvent: false,
			createdAt: now,
			updatedAt: now
		},
		{
			title: "Coronado Beach Bike Ride",
			location: "Coronado Island",
			city: "Coronado",
			country: "USA",
			category: "Outdoor",
			priority: "Medium",
			notes: "Go before sunset and bring a camera.",
			convertedToEvent: false,
			createdAt: now,
			updatedAt: now
		}
	]);
	console.log("TripTales seed data inserted.");
} finally {
	await client.close();
}
