import { ObjectId } from "mongodb";
import { findCityCoordinates } from "$lib/cities.js";
import { locationMedia, resolveEventMedia, resolveLocationMedia } from "$lib/media.js";
import { getCollections } from "./db.js";

const maxUploadBytes = 2 * 1024 * 1024;
const allowedUploadTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const oneDayMs = 24 * 60 * 60 * 1000;
const reminderWindowDays = 7;

const fallbackCoordinates = {
	"la jolla cove": { lat: 32.8507, lng: -117.2729 },
	"balboa park": { lat: 32.7341, lng: -117.1446 },
	"pacific beach": { lat: 32.8025, lng: -117.2366 },
	"coronado island": { lat: 32.6859, lng: -117.1831 },
	"gaslamp quarter": { lat: 32.7115, lng: -117.1604 },
	"sunset cliffs": { lat: 32.7353, lng: -117.2558 },
	"los angeles": { lat: 34.0522, lng: -118.2437 },
	"griffith observatory": { lat: 34.1184, lng: -118.3004 },
	"new york": { lat: 40.7128, lng: -74.006 },
	"new york city": { lat: 40.7128, lng: -74.006 },
	nyc: { lat: 40.7128, lng: -74.006 },
	"central park": { lat: 40.7829, lng: -73.9654 },
	tijuana: { lat: 32.5149, lng: -117.0382 },
	"avenida revolucion": { lat: 32.5325, lng: -117.0386 },
	denver: { lat: 39.7392, lng: -104.9903 },
	"red rocks park and amphitheatre": { lat: 39.6654, lng: -105.2057 },
	"san francisco": { lat: 37.7749, lng: -122.4194 },
	"golden gate bridge": { lat: 37.8199, lng: -122.4783 },
	"tokyo": { lat: 35.6762, lng: 139.6503 },
	"zurich": { lat: 47.3769, lng: 8.5417 },
	"zürich": { lat: 47.3769, lng: 8.5417 },
	"london": { lat: 51.5072, lng: -0.1276 },
	"paris": { lat: 48.8566, lng: 2.3522 },
	"barcelona": { lat: 41.3874, lng: 2.1686 },
	"mexico city": { lat: 19.4326, lng: -99.1332 },
	"vancouver": { lat: 49.2827, lng: -123.1207 }
};

function oid(id) {
	return id && ObjectId.isValid(id) ? new ObjectId(id) : null;
}

function userOid(userId) {
	if (userId instanceof ObjectId) return userId;
	const id = typeof userId === "object" ? userId?.id || userId?._id : userId;
	const objectId = oid(id);
	if (!objectId) throw new Error("Authenticated user is missing.");
	return objectId;
}

function clean(value) {
	return String(value || "").trim();
}

function isDateFilter(value) {
	return /^\d{4}-\d{2}-\d{2}$/.test(clean(value));
}

function normalizeEventSort(value) {
	const sort = clean(value);
	if (sort === "desc") return "dateDesc";
	if (sort === "asc") return "dateAsc";
	return ["dateAsc", "dateDesc", "updatedDesc"].includes(sort) ? sort : "dateAsc";
}

function normalizeJourneySort(value) {
	const sort = clean(value);
	if (sort === "desc") return "dateDesc";
	if (sort === "asc") return "dateAsc";
	return ["dateDesc", "dateAsc"].includes(sort) ? sort : "dateDesc";
}

function padDatePart(value) {
	return String(value).padStart(2, "0");
}

function dateKey(date) {
	return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

function dateOnly(value) {
	if (!isDateFilter(value)) return null;
	const [year, month, day] = value.split("-").map(Number);
	return new Date(year, month - 1, day);
}

function monthParamFromDate(date) {
	return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}`;
}

function parseMonthParam(value) {
	const text = clean(value);
	if (!/^\d{4}-\d{2}$/.test(text)) return new Date();
	const [year, month] = text.split("-").map(Number);
	if (month < 1 || month > 12) return new Date();
	return new Date(year, month - 1, 1);
}

function addMonths(date, amount) {
	return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function upcomingForEvent(event) {
	const eventDate = dateOnly(event.date);
	if (!eventDate || event.status !== "planned") {
		return { active: false, label: "", badge: "" };
	}
	const today = dateOnly(dateKey(new Date()));
	const daysUntil = Math.round((eventDate.getTime() - today.getTime()) / oneDayMs);
	if (daysUntil < 0) {
		return { active: false, label: "", badge: "" };
	}
	const label = daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`;
	return { active: true, label, badge: "Upcoming", daysUntil };
}

