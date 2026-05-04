import fs from "node:fs";
import { MongoClient } from "mongodb";
import { findCityCoordinates } from "../src/lib/cities.js";

function loadEnv() {
	if (!fs.existsSync(".env")) return;
	for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
		const index = line.indexOf("=");
		if (index > 0 && !line.trim().startsWith("#")) {
			process.env[line.slice(0, index)] = line.slice(index + 1).trim();
		}
	}
}

function hasBadCoordinates(location) {
	if (!location.coordinates) return true;
	return Number(location.coordinates.lat) === 20 && Number(location.coordinates.lng) === 0;
}

loadEnv();

const uri = process.env.MONGODB_URI;
if (!uri) {
	console.error("MONGODB_URI is missing. Add it to .env or your shell environment.");
	process.exit(1);
}

const client = new MongoClient(uri);

try {
	await client.connect();
	const db = client.db(process.env.MONGODB_DB || "triptales");
	const locations = await db.collection("locations").find({}).toArray();
	let updated = 0;
	let skipped = 0;

	for (const location of locations) {
		if (!hasBadCoordinates(location)) continue;
		const coordinates = findCityCoordinates({
			city: location.city || location.name,
			country: location.country || "USA"
		});

		if (!coordinates) {
			skipped += 1;
			continue;
		}

		await db.collection("locations").updateOne(
			{ _id: location._id },
			{
				$set: {
					coordinates,
					updatedAt: new Date()
				}
			}
		);
		updated += 1;
	}

	console.log(`City coordinate normalization complete. Updated: ${updated}. Skipped without match: ${skipped}.`);
} finally {
	await client.close();
}
