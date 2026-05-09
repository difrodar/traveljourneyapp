import { findCityCoordinates } from "$lib/cities.js";
import { locationMedia, resolveLocationMedia } from "$lib/media.js";
import { getCollections } from "../db.js";
import { clean, oid, parseCoordinate, serialize, userOid } from "./shared.js";
import { createEventFromForm } from "./events.js";

export async function listIdeas(userId) {
	const collections = await getCollections();
	return (
		await collections.travelIdeas
			.find({
				userId: userOid(userId),
				$or: [
					{ convertedToEvent: false },
					{ convertedToEvent: null },
					{ convertedToEvent: { $exists: false } }
				]
			})
			.sort({ createdAt: -1 })
			.toArray()
	).map(serialize);
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
	const eventId = await createEventFromForm(ownerId, form);
	if (!knownLocationMedia) {
		await collections.events.updateOne(
			{ userId: ownerId, _id: oid(eventId) },
			{
				$set: {
					images: [
						{
							url: locationMedia.travel.imageUrl,
							alt: locationMedia.travel.imageAlt,
							credit: locationMedia.travel.imageCredit,
							license: locationMedia.travel.imageLicense,
							sourceUrl: locationMedia.travel.imageSourceUrl
						}
					]
				}
			}
		);
	}
	await collections.travelIdeas.updateOne(
		{ userId: ownerId, _id: oid(id) },
		{ $set: { convertedToEvent: eventId, updatedAt: new Date() } }
	);
	return eventId;
}
