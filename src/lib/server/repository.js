import { ObjectId } from "mongodb";
import { getCollections } from "./db.js";

const fallbackCoordinates = {
	"la jolla cove": { lat: 32.8507, lng: -117.2729 },
	"balboa park": { lat: 32.7341, lng: -117.1446 },
	"pacific beach": { lat: 32.8025, lng: -117.2366 },
	"coronado island": { lat: 32.6859, lng: -117.1831 },
	"gaslamp quarter": { lat: 32.7115, lng: -117.1604 },
	"sunset cliffs": { lat: 32.7353, lng: -117.2558 },
	"los angeles": { lat: 34.0522, lng: -118.2437 }
};

function oid(id) {
	return id && ObjectId.isValid(id) ? new ObjectId(id) : null;
}

function clean(value) {
	return String(value || "").trim();
}

function serialize(doc) {
	if (!doc) return null;
	const copy = { ...doc, id: doc._id.toString() };
	delete copy._id;
	for (const key of Object.keys(copy)) {
		if (copy[key] instanceof ObjectId) copy[key] = copy[key].toString();
		if (copy[key] instanceof Date) copy[key] = copy[key].toISOString();
		if (Array.isArray(copy[key])) {
			copy[key] = copy[key].map((item) => (item instanceof ObjectId ? item.toString() : item));
		}
	}
	return copy;
}

function parseFriendNames(value) {
	return clean(value)
		.split(",")
		.map((name) => name.trim())
		.filter(Boolean);
}

function defaultCoordinates(name, lat, lng) {
	const parsedLat = Number(lat);
	const parsedLng = Number(lng);
	if (Number.isFinite(parsedLat) && Number.isFinite(parsedLng)) return { lat: parsedLat, lng: parsedLng };
	return fallbackCoordinates[name.toLowerCase()] || { lat: 32.7157, lng: -117.1611 };
}

async function ensureIndexes(collections) {
	await Promise.all([
		collections.events.createIndex({ date: 1 }),
		collections.locations.createIndex({ name: 1, city: 1 }),
		collections.friends.createIndex({ name: 1 }, { unique: true }),
		collections.journeyEntries.createIndex({ eventId: 1 }, { unique: true }),
		collections.travelIdeas.createIndex({ priority: 1 })
	]);
}

