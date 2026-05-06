import { error, fail, redirect } from "@sveltejs/kit";
import {
	completeEventFromForm,
	deleteEvent,
	getEvent,
	updateEventFromForm,
	validateEventForm
} from "$lib/server/repository.js";

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
	"friendNames"
];

function eventValues(form) {
	return Object.fromEntries(eventFormFields.map((field) => [field, String(form.get(field) || "")]));
}

export async function load({ locals, params }) {
	const event = await getEvent(locals.user.id, params.id);
	if (!event) throw error(404, "Event not found");
	return { event };
}

export const actions = {
	update: async ({ locals, params, request }) => {
		const form = await request.formData();
		const validation = validateEventForm(form);
		const values = eventValues(form);
		if (!validation.valid) {
			return fail(400, { error: validation.error, fieldErrors: validation.fieldErrors, values });
		}
		try {
			await updateEventFromForm(locals.user.id, params.id, form);
		} catch (error) {
			if (String(error.message || "").startsWith("Event image:")) {
				return fail(400, {
					error: "Please check the highlighted fields.",
					fieldErrors: { eventImageFile: error.message },
					values
				});
			}
			return fail(400, { error: error.message, values });
		}
		return { message: "Event saved successfully." };
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
	delete: async ({ locals, params }) => {
		await deleteEvent(locals.user.id, params.id);
		throw redirect(303, "/events");
	}
};
