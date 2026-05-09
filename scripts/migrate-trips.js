import { readFileSync, existsSync } from "node:fs";
import { MongoClient } from "mongodb";

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
	console.error("MONGODB_URI is missing. Add it to .env before running npm run migrate:trips.");
	process.exit(1);
}

const client = new MongoClient(uri);

try {
	await client.connect();
	const db = client.db(dbName);
	await db.collection("trips").createIndex({ userId: 1, createdAt: -1 });
	await db.collection("events").createIndex({ userId: 1, tripId: 1 }, { sparse: true });
	console.log("Trip indexes ensured.");
} finally {
	await client.close();
}