export async function seedIfEmpty() {
	const collections = await getCollections();
	await ensureIndexes(collections);
	if ((await collections.events.countDocuments()) > 0) return;

	const now = new Date();
	const locations = [
		["La Jolla Cove", "1100 Coast Blvd", "San Diego", "ocean", fallbackCoordinates["la jolla cove"]],
		["Balboa Park", "1549 El Prado", "San Diego", "culture", fallbackCoordinates["balboa park"]],
		["Pacific Beach", "Garnet Ave", "San Diego", "beach", fallbackCoordinates["pacific beach"]],
		["Gaslamp Quarter", "Fifth Ave", "San Diego", "nightlife", fallbackCoordinates["gaslamp quarter"]]
	].map(([name, address, city, backgroundType, coordinates]) => ({
		name,
		address,
		city,
		country: "USA",
		coordinates,
		backgroundType,
		createdAt: now,
		updatedAt: now
	}));
	const locationIds = Object.values((await collections.locations.insertMany(locations)).insertedIds);

	const friendIds = Object.values(
		(
			await collections.friends.insertMany(
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
			await collections.events.insertMany([
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
				}
			])
		).insertedIds
	);

	await collections.journeyEntries.insertMany([
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
		}
	]);

	await collections.travelIdeas.insertMany([
		{
			title: "Weekend Trip to Los Angeles",
			location: "Los Angeles",
			category: "Weekend Trip",
			priority: "High",
			notes: "Plan car rental, Griffith Observatory and Venice Beach.",
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
}

async function hydrateEvents(events) {
	const collections = await getCollections();
	const locationIds = events.map((event) => event.locationId).filter(Boolean);
	const friendIds = events.flatMap((event) => event.friendIds || []).filter(Boolean);
	const eventIds = events.map((event) => event._id);
	const [locations, friends, journeyEntries] = await Promise.all([
		collections.locations.find({ _id: { $in: locationIds } }).toArray(),
		collections.friends.find({ _id: { $in: friendIds } }).toArray(),
		collections.journeyEntries.find({ eventId: { $in: eventIds } }).toArray()
	]);
	const locationMap = new Map(locations.map((location) => [location._id.toString(), serialize(location)]));
	const friendMap = new Map(friends.map((friend) => [friend._id.toString(), serialize(friend)]));
	const journeyMap = new Map(journeyEntries.map((entry) => [entry.eventId.toString(), serialize(entry)]));

	return events.map((event) => ({
		...serialize(event),
		location: locationMap.get(event.locationId?.toString()) || null,
		friends: (event.friendIds || []).map((id) => friendMap.get(id.toString())).filter(Boolean),
		journeyEntry: journeyMap.get(event._id.toString()) || null
	}));
}

export async function listEvents(filters = {}) {
	await seedIfEmpty();
	const collections = await getCollections();
	const query = {};
	if (filters.status && filters.status !== "all") query.status = filters.status;
	if (filters.category && filters.category !== "all") query.category = filters.category;
	if (filters.search) query.title = { $regex: filters.search, $options: "i" };
	const direction = filters.sort === "desc" ? -1 : 1;
	return hydrateEvents(await collections.events.find(query).sort({ date: direction, time: direction }).toArray());
}

export async function getDashboardData() {
	const events = await listEvents({ sort: "asc" });
	const completed = events.filter((event) => event.status === "completed");
	const planned = events.filter((event) => event.status === "planned");
	const ratings = completed.map((event) => event.journeyEntry?.rating).filter(Boolean);
	const averageRating = ratings.length
		? Math.round((ratings.reduce((sum, rating) => sum + Number(rating), 0) / ratings.length) * 10) / 10
		: 0;
	return {
		upcomingEvents: planned.slice(0, 4),
		journeyHighlights: completed.slice(0, 3),
		stats: {
			events: events.length,
			locations: (await listLocations()).length,
			averageRating,
			ideas: (await listIdeas()).length
		}
	};
}

export async function getEvent(id) {
	await seedIfEmpty();
	const eventId = oid(id);
	if (!eventId) return null;
	const collections = await getCollections();
	const event = await collections.events.findOne({ _id: eventId });
	if (!event) return null;
	const [hydrated] = await hydrateEvents([event]);
	return hydrated;
}

export function validateEventForm(form) {
	const errors = [];
	for (const field of ["title", "date", "time", "locationName", "category"]) {
		if (!clean(form.get(field))) errors.push(`${field} is required.`);
	}
	return errors;
}

async function ensureFriends(names) {
	const collections = await getCollections();
	const ids = [];
	for (const name of names) {
		const now = new Date();
		const result = await collections.friends.findOneAndUpdate(
			{ name },
			{ $setOnInsert: { name, invitationStatus: "invited", createdAt: now }, $set: { updatedAt: now } },
			{ upsert: true, returnDocument: "after" }
		);
		ids.push(result._id);
	}
	return ids;
}

async function saveLocationFromForm(form, existingId = null) {
	const collections = await getCollections();
	const now = new Date();
	const name = clean(form.get("locationName"));
	const location = {
		name,
		address: clean(form.get("address")),
		city: clean(form.get("city")) || "San Diego",
		country: clean(form.get("country")) || "USA",
		coordinates: defaultCoordinates(name, form.get("lat"), form.get("lng")),
		backgroundType: clean(form.get("backgroundType")) || clean(form.get("category")).toLowerCase(),
		updatedAt: now
	};
	if (existingId && oid(existingId)) {
		await collections.locations.updateOne({ _id: oid(existingId) }, { $set: location });
		return oid(existingId);
	}
	return (await collections.locations.insertOne({ ...location, createdAt: now })).insertedId;
}

function eventPayloadFromForm(form, locationId, friendIds) {
	return {
		title: clean(form.get("title")),
		date: clean(form.get("date")),
		time: clean(form.get("time")),
		locationId,
		category: clean(form.get("category")),
		description: clean(form.get("description")),
		status: clean(form.get("status")) === "completed" ? "completed" : "planned",
		friendIds,
		updatedAt: new Date()
	};
}

export async function createEventFromForm(form) {
	const collections = await getCollections();
	const friendIds = await ensureFriends(parseFriendNames(form.get("friendNames")));
	const locationId = await saveLocationFromForm(form);
	const result = await collections.events.insertOne({
		...eventPayloadFromForm(form, locationId, friendIds),
		createdAt: new Date()
	});
	return result.insertedId.toString();
}

export async function updateEventFromForm(id, form) {
	const collections = await getCollections();
	const event = await collections.events.findOne({ _id: oid(id) });
	if (!event) throw new Error("Event not found.");
	const friendIds = await ensureFriends(parseFriendNames(form.get("friendNames")));
	const locationId = await saveLocationFromForm(form, event.locationId?.toString());
	await collections.events.updateOne({ _id: oid(id) }, { $set: eventPayloadFromForm(form, locationId, friendIds) });
}

export async function deleteEvent(id) {
	const collections = await getCollections();
	const eventId = oid(id);
	await Promise.all([
		collections.events.deleteOne({ _id: eventId }),
		collections.journeyEntries.deleteOne({ eventId })
	]);
}

export async function completeEventFromForm(id, form) {
	const collections = await getCollections();
	const eventId = oid(id);
	const now = new Date();
	await collections.events.updateOne({ _id: eventId }, { $set: { status: "completed", updatedAt: now } });
	await collections.journeyEntries.findOneAndUpdate(
		{ eventId },
		{
			$set: {
				rating: Number(form.get("rating") || 0),
				memoryText: clean(form.get("memoryText")),
				imageUrl: clean(form.get("imageUrl")),
				updatedAt: now
			},
			$setOnInsert: { eventId, createdAt: now }
		},
		{ upsert: true }
	);
}

export async function listJourneyEntries(filters = {}) {
	const events = await listEvents({ status: "completed", sort: "desc", category: filters.category });
	const minRating = Number(filters.minRating || 0);
	return events.filter((event) => event.journeyEntry && Number(event.journeyEntry.rating || 0) >= minRating);
}

export async function listLocations() {
	await seedIfEmpty();
	const collections = await getCollections();
	const [locations, events] = await Promise.all([
		collections.locations.find({}).sort({ name: 1 }).toArray(),
		listEvents({})
	]);
	return locations.map((location) => {
		const serialized = serialize(location);
		return { ...serialized, events: events.filter((event) => event.locationId === serialized.id) };
	});
}

export async function listIdeas() {
	await seedIfEmpty();
	const collections = await getCollections();
	return (await collections.travelIdeas.find({}).sort({ createdAt: -1 }).toArray()).map(serialize);
}

export async function createIdeaFromForm(form) {
	const collections = await getCollections();
	const now = new Date();
	await collections.travelIdeas.insertOne({
		title: clean(form.get("title")),
		location: clean(form.get("location")),
		category: clean(form.get("category")),
		priority: clean(form.get("priority")) || "Medium",
		notes: clean(form.get("notes")),
		convertedToEvent: false,
		createdAt: now,
		updatedAt: now
	});
}

export async function deleteIdea(id) {
	const collections = await getCollections();
	await collections.travelIdeas.deleteOne({ _id: oid(id) });
}

export async function convertIdeaToEvent(id) {
	const collections = await getCollections();
	const idea = await collections.travelIdeas.findOne({ _id: oid(id) });
	if (!idea) throw new Error("Idea not found.");
	const form = new FormData();
	form.set("title", idea.title);
	form.set("date", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
	form.set("time", "18:00");
	form.set("locationName", idea.location);
	form.set("address", "");
	form.set("city", idea.location === "Los Angeles" ? "Los Angeles" : "San Diego");
	form.set("country", "USA");
	form.set("category", idea.category);
	form.set("description", idea.notes);
	form.set("friendNames", "");
	const eventId = await createEventFromForm(form);
	await collections.travelIdeas.updateOne(
		{ _id: oid(id) },
		{ $set: { convertedToEvent: eventId, updatedAt: new Date() } }
	);
	return eventId;
}
