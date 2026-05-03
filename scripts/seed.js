import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "triptales";

if (!uri) {
	console.error("MONGODB_URI is missing. Set it before running npm run seed.");
	process.exit(1);
}

const client = new MongoClient(uri);
const now = new Date();

const locations = [
	{
		name: "La Jolla Cove",
		address: "1100 Coast Blvd",
		city: "San Diego",
		country: "USA",
		coordinates: { lat: 32.8507, lng: -117.2729 },
		backgroundType: "ocean",
		createdAt: now,
		updatedAt: now
	},
	{
		name: "Sunset Cliffs",
		address: "Ladera St",
		city: "San Diego",
		country: "USA",
		coordinates: { lat: 32.7353, lng: -117.2558 },
		backgroundType: "beach",
		createdAt: now,
		updatedAt: now
	}
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
				["Mia", "Noah", "Ava"].map((name) => ({
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
					title: "Sunset Cliffs Memory Walk",
					date: "2026-04-10",
					time: "18:00",
					locationId: locationIds[1],
					category: "Outdoor",
					description: "Evening walk with the exchange crew.",
					status: "completed",
					friendIds: [friendIds[2]],
					createdAt: now,
					updatedAt: now
				}
			])
		).insertedIds
	);
	await db.collection("journeyEntries").insertOne({
		eventId: eventIds[1],
		rating: 5,
		memoryText: "The first moment where the semester felt real and beautifully temporary.",
		imageUrl: "",
		createdAt: now,
		updatedAt: now
	});
	await db.collection("travelIdeas").insertOne({
		title: "Weekend Trip to Los Angeles",
		location: "Los Angeles",
		category: "Weekend Trip",
		priority: "High",
		notes: "Plan transport, Griffith Observatory and Venice Beach.",
		convertedToEvent: false,
		createdAt: now,
		updatedAt: now
	});
	console.log("TripTales seed data inserted.");
} finally {
	await client.close();
}
