import crypto from "node:crypto";
import { getCollections } from "../db.js";
import { clean, oid, userOid } from "./shared.js";
import { getJourneyDiaryData } from "./journey.js";

const RATE_LIMIT_PER_DAY = 10;
const EXPIRY_OPTIONS = {
	"1d": 86_400_000,
	"7d": 7 * 86_400_000,
	"30d": 30 * 86_400_000,
	never: null
};

function startOfTodayUTC() {
	const now = new Date();
	return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function createShare(userId, { expiresIn = "never", tripId = "" } = {}) {
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const todayCount = await collections.shares.countDocuments({
		userId: ownerId,
		createdAt: { $gte: startOfTodayUTC() }
	});
	if (todayCount >= RATE_LIMIT_PER_DAY) {
		throw new Error(`Share limit reached: ${RATE_LIMIT_PER_DAY} share links per day.`);
	}
	if (!Object.prototype.hasOwnProperty.call(EXPIRY_OPTIONS, expiresIn)) {
		throw new Error("Unknown expiry option.");
	}
	let tripObjectId = null;
	const tripIdValue = clean(tripId);
	if (tripIdValue) {
		tripObjectId = oid(tripIdValue);
		if (!tripObjectId) throw new Error("Invalid trip.");
		const trip = await collections.trips.findOne({ userId: ownerId, _id: tripObjectId });
		if (!trip) throw new Error("Trip not found.");
	}
	const offset = EXPIRY_OPTIONS[expiresIn];
	const now = new Date();
	const doc = {
		userId: ownerId,
		hash: crypto.randomBytes(16).toString("hex"),
		tripId: tripObjectId,
		expiresAt: offset === null ? null : new Date(now.getTime() + offset),
		revokedAt: null,
		createdAt: now,
		updatedAt: now
	};
	await collections.shares.insertOne(doc);
	return { hash: doc.hash, expiresAt: doc.expiresAt, tripId: tripObjectId?.toString() || null };
}

export async function findActiveShareByHash(hash) {
	const cleaned = clean(hash);
	if (!/^[a-f0-9]{32}$/.test(cleaned)) return null;
	const collections = await getCollections();
	const now = new Date();
	return collections.shares.findOne({
		hash: cleaned,
		revokedAt: null,
		$or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
	});
}

export async function listSharesForUser(userId) {
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const docs = await collections.shares
		.find({ userId: ownerId, revokedAt: null })
		.sort({ createdAt: -1 })
		.toArray();
	const tripIds = docs.map((doc) => doc.tripId).filter(Boolean);
	const trips = tripIds.length
		? await collections.trips.find({ userId: ownerId, _id: { $in: tripIds } }).toArray()
		: [];
	const tripMap = new Map(trips.map((trip) => [trip._id.toString(), trip.name]));
	return docs.map((doc) => ({
		hash: doc.hash,
		tripId: doc.tripId?.toString() || null,
		tripName: doc.tripId ? tripMap.get(doc.tripId.toString()) || null : null,
		expiresAt: doc.expiresAt ? doc.expiresAt.toISOString() : null,
		createdAt: doc.createdAt.toISOString(),
		isExpired: Boolean(doc.expiresAt && doc.expiresAt <= new Date())
	}));
}

export async function revokeShare(userId, hash) {
	const collections = await getCollections();
	const ownerId = userOid(userId);
	await collections.shares.updateOne(
		{ userId: ownerId, hash: clean(hash) },
		{ $set: { revokedAt: new Date(), updatedAt: new Date() } }
	);
}

// WHITELIST — only these keys reach the public route. Future fields on the
// upstream event/journey shape are omitted by default. NEVER convert this to
// a denylist.
function publicEventShape(event) {
	return {
		id: event.id,
		title: event.title,
		category: event.category,
		date: event.date,
		time: event.time,
		description: event.description,
		location: event.location && {
			name: event.location.name,
			city: event.location.city,
			country: event.location.country,
			coordinates: event.location.coordinates,
			media: {
				images: (event.location.media?.images || []).map((img) => ({
					url: img.url,
					alt: img.alt || "",
					credit: img.credit || "",
					license: img.license || "",
					sourceUrl: img.sourceUrl || ""
				}))
			}
		},
		media: {
			images: (event.media?.images || []).map((img) => ({
				url: img.url,
				alt: img.alt || "",
				credit: img.credit || "",
				license: img.license || "",
				sourceUrl: img.sourceUrl || ""
			}))
		},
		journeyEntry: event.journeyEntry && {
			memoryText: event.journeyEntry.memoryText,
			images: (event.journeyEntry.images || []).map((img) => ({
				url: img.url,
				alt: img.alt || ""
			}))
		}
	};
}

export async function getPublicJourneyForShare(share) {
	const filters = share.tripId ? { tripId: share.tripId.toString() } : {};
	const data = await getJourneyDiaryData(share.userId, filters);
	let tripName = null;
	if (share.tripId) {
		const collections = await getCollections();
		const trip = await collections.trips.findOne({ userId: share.userId, _id: share.tripId });
		tripName = trip?.name || null;
	}
	return {
		scope: share.tripId ? "trip" : "journey",
		tripName,
		entries: data.entries.map(publicEventShape),
		groups: data.groups.map((group) => ({
			key: group.key,
			label: group.label,
			memoryCount: group.memoryCount,
			entries: group.entries.map(publicEventShape)
		})),
		stats: data.stats,
		recentHighlights: data.recentHighlights.map(publicEventShape)
	};
}
