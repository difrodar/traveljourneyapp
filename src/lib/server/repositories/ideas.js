import { getCollections } from "../db.js";
import { clean, oid, parseCoordinate, serialize, userOid } from "./shared.js";

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

export async function getIdea(userId, id) {
	const ideaId = oid(id);
	if (!ideaId) return null;
	const collections = await getCollections();
	const idea = await collections.travelIdeas.findOne({ userId: userOid(userId), _id: ideaId });
	return idea ? serialize(idea) : null;
}

export async function markIdeaArchived(userId, ideaId, eventId) {
	const ideaObjectId = oid(ideaId);
	if (!ideaObjectId) return;
	const collections = await getCollections();
	await collections.travelIdeas.updateOne(
		{ userId: userOid(userId), _id: ideaObjectId },
		{ $set: { convertedToEvent: eventId, updatedAt: new Date() } }
	);
}
