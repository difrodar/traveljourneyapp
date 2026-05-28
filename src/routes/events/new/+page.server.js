import { fail, redirect } from "@sveltejs/kit";
import {
	createEventFromForm,
	getIdea,
	listInviteableUsers,
	listTrips,
	markIdeaArchived,
	validateEventForm
} from "$lib/server/repository.js";

const eventFormFields = [
	"title",
	"category",
	"date",
	"time",
	"endTime",
	"status",
	"tripId",
	"locationName",
	"address",
	"city",
	"country",
	"lat",
	"lng",
	"backgroundType",
	"description",
	"invitedUserIds",
	"reminderLeadHours",
	"repeatFrequency",
	"repeatCount"
];

function eventValues(form) {
	return {
		...Object.fromEntries(eventFormFields.map((field) => [field, String(form.get(field) || "")])),
		invitedUserIds: form.getAll("invitedUserIds").map(String)
	};
}

export async function load({ locals, url }) {
	const [inviteableUsers, trips] = await Promise.all([
		listInviteableUsers(locals.user.id),
		listTrips(locals.user.id)
	]);
	const dateParam = url.searchParams.get("date") || "";
	const initialDate = /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : "";

	let initialEvent = null;
	let fromIdeaId = "";
	const fromIdeaParam = url.searchParams.get("fromIdeaId") || "";
	if (fromIdeaParam) {
		const idea = await getIdea(locals.user.id, fromIdeaParam);
		if (idea && !idea.convertedToEvent) {
			fromIdeaId = idea.id;
			initialEvent = {
				title: idea.title || "",
				category: idea.category || "",
				description: idea.notes || "",
				location: {
					name: idea.location || "",
					address: "",
					city: idea.city || "",
					country: idea.country || "USA",
					coordinates: {
						lat: idea.lat !== null && idea.lat !== undefined ? String(idea.lat) : "",
						lng: idea.lng !== null && idea.lng !== undefined ? String(idea.lng) : ""
					}
				}
			};
		}
	}

	return { inviteableUsers, trips, initialDate, initialEvent, fromIdeaId };
}

export const actions = {
	create: async ({ locals, request }) => {
		const form = await request.formData();
		const validation = validateEventForm(form);
		const values = eventValues(form);
		if (!validation.valid) {
			return fail(400, { error: validation.error, fieldErrors: validation.fieldErrors, values });
		}
		let id;
		try {
			id = await createEventFromForm(locals.user.id, form);
		} catch (error) {
			if (String(error.message || "").startsWith("Event image:")) {
				return fail(400, {
					error: "Please check the highlighted fields.",
					fieldErrors: { eventImageFile: error.message },
					values
				});
			}
			if (String(error.message || "").startsWith("Invited users:")) {
				return fail(400, {
					error: "Please check the highlighted fields.",
					fieldErrors: { invitedUserIds: error.message },
					values
				});
			}
			return fail(400, { error: error.message, values });
		}
		// If this event was created via "Convert to event" on an idea, mark the idea archived now
		// (issue #41 / U11). Persistence happens here, not when the user clicked Convert — so a
		// user who navigates away without saving leaves the idea untouched.
		const fromIdeaId = String(form.get("fromIdeaId") || "").trim();
		if (fromIdeaId) {
			await markIdeaArchived(locals.user.id, fromIdeaId, id);
		}
		// Confirm invitations on the detail page (issue #42 / U12): the count flags the success
		// banner, the recipient names come from the freshly loaded event.friends there.
		const invitedCount = values.invitedUserIds.filter(Boolean).length;
		throw redirect(303, invitedCount > 0 ? `/events/${id}?invited=${invitedCount}` : `/events/${id}`);
	}
};