function reminderForEvent(event) {
	const upcoming = upcomingForEvent(event);
	if (!upcoming.active || upcoming.daysUntil > reminderWindowDays) {
		return { active: false, label: "", badge: "" };
	}
	return { ...upcoming, badge: "Upcoming soon" };
}

function buildCalendarMonth(events, month) {
	const selected = parseMonthParam(month);
	const monthParam = monthParamFromDate(selected);
	const today = new Date();
	const todayKey = dateKey(today);
	const currentMonthParam = monthParamFromDate(today);
	const firstOfMonth = new Date(selected.getFullYear(), selected.getMonth(), 1);
	const firstCalendarDate = new Date(firstOfMonth);
	firstCalendarDate.setDate(firstOfMonth.getDate() - ((firstOfMonth.getDay() + 6) % 7));
	const eventsByDate = new Map();

	for (const event of events) {
		if (!isDateFilter(event.date)) continue;
		if (!eventsByDate.has(event.date)) eventsByDate.set(event.date, []);
		eventsByDate.get(event.date).push(event);
	}

	const days = [];
	for (let index = 0; index < 42; index += 1) {
		const current = new Date(firstCalendarDate);
		current.setDate(firstCalendarDate.getDate() + index);
		const currentDateKey = dateKey(current);
		days.push({
			date: currentDateKey,
			dayNumber: current.getDate(),
			weekdayLabel: new Intl.DateTimeFormat("en", { weekday: "short" }).format(current),
			isToday: currentDateKey === todayKey,
			isCurrentMonth: current.getMonth() === selected.getMonth(),
			events: eventsByDate.get(currentDateKey) || []
		});
	}

	return {
		monthLabel: new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(selected),
		monthParam,
		currentMonthParam,
		isSelectedCurrentMonth: monthParam === currentMonthParam,
		previousMonthParam: monthParamFromDate(addMonths(selected, -1)),
		nextMonthParam: monthParamFromDate(addMonths(selected, 1)),
		weekdayLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
		hasMonthEvents: events.some((event) => event.date?.startsWith(monthParam)),
		weeks: Array.from({ length: 6 }, (_, weekIndex) => days.slice(weekIndex * 7, weekIndex * 7 + 7))
	};
}

function parseCoordinate(value) {
	const text = clean(value);
	if (!text) return null;
	const number = Number(text);
	return Number.isFinite(number) ? number : null;
}

function serialize(doc) {
	if (!doc) return null;
	const copy = serializeValue({ ...doc, id: doc._id.toString() });
	delete copy._id;
	return copy;
}

function serializeValue(value) {
	if (value instanceof ObjectId) return value.toString();
	if (value instanceof Date) return value.toISOString();
	if (Array.isArray(value)) return value.map(serializeValue);
	if (value && typeof value === "object") {
		return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, serializeValue(nested)]));
	}
	return value;
}

function parseInvitedUserIds(form) {
	return [...new Set(form.getAll("invitedUserIds").flatMap((value) => clean(value).split(",")))]
		.map((id) => clean(id))
		.filter(Boolean);
}

function buildInvitations(existing = [], invitedUserIds = []) {
	const existingMap = new Map((existing || []).map((invitation) => [invitation.userId?.toString(), invitation.status || "invited"]));
	const now = new Date();
	return invitedUserIds.map((userId) => ({
		userId,
		status: existingMap.get(userId.toString()) === "accepted" ? "accepted" : "invited",
		updatedAt: now
	}));
}

function hasUploadedFile(value) {
	return value && typeof value === "object" && typeof value.arrayBuffer === "function" && value.size > 0;
}

