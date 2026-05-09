import { resolveLocationMedia } from "$lib/media.js";
import { getCollections } from "../db.js";
import { fallbackCoordinates, userOid } from "./shared.js";

async function ensureIndexes(collections) {
	const friendIndexes = await collections.friends.indexes();
	const globalFriendIndex = friendIndexes.find(
		(index) => index.name === "name_1" && index.unique && index.key?.name === 1 && !index.key?.userId
	);
	if (globalFriendIndex) await collections.friends.dropIndex(globalFriendIndex.name);

	await Promise.all([
		collections.events.createIndex({ userId: 1, date: 1 }),
		collections.events.createIndex({ userId: 1, updatedAt: -1 }),
		collections.locations.createIndex({ userId: 1, name: 1, city: 1 }),
		collections.friends.createIndex({ userId: 1, name: 1 }, { unique: true }),
		collections.journeyEntries.createIndex({ userId: 1, eventId: 1 }, { unique: true }),
		collections.travelIdeas.createIndex({ userId: 1, priority: 1 }),
		collections.shares.createIndex({ hash: 1 }, { unique: true }),
		collections.shares.createIndex({ userId: 1, createdAt: -1 }),
		collections.trips.createIndex({ userId: 1, createdAt: -1 }),
		collections.events.createIndex({ userId: 1, tripId: 1 }, { sparse: true })
	]);
}

