import { getCollections } from "../db.js";
import { listEvents } from "./events.js";
import { clean, isDateFilter, oid, serialize, userOid } from "./shared.js";

export async function createTrip(userId, { name, description = "", dateFrom = "", dateTo = "" }) {
	const cleanName = clean(name);
	if (!cleanName) throw new Error("Trip name is required.");
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const now = new Date();
	const result = await collections.trips.insertOne({
		userId: ownerId,
		name: cleanName,
		description: clean(description),
		dateFrom: isDateFilter(dateFrom) ? clean(dateFrom) : "",
		dateTo: isDateFilter(dateTo) ? clean(dateTo) : "",
		createdAt: now,
		updatedAt: now
	});
	return result.insertedId.toString();
}

export async function updateTrip(userId, id, { name, description = "", dateFrom = "", dateTo = "" }) {
	const cleanName = clean(name);
	if (!cleanName) throw new Error("Trip name is required.");
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const _id = oid(id);
	if (!_id) throw new Error("Trip not found.");
	const result = await collections.trips.updateOne(
		{ userId: ownerId, _id },
		{
			$set: {
				name: cleanName,
				description: clean(description),
				dateFrom: isDateFilter(dateFrom) ? clean(dateFrom) : "",
				dateTo: isDateFilter(dateTo) ? clean(dateTo) : "",
				updatedAt: new Date()
			}
		}
	);
	if (result.matchedCount === 0) throw new Error("Trip not found.");
}

export async function deleteTrip(userId, id) {
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const _id = oid(id);
	if (!_id) throw new Error("Trip not found.");
	await collections.events.updateMany(
		{ userId: ownerId, tripId: _id },
		{ $unset: { tripId: "" }, $set: { updatedAt: new Date() } }
	);
	await collections.trips.deleteOne({ userId: ownerId, _id });
}

export async function getTrip(userId, id) {
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const _id = oid(id);
	if (!_id) return null;
	const trip = await collections.trips.findOne({ userId: ownerId, _id });
	return trip ? serialize(trip) : null;
}

export async function listTrips(userId) {
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const trips = await collections.trips.find({ userId: ownerId }).sort({ createdAt: -1 }).toArray();
	if (!trips.length) return [];
	const tripIds = trips.map((trip) => trip._id);
	const events = await collections.events
		.find({ userId: ownerId, tripId: { $in: tripIds } })
		.project({ tripId: 1, status: 1, locationId: 1, category: 1 })
		.toArray();
	return trips.map((trip) => {
		const tripEvents = events.filter((event) => event.tripId?.toString() === trip._id.toString());
		return {
			...serialize(trip),
			eventCount: tripEvents.length,
			memoryCount: tripEvents.filter((event) => event.status === "completed").length
		};
	});
}

export async function getTripDetail(userId, id) {
	const trip = await getTrip(userId, id);
	if (!trip) return null;
	const events = await listEvents(userId, { tripId: id, sort: "dateAsc" });
	const memoryCount = events.filter((event) => event.journeyEntry).length;
	const countries = new Set();
	const categoryCounts = new Map();
	for (const event of events) {
		if (event.location?.country) countries.add(event.location.country);
		if (event.category) categoryCounts.set(event.category, (categoryCounts.get(event.category) || 0) + 1);
	}
	const topCategory =
		[...categoryCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] || "None";
	const locationMap = new Map();
	for (const event of events) {
		if (!event.location?.id) continue;
		if (!locationMap.has(event.location.id)) {
			locationMap.set(event.location.id, { ...event.location, events: [] });
		}
		locationMap.get(event.location.id).events.push(event);
	}
	return {
		trip,
		events,
		stats: {
			eventCount: events.length,
			memoryCount,
			countriesVisited: countries.size,
			topCategory
		},
		locations: [...locationMap.values()]
	};
}

export async function addEventToTrip(userId, tripId, eventId) {
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const trip_id = oid(tripId);
	const event_id = oid(eventId);
	if (!trip_id || !event_id) throw new Error("Invalid trip or event.");
	const trip = await collections.trips.findOne({ userId: ownerId, _id: trip_id });
	if (!trip) throw new Error("Trip not found.");
	const result = await collections.events.updateOne(
		{ userId: ownerId, _id: event_id },
		{ $set: { tripId: trip_id, updatedAt: new Date() } }
	);
	if (result.matchedCount === 0) throw new Error("Event not found.");
}

export async function removeEventFromTrip(userId, eventId) {
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const event_id = oid(eventId);
	if (!event_id) throw new Error("Invalid event.");
	await collections.events.updateOne(
		{ userId: ownerId, _id: event_id },
		{ $unset: { tripId: "" }, $set: { updatedAt: new Date() } }
	);
}