async function uploadedImageFields(
	form,
	fieldName,
	clearFieldName,
	existing = {},
	altFallback = "Uploaded image",
	uploadLabel = "Image upload"
) {
	const file = form.get(fieldName);
	if (hasUploadedFile(file)) {
		if (!allowedUploadTypes.has(file.type)) {
			throw new Error(`${uploadLabel}: Please upload a JPG, PNG, WebP or GIF image.`);
		}
		if (file.size > maxUploadBytes) {
			throw new Error(`${uploadLabel}: The selected file is too large. Please upload an image up to 2 MB.`);
		}
		const buffer = Buffer.from(await file.arrayBuffer());
		return {
			imageUrl: `data:${file.type};base64,${buffer.toString("base64")}`,
			imageAlt: altFallback,
			imageCredit: "",
			imageLicense: "",
			imageSourceUrl: ""
		};
	}

	if (form.get(clearFieldName)) {
		return {
			imageUrl: "",
			imageAlt: "",
			imageCredit: "",
			imageLicense: "",
			imageSourceUrl: ""
		};
	}

	return {
		imageUrl: existing.imageUrl || clean(form.get("imageUrl")),
		imageAlt: existing.imageAlt || clean(form.get("imageAlt")),
		imageCredit: existing.imageCredit || clean(form.get("imageCredit")),
		imageLicense: existing.imageLicense || clean(form.get("imageLicense")),
		imageSourceUrl: existing.imageSourceUrl || clean(form.get("imageSourceUrl"))
	};
}

