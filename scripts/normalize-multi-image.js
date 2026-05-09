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
	console.error("MONGODB_URI is missing. Add it to .env before running npm run normalize:multi-image.");
	process.exit(1);
}

const client = new MongoClient(uri);
const now = new Date();

try {
	await client.connect();
	const db = client.db(dbName);

	// Events: imageUrl + imageAlt/Credit/License/SourceUrl -> images[0]
	const events = await db
		.collection("events")
		.find({ imageUrl: { $exists: true, $ne: "" } })
		.toArray();
	let eventsMigrated = 0;
	for (const event of events) {
		const url = String(event.imageUrl || "").trim();
		if (!url) continue;
		const existingImages = Array.isArray(event.images) ? event.images : [];
		if (existingImages.some((img) => img && img.url === url)) {
			// already migrated; just unset legacy fields
			await db.collection("events").updateOne(
				{ _id: event._id },
				{
					$unset: { imageUrl: "", imageAlt: "", imageCredit: "", imageLicense: "", imageSourceUrl: "" },
					$set: { updatedAt: now }
				}
			);
			continue;
		}
		const migrated = {
			url,
			alt: String(event.imageAlt || event.title || "").trim(),
			credit: String(event.imageCredit || "").trim(),
			license: String(event.imageLicense || "").trim(),
			sourceUrl: String(event.imageSourceUrl || "").trim()
		};
		await db.collection("events").updateOne(
			{ _id: event._id },
			{
				$set: { images: [migrated, ...existingImages], updatedAt: now },
				$unset: { imageUrl: "", imageAlt: "", imageCredit: "", imageLicense: "", imageSourceUrl: "" }
			}
		);
		eventsMigrated += 1;
	}

	// Journey entries: imageUrl -> images[0] (just url + alt)
	const entries = await db
		.collection("journeyEntries")
		.find({ imageUrl: { $exists: true, $ne: "" } })
		.toArray();
	let entriesMigrated = 0;
	for (const entry of entries) {
		const url = String(entry.imageUrl || "").trim();
		if (!url) continue;
		const existingImages = Array.isArray(entry.images) ? entry.images : [];
		if (existingImages.some((img) => img && img.url === url)) {
			await db.collection("journeyEntries").updateOne(
				{ _id: entry._id },
				{
					$unset: { imageUrl: "", imageAlt: "" },
					$set: { updatedAt: now }
				}
			);
			continue;
		}
		const migrated = { url, alt: String(entry.imageAlt || "").trim() };
		await db.collection("journeyEntries").updateOne(
			{ _id: entry._id },
			{
				$set: { images: [migrated, ...existingImages], updatedAt: now },
				$unset: { imageUrl: "", imageAlt: "" }
			}
		);
		entriesMigrated += 1;
	}

	console.log(`Multi-image migration complete. Events migrated: ${eventsMigrated}. Journey entries migrated: ${entriesMigrated}.`);
} finally {
	await client.close();
}
