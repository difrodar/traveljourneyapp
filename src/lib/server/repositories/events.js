import { ObjectId } from "mongodb";
import { categories, reminderLeadHoursAllowed } from "$lib/constants.js";
import { storedEventMedia, storedLocationMedia } from "$lib/media.js";
import { getCollections } from "../db.js";
import {
	addRecurringDate,
	buildCalendarMonth,
	buildInvitations,
	clean,
	escapeRegExp,
	defaultCoordinates,
	isDateFilter,
	maxRepeatCount,
	normalizeEventSort,
	oid,
	parseInvitedUserIds,
	recurrenceFromForm,
	recurrenceLabel,
	reminderForEvent,
	reminderStateForEvent,
	repeatFrequencies,
	serialize,
	upcomingForEvent,
	uploadedImagesFields,
	userOid
} from "./shared.js";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^\d{2}:\d{2}$/;
const allowedCategories = new Set(categories);

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
			location: location ? { ...location, media: storedLocationMedia(location) } : null,
			media: storedEventMedia(serialized, location),
			owner: ownerMap.get(event.userId?.toString()) || null,
			friends: (event.invitedUserIds || [])
				.map((id) => {
					const base = invitedUserMap.get(id.toString());
					if (!base) return null;
					const invitation = (event.invitations || []).find((entry) => entry.userId?.toString() === id.toString());
					return { ...base, status: invitation?.status || "invited" };
				})
				.filter(Boolean),
			isOwner: event.userId?.toString() === ownerId.toString(),
			invitationStatus,
			recurrenceLabel: recurrenceLabel(serialized),
			upcoming: upcomingForEvent(serialized),
			reminder: reminderForEvent(serialized),
			reminderLeadHours: typeof event.reminderLeadHours === "number" ? event.reminderLeadHours : null,
			reminderState: reminderStateForEvent(serialized),
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
	if (filters.tripId) {
		const tripObjectId = oid(filters.tripId);
		if (!tripObjectId) return [];
		query.tripId = tripObjectId;
	}
	if (filters.search) query.title = { $regex: escapeRegExp(filters.search), $options: "i" };
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