function defaultCoordinates(name, city, country, lat, lng) {
	const parsedLat = parseCoordinate(lat);
	const parsedLng = parseCoordinate(lng);
	if (parsedLat !== null && parsedLng !== null) return { lat: parsedLat, lng: parsedLng };

	const normalizedName = name.toLowerCase();
	const partialMatch = Object.entries(fallbackCoordinates).find(([place]) => normalizedName.includes(place));
	const locationCoordinates = fallbackCoordinates[normalizedName] || partialMatch?.[1];
	if (locationCoordinates) return locationCoordinates;

	return findCityCoordinates({ city: city || name, country }) || null;
}

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
		collections.travelIdeas.createIndex({ userId: 1, priority: 1 })
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
			imageUrl: "",
			createdAt: now,
			updatedAt: now
		},
		{
			userId: ownerId,
			eventId: eventIds[3],
			memoryText: "Great skyline view, lots of new people, and one of the first nights where San Diego felt familiar.",
			imageUrl: "",
			createdAt: now,
			updatedAt: now
		},
		{
			userId: ownerId,
			eventId: eventIds[7],
			memoryText: "The Golden Gate walk made the journey feel bigger than San Diego. Fog, wind and a lot of photos.",
			imageUrl: "",
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

async function hydrateEvents(events, userId) {
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const locationIds = events.map((event) => event.locationId).filter(Boolean);
	const invitedUserIds = events
		.flatMap((event) => [
			...(event.invitedUserIds || []),
			...(event.invitations || []).map((invitation) => invitation.userId).filter(Boolean)
		])
		.filter(Boolean);
	const eventIds = events.map((event) => event._id);
	const ownerIds = events.map((event) => event.userId).filter(Boolean);
	const [locations, invitedUsers, owners, journeyEntries] = await Promise.all([
		collections.locations.find({ _id: { $in: locationIds } }).toArray(),
		collections.users.find({ _id: { $in: invitedUserIds } }).project({ username: 1 }).toArray(),
		collections.users.find({ _id: { $in: ownerIds } }).project({ username: 1 }).toArray(),
		collections.journeyEntries.find({ userId: ownerId, eventId: { $in: eventIds } }).toArray()
	]);
	const locationMap = new Map(locations.map((location) => [location._id.toString(), serialize(location)]));
	const invitedUserMap = new Map(
		invitedUsers.map((user) => {
			const serialized = serialize(user);
			return [user._id.toString(), { ...serialized, name: serialized.username }];
		})
	);
	const ownerMap = new Map(
		owners.map((user) => {
			const serialized = serialize(user);
			return [user._id.toString(), { ...serialized, name: serialized.username }];
		})
	);
	const journeyMap = new Map(journeyEntries.map((entry) => [entry.eventId.toString(), serialize(entry)]));

	return events.map((event) => {
		const serialized = serialize(event);
		const location = locationMap.get(event.locationId?.toString()) || null;
		const viewerInvitation = (event.invitations || []).find((invitation) => invitation.userId?.toString() === ownerId.toString());
		const isInvited = (event.invitedUserIds || []).some((id) => id.toString() === ownerId.toString());
		const invitationStatus = viewerInvitation?.status || (isInvited ? "invited" : "");
		return {
			...serialized,
			location: location ? { ...location, media: resolveLocationMedia(location) } : null,
			media: resolveEventMedia(serialized, location),
			owner: ownerMap.get(event.userId?.toString()) || null,
			friends: (event.invitedUserIds || []).map((id) => invitedUserMap.get(id.toString())).filter(Boolean),
			isOwner: event.userId?.toString() === ownerId.toString(),
			invitationStatus,
			upcoming: upcomingForEvent(serialized),
			reminder: reminderForEvent(serialized),
			journeyEntry: journeyMap.get(event._id.toString()) || null
		};
	});
}

export async function listInviteableUsers(userId) {
	const collections = await getCollections();
	const ownerId = userOid(userId);
	return (
		await collections.users
			.find({ _id: { $ne: ownerId } })
			.project({ username: 1 })
			.sort({ username: 1 })
			.toArray()
	).map((user) => {
		const serialized = serialize(user);
		return { ...serialized, name: serialized.username };
	});
}

export async function listEvents(userId, filters = {}) {
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const query =
		filters.status === "invited"
			? { invitedUserIds: ownerId }
			: filters.includeInvitations
				? { $or: [{ userId: ownerId }, { invitedUserIds: ownerId }] }
				: { userId: ownerId };
	if (filters.status && filters.status !== "all" && filters.status !== "invited") query.status = filters.status;
	if (filters.category && filters.category !== "all") query.category = filters.category;
	if (filters.search) query.title = { $regex: filters.search, $options: "i" };
	if (filters.from || filters.to) {
		query.date = {};
		if (isDateFilter(filters.from)) query.date.$gte = filters.from;
		if (isDateFilter(filters.to)) query.date.$lte = filters.to;
		if (!Object.keys(query.date).length) delete query.date;
	}
	const sort = normalizeEventSort(filters.sort);
	const dbSort = sort === "updatedDesc" ? { updatedAt: -1 } : { date: sort === "dateDesc" ? -1 : 1, time: sort === "dateDesc" ? -1 : 1 };
	return hydrateEvents(await collections.events.find(query).sort(dbSort).toArray(), ownerId);
}

export async function listInvitedEvents(userId) {
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const events = await collections.events.find({ invitedUserIds: ownerId }).sort({ date: 1, time: 1 }).toArray();
	return hydrateEvents(events, ownerId);
}

export async function getDashboardData(userId, options = {}) {
	const events = await listEvents(userId, { sort: "asc", includeInvitations: true });
	const completed = events.filter((event) => event.status === "completed");
	return {
		calendar: buildCalendarMonth(events, options.month),
		upcomingSoonEvents: events.filter((event) => event.reminder?.active).slice(0, 4),
		journeyHighlights: completed.filter((event) => event.journeyEntry).slice(0, 3)
	};
}

export async function getEvent(userId, id) {
	const eventId = oid(id);
	if (!eventId) return null;
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const event = await collections.events.findOne({ _id: eventId, $or: [{ userId: ownerId }, { invitedUserIds: ownerId }] });
	if (!event) return null;
	const [hydrated] = await hydrateEvents([event], ownerId);
	return hydrated;
}

export function validateEventForm(form) {
	const fieldErrors = {};
	const requiredFields = {
		title: "Please add an event title.",
		date: "Please choose a date.",
		time: "Please choose a time.",
		locationName: "Please add a concrete location.",
		category: "Please choose a category."
	};

	for (const [field, message] of Object.entries(requiredFields)) {
		if (!clean(form.get(field))) fieldErrors[field] = message;
	}

	const errors = Object.values(fieldErrors);
	return {
		valid: errors.length === 0,
		error: errors.length ? "Please check the highlighted fields." : "",
		errors,
		fieldErrors
	};
}

async function resolveInvitedUserIds(userId, form) {
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const ids = parseInvitedUserIds(form);
	if (!ids.length) return [];
	const objectIds = ids.map(oid);
	if (objectIds.some((id) => !id)) {
		throw new Error("Invited users: Please select existing TripTales accounts only.");
	}
	const users = await collections.users
		.find({ _id: { $in: objectIds, $ne: ownerId } })
		.project({ _id: 1 })
		.toArray();
	if (users.length !== objectIds.length) {
		throw new Error("Invited users: Please select existing TripTales accounts only.");
	}
	return objectIds;
}

async function saveLocationFromForm(userId, form, existingId = null) {
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const now = new Date();
	const name = clean(form.get("locationName"));
	const city = clean(form.get("city")) || name;
	const country = clean(form.get("country")) || "USA";
	const location = {
		name,
		userId: ownerId,
		address: clean(form.get("address")),
		city,
		country,
		coordinates: defaultCoordinates(name, city, country, form.get("lat"), form.get("lng")),
		backgroundType: clean(form.get("backgroundType")) || clean(form.get("category")).toLowerCase(),
		imageUrl: clean(form.get("locationImageUrl")),
		imageAlt: clean(form.get("locationImageAlt")),
		imageCredit: clean(form.get("locationImageCredit")),
		imageLicense: clean(form.get("locationImageLicense")),
		imageSourceUrl: clean(form.get("locationImageSourceUrl")),
		updatedAt: now
	};
	if (existingId && oid(existingId)) {
		await collections.locations.updateOne({ userId: ownerId, _id: oid(existingId) }, { $set: location });
		return oid(existingId);
	}
	return (await collections.locations.insertOne({ ...location, createdAt: now })).insertedId;
}

async function eventPayloadFromForm(userId, form, locationId, invitedUserIds, existing = {}) {
	const title = clean(form.get("title"));
	const imageFields = await uploadedImageFields(form, "eventImageFile", "clearEventImage", existing, title, "Event image");
	return {
		title,
		userId: userOid(userId),
		date: clean(form.get("date")),
		time: clean(form.get("time")),
		locationId,
		category: clean(form.get("category")),
		description: clean(form.get("description")),
		status: clean(form.get("status")) === "completed" ? "completed" : "planned",
		invitedUserIds,
		invitations: buildInvitations(existing.invitations, invitedUserIds),
		...imageFields,
		updatedAt: new Date()
	};
}

export async function createEventFromForm(userId, form) {
	const collections = await getCollections();
	const invitedUserIds = await resolveInvitedUserIds(userId, form);
	const locationId = await saveLocationFromForm(userId, form);
	const result = await collections.events.insertOne({
		...(await eventPayloadFromForm(userId, form, locationId, invitedUserIds)),
		createdAt: new Date()
	});
	return result.insertedId.toString();
}

export async function updateEventFromForm(userId, id, form) {
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const event = await collections.events.findOne({ userId: ownerId, _id: oid(id) });
	if (!event) throw new Error("Event not found.");
	const invitedUserIds = await resolveInvitedUserIds(ownerId, form);
	const locationId = await saveLocationFromForm(ownerId, form, event.locationId?.toString());
	await collections.events.updateOne(
		{ userId: ownerId, _id: oid(id) },
		{ $set: await eventPayloadFromForm(ownerId, form, locationId, invitedUserIds, event), $unset: { friendIds: "" } }
	);
}

export async function deleteEvent(userId, id) {
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const eventId = oid(id);
	await Promise.all([
		collections.events.deleteOne({ userId: ownerId, _id: eventId }),
		collections.journeyEntries.deleteOne({ userId: ownerId, eventId })
	]);
}

export async function completeEventFromForm(userId, id, form) {
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const eventId = oid(id);
	const now = new Date();
	const event = await collections.events.findOne({ _id: eventId, $or: [{ userId: ownerId }, { invitedUserIds: ownerId }] });
	if (!event) throw new Error("Event not found.");
	const isOwner = event.userId?.toString() === ownerId.toString();
	const invitation = (event.invitations || []).find((entry) => entry.userId?.toString() === ownerId.toString());
	if (!isOwner && invitation?.status !== "accepted") {
		throw new Error("Please accept the invitation before saving a journey memory.");
	}
	if (!isOwner && event.status !== "completed") {
		throw new Error("Journey memory can be saved after the event is completed.");
	}
	const existingEntry = await collections.journeyEntries.findOne({ userId: ownerId, eventId });
	const memoryImageFields = await uploadedImageFields(
		form,
		"memoryImageFile",
		"clearMemoryImage",
		existingEntry || {},
		"Journey memory photo",
		"Memory image"
	);
	if (isOwner) {
		await collections.events.updateOne({ userId: ownerId, _id: eventId }, { $set: { status: "completed", updatedAt: now } });
	}
	await collections.journeyEntries.findOneAndUpdate(
		{ userId: ownerId, eventId },
		{
			$set: {
				memoryText: clean(form.get("memoryText")),
				imageUrl: memoryImageFields.imageUrl,
				updatedAt: now
			},
			$setOnInsert: { userId: ownerId, eventId, createdAt: now }
		},
		{ upsert: true }
	);
}

export async function listJourneyEntries(userId, filters = {}) {
	const events = await listEvents(userId, {
		status: "completed",
		sort: normalizeJourneySort(filters.sort) === "dateAsc" ? "dateAsc" : "dateDesc",
		category: filters.category,
		from: filters.from,
		to: filters.to,
		includeInvitations: true
	});
	const entries = events.filter(
		(event) =>
			(event.isOwner || event.invitationStatus === "accepted") &&
			event.journeyEntry &&
			matchesJourneySearch(event, filters.search)
	);
	return entries;
}

function matchesJourneySearch(event, search) {
	const query = clean(search).toLowerCase();
	if (!query) return true;
	const fields = [
		event.title,
		event.category,
		event.journeyEntry?.memoryText,
		event.location?.name,
		event.location?.city,
		event.location?.country
	];
	return fields.some((field) => String(field || "").toLowerCase().includes(query));
}

function monthLabel(monthKey) {
	const [year, month] = monthKey.split("-").map(Number);
	const date = new Date(year, month - 1, 1);
	return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(date);
}

function groupJourneyEntries(entries, sort) {
	const groups = new Map();
	for (const event of entries) {
		const monthKey = isDateFilter(event.date) ? event.date.slice(0, 7) : "undated";
		if (!groups.has(monthKey)) {
			groups.set(monthKey, {
				key: monthKey,
				label: monthKey === "undated" ? "Undated memories" : monthLabel(monthKey),
				entries: []
			});
		}
		groups.get(monthKey).entries.push(event);
	}
	const direction = normalizeJourneySort(sort) === "dateAsc" ? 1 : -1;
	return [...groups.values()].sort((a, b) => {
		if (a.key === "undated") return 1;
		if (b.key === "undated") return -1;
		return a.key.localeCompare(b.key) * direction;
	});
}

function journeyStats(entries) {
	const totalMemories = entries.length;
	const categories = new Map();
	const cities = new Map();
	const countries = new Set();

	for (const event of entries) {
		const category = event.category || "Uncategorized";
		const categoryStats = categories.get(category) || { name: category, count: 0 };
		categoryStats.count += 1;
		categories.set(category, categoryStats);

		const city = event.location?.city || event.location?.name || "World";
		const cityStats = cities.get(city) || { name: city, count: 0 };
		cityStats.count += 1;
		cities.set(city, cityStats);
		if (event.location?.country) countries.add(event.location.country);
	}

	const favoriteCategory = [...categories.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))[0];
	const mostVisitedCity = [...cities.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))[0];

	return {
		totalMemories,
		favoriteCategory: favoriteCategory?.name || "None yet",
		mostVisitedCity: mostVisitedCity?.name || "None yet",
		countriesVisited: countries.size
	};
}

