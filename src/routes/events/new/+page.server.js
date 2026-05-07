import { fail, redirect } from "@sveltejs/kit";
import { createEventFromForm, listInviteableUsers, validateEventForm } from "$lib/server/repository.js";

const eventFormFields = [
	"title",
	"category",
	"date",
	"time",
	"status",
	"locationName",
	"address",
	"city",
	"country",
	"lat",
	"lng",
	"backgroundType",
	"description",
	"invitedUserIds",
	"repeatFrequency",
	"repeatCount"
];

function eventValues(form) {
	return {
		...Object.fromEntries(eventFormFields.map((field) => [field, String(form.get(field) || "")])),
		invitedUserIds: form.getAll("invitedUserIds").map(String)
	};
}

export async function load({ locals }) {
	return { inviteableUsers: await listInviteableUsers(locals.user.id) };
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
		throw redirect(303, `/events/${id}`);
	}
};
