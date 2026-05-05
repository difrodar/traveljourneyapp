import { env } from "$env/dynamic/private";
import { MongoClient } from "mongodb";

let clientPromise;

export async function getDb() {
	const uri = env.MONGODB_URI;
	if (!uri) {
		throw new Error("MONGODB_URI is missing. Add it to .env and Netlify environment variables.");
	}

	if (!clientPromise) {
		const client = new MongoClient(uri);
		clientPromise = client.connect();
	}

	const client = await clientPromise;
	return client.db(env.MONGODB_DB || "triptales");
}

export async function getCollections() {
	const db = await getDb();
	return {
		events: db.collection("events"),
		locations: db.collection("locations"),
		friends: db.collection("friends"),
		journeyEntries: db.collection("journeyEntries"),
		travelIdeas: db.collection("travelIdeas"),
		users: db.collection("users"),
		sessions: db.collection("sessions")
	};
}