async function seedDemoData(userId) {
	const collections = await getCollections();
	const ownerId = userOid(userId);

	const now = new Date();
	const locations = [
		["La Jolla Cove", "1100 Coast Blvd", "San Diego", "ocean", fallbackCoordinates["la jolla cove"]],
		["Balboa Park", "1549 El Prado", "San Diego", "culture", fallbackCoordinates["balboa park"]],
		["Pacific Beach", "Garnet Ave", "San Diego", "beach", fallbackCoordinates["pacific beach"]],
		["Gaslamp Quarter", "Fifth Ave", "San Diego", "nightlife", fallbackCoordinates["gaslamp quarter"]],
		[
			"Griffith Observatory",
			"2800 E Observatory Rd",
			"Los Angeles",
			"weekend trip",
			fallbackCoordinates["griffith observatory"],
			"USA"
		],
		["Avenida Revolucion", "Zona Centro", "Tijuana", "culture", fallbackCoordinates["avenida revolucion"], "Mexico"],
		[
			"Red Rocks Park and Amphitheatre",
			"18300 W Alameda Pkwy",
			"Morrison",
			"outdoor",
			fallbackCoordinates["red rocks park and amphitheatre"],
			"USA"
		],
		[
			"Golden Gate Bridge",
			"Golden Gate Bridge",
			"San Francisco",
			"sightseeing",
			fallbackCoordinates["golden gate bridge"],
			"USA"
		],
		["Central Park", "Central Park", "New York City", "weekend trip", fallbackCoordinates["central park"], "USA"]
	].map(([name, address, city, backgroundType, coordinates, country = "USA"]) => ({
		name,
		userId: ownerId,
		address,
		city,
		country,
		coordinates,
		backgroundType,
		...resolveLocationMedia({ name, city, backgroundType }),
		createdAt: now,
		updatedAt: now
	}));
	const locationIds = Object.values((await collections.locations.insertMany(locations)).insertedIds);

	const eventIds = Object.values(
		(
			await collections.events.insertMany([
				{
					title: "Sunset Picnic at La Jolla",
					userId: ownerId,
					date: "2026-05-18",
					time: "18:30",
					locationId: locationIds[0],
					category: "Beach",
					description: "Watch the sunset after class and take photos near the cliffs.",
					status: "planned",
					invitedUserIds: [],
					createdAt: now,
					updatedAt: now
				},
				{
					title: "Balboa Park Museum Day",
					userId: ownerId,
					date: "2026-04-21",
					time: "11:00",
					locationId: locationIds[1],
					category: "Culture",
					description: "Explore the gardens and museums with the exchange group.",
					status: "completed",
					invitedUserIds: [],
					createdAt: now,
					updatedAt: now
				},
				{
					title: "Taco Tuesday in Pacific Beach",
					userId: ownerId,
					date: "2026-05-07",
					time: "19:00",
					locationId: locationIds[2],
					category: "Food",
					description: "Dinner after beach volleyball.",
					status: "planned",
					invitedUserIds: [],
					createdAt: now,
					updatedAt: now
				},
				{
					title: "Gaslamp Rooftop Night",
					userId: ownerId,
					date: "2026-04-12",
					time: "21:30",
					locationId: locationIds[3],
					category: "Party",
					description: "Rooftop evening downtown after finals week.",
					status: "completed",
					invitedUserIds: [],
					createdAt: now,
					updatedAt: now
				},
				{
					title: "Weekend Trip to Los Angeles",
					userId: ownerId,
					date: "2026-06-07",
					time: "07:30",
					locationId: locationIds[4],
					category: "Weekend Trip",
					description: "Roadtrip weekend to Los Angeles with Griffith Observatory, Venice Beach and food stops.",
					status: "planned",
					invitedUserIds: [],
					createdAt: now,
					updatedAt: now
				},
				{
					title: "Day Trip to Tijuana",
					userId: ownerId,
					date: "2026-06-01",
					time: "10:00",
					locationId: locationIds[5],
					category: "Culture",
					description: "Cross-border day trip for street food, markets and Avenida Revolucion.",
					status: "planned",
					invitedUserIds: [],
					createdAt: now,
					updatedAt: now
				},
				{
					title: "Denver Mountain Weekend",
					userId: ownerId,
					date: "2026-06-14",
					time: "08:00",
					locationId: locationIds[6],
					category: "Weekend Trip",
					description: "Weekend escape to Denver with skyline views and a possible mountain day.",
					status: "planned",
					invitedUserIds: [],
					createdAt: now,
					updatedAt: now
				},
				{
					title: "Golden Gate Photo Walk",
					userId: ownerId,
					date: "2026-04-28",
					time: "16:30",
					locationId: locationIds[7],
					category: "Sightseeing",
					description: "Photo walk around the Golden Gate Bridge during golden hour.",
					status: "completed",
					invitedUserIds: [],
					createdAt: now,
					updatedAt: now
				},
				{
					title: "Weekend Trip to NYC",
					userId: ownerId,
					date: "2026-07-03",
					time: "07:00",
					locationId: locationIds[8],
					category: "Weekend Trip",
					description: "Long weekend in New York City with skyline views, food stops and museum time.",
					status: "planned",
					invitedUserIds: [],
					createdAt: now,
					updatedAt: now
				}
			])
		).insertedIds
	);

	await collections.journeyEntries.insertMany([
		{
			userId: ownerId,
			eventId: eventIds[1],
			memoryText: "Balboa Park felt like a whole day of tiny discoveries. The botanical building was the highlight.",
			images: [],
			createdAt: now,
			updatedAt: now
		},
		{
			userId: ownerId,
			eventId: eventIds[3],
			memoryText: "Great skyline view, lots of new people, and one of the first nights where San Diego felt familiar.",
			images: [],
			createdAt: now,
			updatedAt: now
		},
		{
			userId: ownerId,
			eventId: eventIds[7],
			memoryText: "The Golden Gate walk made the journey feel bigger than San Diego. Fog, wind and a lot of photos.",
			images: [],
			createdAt: now,
			updatedAt: now
		}
	]);

	await collections.travelIdeas.insertMany([
		{
			title: "Weekend Trip to Los Angeles",
			userId: ownerId,
			location: "Los Angeles",
			city: "Los Angeles",
			country: "USA",
			category: "Weekend Trip",
			priority: "High",
			notes: "Plan car rental, Griffith Observatory and Venice Beach.",
			convertedToEvent: false,
			createdAt: now,
			updatedAt: now
		},
		{
			title: "Coronado Beach Bike Ride",
			userId: ownerId,
			location: "Coronado Island",
			city: "Coronado",
			country: "USA",
			category: "Outdoor",
			priority: "Medium",
			notes: "Go before sunset and bring a camera.",
			convertedToEvent: false,
			createdAt: now,
			updatedAt: now
		}
	]);
}

export async function initializeUserData(defaultUserId) {
	const collections = await getCollections();
	const ownerId = userOid(defaultUserId);
	await ensureIndexes(collections);
	await Promise.all([
		collections.events.updateMany({ userId: { $exists: false } }, { $set: { userId: ownerId } }),
		collections.locations.updateMany({ userId: { $exists: false } }, { $set: { userId: ownerId } }),
		collections.friends.updateMany({ userId: { $exists: false } }, { $set: { userId: ownerId } }),
		collections.journeyEntries.updateMany({ userId: { $exists: false } }, { $set: { userId: ownerId } }),
		collections.travelIdeas.updateMany({ userId: { $exists: false } }, { $set: { userId: ownerId } })
	]);
	if ((await collections.events.countDocuments({})) === 0) {
		await seedDemoData(ownerId);
	}
}
