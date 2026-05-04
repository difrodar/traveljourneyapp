import { readFileSync, existsSync } from "node:fs";
import { ObjectId, MongoClient } from "mongodb";
import { locationMedia, resolveLocationMedia } from "../src/lib/media.js";

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

function clean(value) {
	return String(value || "").trim();
}

function convertedId(value) {
	if (!value) return null;
	const id = typeof value === "string" ? value : value.toString();
	return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

function isSanFranciscoMedia(doc = {}) {
	return String(doc.imageSourceUrl || "").includes("San_Francisco_golden_gate_bridge");
}

loadLocalEnv();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "triptales";

if (!uri) {
	console.error("MONGODB_URI is missing. Add it to .env before running npm run normalize:idea-media.");
	process.exit(1);
}

const client = new MongoClient(uri);
const now = new Date();

try {
	await client.connect();
	const db = client.db(dbName);
	const travelIdeas = await db.collection("travelIdeas").find({ convertedToEvent: { $ne: false } }).toArray();
	let updated = 0;

	for (const idea of travelIdeas) {
		const eventId = convertedId(idea.convertedToEvent);
		if (!eventId) continue;

		const knownLocationMedia = resolveLocationMedia({
			name: clean(idea.location),
			city: clean(idea.city)
		});
		if (knownLocationMedia) continue;

		const event = await db.collection("events").findOne({ _id: eventId });
		if (!event) continue;

		let location = null;
		if (event.locationId) location = await db.collection("locations").findOne({ _id: event.locationId });

		const hasWrongStoredMedia = isSanFranciscoMedia(event) || isSanFranciscoMedia(location);
		const missingEventMedia = !clean(event.imageUrl);
		if (!hasWrongStoredMedia && !missingEventMedia) continue;

		await db.collection("events").updateOne(
			{ _id: eventId },
			{
				$set: {
					imageUrl: locationMedia.travel.imageUrl,
					imageAlt: locationMedia.travel.imageAlt,
					imageCredit: locationMedia.travel.imageCredit,
					imageLicense: locationMedia.travel.imageLicense,
					imageSourceUrl: locationMedia.travel.imageSourceUrl,
					updatedAt: now
				}
			}
		);
		updated += 1;
	}

	console.log(`Converted idea media normalized without deleting data. Updated ${updated} event(s).`);
} finally {
	await client.close();
}
