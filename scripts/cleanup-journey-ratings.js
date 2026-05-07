import { existsSync, readFileSync } from "node:fs";
import { MongoClient } from "mongodb";

function loadLocalEnv() {
	if (!existsSync(".env")) return;
	for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
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
	console.error("MONGODB_URI is missing. Add it to .env before running npm run cleanup:journey-ratings.");
	process.exit(1);
}

const client = new MongoClient(uri);

try {
	await client.connect();
	const db = client.db(dbName);
	const result = await db
		.collection("journeyEntries")
		.updateMany({ rating: { $exists: true } }, { $unset: { rating: "" } });

	console.log(
		JSON.stringify(
			{
				journeyEntriesWithRatingsUpdated: result.modifiedCount
			},
			null,
			2
		)
	);
} finally {
	await client.close();
}