export async function getJourneyDiaryData(userId, filters = {}) {
	const entries = await listJourneyEntries(userId, filters);
	return {
		entries,
		groups: groupJourneyEntries(entries, filters.sort),
		stats: journeyStats(entries),
		recentHighlights: [...entries]
			.sort(
				(a, b) =>
					(b.date || "").localeCompare(a.date || "") ||
					(b.time || "").localeCompare(a.time || "")
			)
			.slice(0, 3)
	};
}

export async function respondToInvitation(userId, id, status) {
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const eventId = oid(id);
	if (!eventId) throw new Error("Event not found.");
	const event = await collections.events.findOne({ _id: eventId, invitedUserIds: ownerId });
	if (!event) throw new Error("Invitation not found.");
	const now = new Date();
	if (status === "accepted") {
		const invitations = buildInvitations(event.invitations, event.invitedUserIds || []).map((invitation) =>
			invitation.userId.toString() === ownerId.toString() ? { ...invitation, status: "accepted", updatedAt: now } : invitation
		);
		await collections.events.updateOne({ _id: eventId }, { $set: { invitations, updatedAt: now } });
		return;
	}
	if (status === "declined") {
		await collections.events.updateOne(
			{ _id: eventId },
			{
				$pull: {
					invitedUserIds: ownerId,
					invitations: { userId: ownerId }
				},
				$set: { updatedAt: now }
			}
		);
		return;
	}
	throw new Error("Unsupported invitation response.");
}

