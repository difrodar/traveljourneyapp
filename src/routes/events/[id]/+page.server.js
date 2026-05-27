import { error, fail, redirect } from "@sveltejs/kit";
import {
	completeEventFromForm,
	deleteEvent,
	deleteEventSeries,
	getEvent,
	listInviteableUsers,
	listTrips,
	respondToInvitation,
	updateEventFromForm,
	validateEventForm
} from "$lib/server/repository.js";

const eventFormFields = [
	"title",
	"category",
	"date",
	"time",
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
	"invitedUserIds"
];

function eventValues(form) {
	return {
		...Object.fromEntries(eventFormFields.map((field) => [field, String(form.get(field) || "")])),
		invitedUserIds: form.getAll("invitedUserIds").map(String)
	};
}

export async function load({ locals, params }) {
	const [event, inviteableUsers, trips] = await Promise.all([
		getEvent(locals.user.id, params.id),
		listInviteableUsers(locals.user.id),
		listTrips(locals.user.id)
	]);
	if (!event) throw error(404, "Event not found");
	const trip = event.tripId ? trips.find((entry) => entry.id === event.tripId) || null : null;
	return { event, inviteableUsers, trips, trip };
}

export const actions = {
	update: async ({ locals, params, request }) => {
		const form = await request.formData();
		const validation = validateEventForm(form);
		const values = eventValues(form);
		if (!validation.valid) {
			return fail(400, { error: validation.error, fieldErrors: validation.fieldErrors, values });
		}
		let result;
		try {
			result = await updateEventFromForm(locals.user.id, params.id, form);
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
		// Surface the invitation confirmation when this edit added new invitees (issue #42 / U12).
		return { message: "Event saved successfully.", newlyInvited: result?.newlyInvited || 0 };
	},
	complete: async ({ locals, params, request }) => {
		const form = await request.formData();
		const memoryText = String(form.get("memoryText") || "");
		if (!String(form.get("memoryText") || "").trim()) {
			return fail(400, {
				error: "Please check the highlighted fields.",
				memoryFieldErrors: { memoryText: "Please add a short memory before saving." },
				memoryValues: { memoryText }
			});
		}
		try {
			await completeEventFromForm(locals.user.id, params.id, form);
		} catch (error) {
			if (String(error.message || "").startsWith("Memory image:")) {
				return fail(400, {
					error: "Please check the highlighted fields.",
					memoryFieldErrors: { memoryImageFile: error.message },
					memoryValues: { memoryText }
				});
			}
			return fail(400, { error: error.message, memoryValues: { memoryText } });
		}
		return { message: "Journey memory saved." };
	},
	delete: async ({ locals, params, request }) => {
		const form = await request.formData();
		try {
			if (form.get("deleteScope") === "series") {
				await deleteEventSeries(locals.user.id, params.id);
			} else {
				await deleteEvent(locals.user.id, params.id);
			}
		} catch (error) {
			return fail(400, { error: error.message });
		}
		throw redirect(303, "/events");
	},
	accept: async ({ locals, params }) => {
		try {
			await respondToInvitation(locals.user.id, params.id, "accepted");
		} catch (error) {
			return fail(400, { error: error.message });
		}
		return { message: "You're going! After the event you'll be able to add your own memory." };
	},
	decline: async ({ locals, params }) => {
		try {
			await respondToInvitation(locals.user.id, params.id, "declined");
		} catch (error) {
			return fail(400, { error: error.message });
		}
		// Decline removes the user from invitedUserIds, so the event detail page would
		// 404 on re-render. Redirect to the events list instead.
		throw redirect(303, "/events");
	}
};
