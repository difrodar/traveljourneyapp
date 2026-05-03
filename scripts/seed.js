import { MongoClient } from "mongodb";
import { resolveLocationMedia } from "../src/lib/media.js";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "triptales";

if (!uri) {
	console.error("MONGODB_URI is missing. Set it before running npm run seed.");
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
	location("Tijuana", "Zona Centro", "Tijuana", "Mexico", { lat: 32.5149, lng: -117.0382 }, "culture"),
	location("Denver", "Downtown Denver", "Denver", "USA", { lat: 39.7392, lng: -104.9903 }, "outdoor"),
	location(
		"San Francisco",
		"Golden Gate Bridge",
		"San Francisco",
		"USA",
		{ lat: 37.7749, lng: -122.4194 },
		"sightseeing"
	),
	location("New York City", "Manhattan", "New York City", "USA", { lat: 40.7128, lng: -74.006 }, "weekend trip")
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
	const friendIds = Object.values(
		(
			await db.collection("friends").insertMany(
				["Mia", "Noah", "Ava", "Luca", "Sofia"].map((name) => ({
					name,
					invitationStatus: "invited",
					createdAt: now,
					updatedAt: now
				}))
			)
		).insertedIds
	);

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
					friendIds: [friendIds[0], friendIds[1]],
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
					friendIds: [friendIds[2], friendIds[3]],
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
					friendIds: [friendIds[0], friendIds[4]],
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
					friendIds: [friendIds[1], friendIds[2], friendIds[4]],
					createdAt: now,
					updatedAt: now
				},
				{
					title: "Day Trip to Tijuana",
					date: "2026-06-01",
					time: "10:00",
					locationId: locationIds[4],
					category: "Culture",
					description: "Cross-border day trip for street food, markets and Avenida Revolucion.",
					status: "planned",
					friendIds: [friendIds[0], friendIds[3]],
					createdAt: now,
					updatedAt: now
				},
				{
					title: "Denver Mountain Weekend",
					date: "2026-06-14",
					time: "08:00",
					locationId: locationIds[5],
					category: "Weekend Trip",
					description: "Weekend escape to Denver with skyline views and a possible mountain day.",
					status: "planned",
					friendIds: [friendIds[1], friendIds[4]],
					createdAt: now,
					updatedAt: now
				},
				{
					title: "Golden Gate Photo Walk",
					date: "2026-04-28",
					time: "16:30",
					locationId: locationIds[6],
					category: "Sightseeing",
					description: "Photo walk around the Golden Gate Bridge during golden hour.",
					status: "completed",
					friendIds: [friendIds[2], friendIds[3]],
					createdAt: now,
					updatedAt: now
				},
				{
					title: "Weekend Trip to NYC",
					date: "2026-07-03",
					time: "07:00",
					locationId: locationIds[7],
					category: "Weekend Trip",
					description: "Long weekend in New York City with skyline views, food stops and museum time.",
					status: "planned",
					friendIds: [friendIds[0], friendIds[1], friendIds[4]],
					createdAt: now,
					updatedAt: now
				}
			])
		).insertedIds
	);

	await db.collection("journeyEntries").insertMany([
		{
			eventId: eventIds[1],
			rating: 5,
			memoryText: "Balboa Park felt like a whole day of tiny discoveries. The botanical building was the highlight.",
			imageUrl: "",
			createdAt: now,
			updatedAt: now
		},
		{
			eventId: eventIds[3],
			rating: 4,
			memoryText: "Great skyline view, lots of new people, and one of the first nights where San Diego felt familiar.",
			imageUrl: "",
			createdAt: now,
			updatedAt: now
		},
		{
			eventId: eventIds[6],
			rating: 5,
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