export async function listLocations(userId) {
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const [locations, events] = await Promise.all([
		collections.locations.find({ userId: ownerId }).sort({ name: 1 }).toArray(),
		listEvents(ownerId, {})
	]);
	return locations.map((location) => {
		const serialized = serialize(location);
		return {
			...serialized,
			media: resolveLocationMedia(serialized),
			events: events.filter((event) => event.locationId === serialized.id)
		};
	});
}

export async function listMapLocations(userId, filters = {}) {
	const events = await listEvents(userId, { ...filters, includeInvitations: true });
	const locations = new Map();
	for (const event of events) {
		if (!event.location) continue;
		if (!locations.has(event.location.id)) {
			locations.set(event.location.id, { ...event.location, events: [] });
		}
		locations.get(event.location.id).events.push(event);
	}

	return [...locations.values()]
		.map((location) => ({
			...location,
			events: location.events.sort(
				(a, b) => (a.date || "").localeCompare(b.date || "") || (a.time || "").localeCompare(b.time || "")
			)
		}))
		.sort((a, b) => {
			const country = (a.country || "").localeCompare(b.country || "");
			if (country) return country;
			const city = (a.city || "").localeCompare(b.city || "");
			if (city) return city;
			return (a.name || "").localeCompare(b.name || "");
		});
}