function todayString() {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function listEventsAwaitingMemory(userId, limit = 5) {
	const events = await listEvents(userId, { sort: "asc", includeInvitations: true });
	const today = todayString();
	return events
		.filter((event) => event.date && event.date < today && !event.journeyEntry)
		.slice(0, limit);
}

// Events whose per-event reminder lead-time window has been entered but which haven't started yet.
// Includes owner-events and accepted-invitee events (declined/pending excluded — they haven't
// committed). Drives the "Reminders due" section in the notification bell (issue #36 / U6).
export async function listDueReminders(userId, limit = 5) {
	const events = await listEvents(userId, { sort: "asc", includeInvitations: true });
	return events
		.filter((event) => event.reminderState?.due && (event.isOwner || event.invitationStatus === "accepted"))
		.slice(0, limit);
}

export async function getDashboardData(userId, options = {}) {
	const events = await listEvents(userId, { sort: "asc", includeInvitations: true });
	const completed = events.filter((event) => event.status === "completed");
	const today = todayString();
	return {
		calendar: buildCalendarMonth(events, options.month),
		upcomingSoonEvents: events.filter((event) => event.reminder?.active).slice(0, 4),
		journeyHighlights: completed.filter((event) => event.journeyEntry).slice(0, 3),
		eventsAwaitingMemory: events
			.filter((event) => event.date && event.date < today && !event.journeyEntry)
			.slice(0, 5)
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

	const dateValue = clean(form.get("date"));
	if (dateValue && !dateRegex.test(dateValue)) {
		fieldErrors.date = "Date must be in YYYY-MM-DD format.";
	}

	const timeValue = clean(form.get("time"));
	if (timeValue && !timeRegex.test(timeValue)) {
		fieldErrors.time = "Time must be in HH:MM format.";
	}

	const endTimeValue = clean(form.get("endTime"));
	if (endTimeValue) {
		if (!timeRegex.test(endTimeValue)) {
			fieldErrors.endTime = "End time must be in HH:MM format.";
		} else if (timeValue && timeRegex.test(timeValue) && endTimeValue <= timeValue) {
			fieldErrors.endTime = "End time must be after the start time.";
		}
	}

	const categoryValue = clean(form.get("category"));
	if (categoryValue && !allowedCategories.has(categoryValue)) {
		fieldErrors.category = "Please choose a category from the list.";
	}

	const latRaw = clean(form.get("lat"));
	if (latRaw) {
		const lat = Number(latRaw);
		if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
			fieldErrors.lat = "Latitude must be between -90 and 90.";
		}
	}

	const lngRaw = clean(form.get("lng"));
	if (lngRaw) {
		const lng = Number(lngRaw);
		if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
			fieldErrors.lng = "Longitude must be between -180 and 180.";
		}
	}

	const reminderLeadRaw = clean(form.get("reminderLeadHours"));
	if (reminderLeadRaw) {
		const leadHours = Number(reminderLeadRaw);
		if (!Number.isInteger(leadHours) || !reminderLeadHoursAllowed.has(leadHours)) {
			fieldErrors.reminderLeadHours = "Please choose a supported reminder option.";
		}
	}

	const repeatFrequency = clean(form.get("repeatFrequency")) || "none";
	if (!repeatFrequencies.has(repeatFrequency)) {
		fieldErrors.repeatFrequency = "Please choose a supported repeat frequency.";
	}
	if (repeatFrequency !== "none") {
		const repeatCount = Number(clean(form.get("repeatCount")) || "");
		if (!Number.isInteger(repeatCount) || repeatCount < 1 || repeatCount > maxRepeatCount) {
			fieldErrors.repeatCount = `Please choose between 1 and ${maxRepeatCount} occurrences.`;
		}
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

async function eventPayloadFromForm(userId, form, locationId, invitedUserIds, existing = {}, overrides = {}) {
	const title = clean(form.get("title"));
	const imageFields =
		overrides.imageFields ||
		(await uploadedImagesFields(form, "eventImageFiles", "removeEventImageIndex", existing.images || [], title, "Event image"));
	const tripIdValue = clean(form.get("tripId"));
	const tripIdObject = tripIdValue ? oid(tripIdValue) : null;
	const endTime = clean(form.get("endTime"));
	const reminderLeadRaw = clean(form.get("reminderLeadHours"));
	const reminderLeadValue = reminderLeadRaw ? Number(reminderLeadRaw) : null;
	const reminderLeadHours =
		reminderLeadValue && reminderLeadHoursAllowed.has(reminderLeadValue) ? reminderLeadValue : null;
	return {
		title,
		userId: userOid(userId),
		date: overrides.date || clean(form.get("date")),
		time: clean(form.get("time")),
		...(endTime ? { endTime } : { endTime: null }),
		reminderLeadHours,
		locationId,
		category: clean(form.get("category")),
		description: clean(form.get("description")),
		status: clean(form.get("status")) === "completed" ? "completed" : "planned",
		invitedUserIds,
		invitations: buildInvitations(existing.invitations, invitedUserIds),
		...(tripIdObject ? { tripId: tripIdObject } : {}),
		...(overrides.recurrence || {}),
		...imageFields,
		updatedAt: new Date()
	};
}

export async function createEventFromForm(userId, form) {
	const collections = await getCollections();
	const invitedUserIds = await resolveInvitedUserIds(userId, form);
	const locationId = await saveLocationFromForm(userId, form);
	const recurrence = recurrenceFromForm(form);
	const recurrenceGroupId = recurrence.count > 1 ? new ObjectId() : null;
	const imageFields = await uploadedImagesFields(form, "eventImageFiles", "removeEventImageIndex", [], clean(form.get("title")), "Event image");
	const now = new Date();
	const events = await Promise.all(
		Array.from({ length: recurrence.count }, async (_, index) => ({
			...(await eventPayloadFromForm(userId, form, locationId, invitedUserIds, {}, {
				date: addRecurringDate(clean(form.get("date")), recurrence.frequency, index),
				imageFields,
				recurrence: recurrenceGroupId
					? {
							recurrenceGroupId,
							recurrenceFrequency: recurrence.frequency,
							recurrenceIndex: index + 1,
							recurrenceCount: recurrence.count
						}
					: {}
			})),
			createdAt: now
		}))
	);
	if (events.length === 1) {
		const result = await collections.events.insertOne(events[0]);
		return result.insertedId.toString();
	}
	const result = await collections.events.insertMany(events);
	return result.insertedIds[0].toString();
}

export async function updateEventFromForm(userId, id, form) {
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const event = await collections.events.findOne({ userId: ownerId, _id: oid(id) });
	if (!event) throw new Error("Event not found.");
	const invitedUserIds = await resolveInvitedUserIds(ownerId, form);
	const previouslyInvited = new Set((event.invitedUserIds || []).map((value) => value.toString()));
	const newlyInvited = invitedUserIds.filter((value) => !previouslyInvited.has(value.toString())).length;
	const locationId = await saveLocationFromForm(ownerId, form, event.recurrenceGroupId ? null : event.locationId?.toString());
	const $unset = { friendIds: "", imageUrl: "", imageAlt: "", imageCredit: "", imageLicense: "", imageSourceUrl: "" };
	if (!clean(form.get("tripId"))) $unset.tripId = "";
	await collections.events.updateOne(
		{ userId: ownerId, _id: oid(id) },
		{
			$set: await eventPayloadFromForm(ownerId, form, locationId, invitedUserIds, event),
			$unset
		}
	);
	return { invitedCount: invitedUserIds.length, newlyInvited };
}

export async function deleteEvent(userId, id) {
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const eventId = oid(id);
	if (!eventId) throw new Error("Event not found.");
	const result = await collections.events.deleteOne({ userId: ownerId, _id: eventId });
	if (!result.deletedCount) throw new Error("Event not found.");
	await collections.journeyEntries.deleteMany({ userId: ownerId, eventId });
}

export async function deleteEventSeries(userId, id) {
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const eventId = oid(id);
	if (!eventId) throw new Error("Event not found.");
	const event = await collections.events.findOne({ userId: ownerId, _id: eventId });
	if (!event) throw new Error("Event not found.");
	if (!event.recurrenceGroupId) {
		await deleteEvent(ownerId, id);
		return;
	}
	const seriesEvents = await collections.events
		.find({ userId: ownerId, recurrenceGroupId: event.recurrenceGroupId })
		.project({ _id: 1 })
		.toArray();
	const eventIds = seriesEvents.map((seriesEvent) => seriesEvent._id);
	await Promise.all([
		collections.events.deleteMany({ userId: ownerId, recurrenceGroupId: event.recurrenceGroupId }),
		collections.journeyEntries.deleteMany({ userId: ownerId, eventId: { $in: eventIds } })
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
	const memoryImageFields = await uploadedImagesFields(
		form,
		"memoryImageFiles",
		"removeMemoryImageIndex",
		existingEntry?.images || [],
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
				images: memoryImageFields.images,
				updatedAt: now
			},
			$unset: { imageUrl: "", imageAlt: "" },
			$setOnInsert: { userId: ownerId, eventId, createdAt: now }
		},
		{ upsert: true }
	);
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
			media: storedLocationMedia(serialized),
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