export async function listIdeas(userId) {
	const collections = await getCollections();
	return (await collections.travelIdeas.find({ userId: userOid(userId) }).sort({ createdAt: -1 }).toArray()).map(serialize);
}

export async function createIdeaFromForm(userId, form) {
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const now = new Date();
	await collections.travelIdeas.insertOne({
		title: clean(form.get("title")),
		userId: ownerId,
		location: clean(form.get("location")),
		city: clean(form.get("city")),
		country: clean(form.get("country")) || "USA",
		lat: parseCoordinate(form.get("lat")),
		lng: parseCoordinate(form.get("lng")),
		category: clean(form.get("category")),
		priority: clean(form.get("priority")) || "Medium",
		notes: clean(form.get("notes")),
		convertedToEvent: false,
		createdAt: now,
		updatedAt: now
	});
}

export async function deleteIdea(userId, id) {
	const collections = await getCollections();
	await collections.travelIdeas.deleteOne({ userId: userOid(userId), _id: oid(id) });
}

export async function convertIdeaToEvent(userId, id) {
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const idea = await collections.travelIdeas.findOne({ userId: ownerId, _id: oid(id) });
	if (!idea) throw new Error("Idea not found.");
	const knownLocationMedia = resolveLocationMedia({
		name: clean(idea.location),
		city: clean(idea.city)
	});
	const form = new FormData();
	form.set("title", idea.title);
	form.set("date", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
	form.set("time", "18:00");
	form.set("locationName", idea.location);
	form.set("address", "");
	form.set("city", clean(idea.city) || clean(idea.location));
	form.set("country", clean(idea.country) || "USA");
	const ideaCoordinates =
		idea.lat !== null && idea.lat !== undefined && idea.lng !== null && idea.lng !== undefined
			? { lat: idea.lat, lng: idea.lng }
			: findCityCoordinates({ city: clean(idea.city) || clean(idea.location), country: clean(idea.country) || "USA" });
	if (ideaCoordinates) {
		form.set("lat", String(ideaCoordinates.lat));
		form.set("lng", String(ideaCoordinates.lng));
	}
	form.set("category", idea.category);
	form.set("description", idea.notes);
	form.set("friendNames", "");
	if (!knownLocationMedia) {
		form.set("imageUrl", locationMedia.travel.imageUrl);
		form.set("imageAlt", locationMedia.travel.imageAlt);
		form.set("imageCredit", locationMedia.travel.imageCredit);
		form.set("imageLicense", locationMedia.travel.imageLicense);
		form.set("imageSourceUrl", locationMedia.travel.imageSourceUrl);
	}
	const eventId = await createEventFromForm(ownerId, form);
	await collections.travelIdeas.updateOne(
		{ userId: ownerId, _id: oid(id) },
		{ $set: { convertedToEvent: eventId, updatedAt: new Date() } }
	);
	return eventId;
}
