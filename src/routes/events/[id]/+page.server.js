import { error, fail, redirect } from "@sveltejs/kit";
import {
	completeEventFromForm,
	deleteEvent,
	getEvent,
	updateEventFromForm,
	validateEventForm
} from "$lib/server/repository.js";

export async function load({ locals, params }) {
	const event = await getEvent(locals.user.id, params.id);
	if (!event) throw error(404, "Event not found");
	return { event };
}

export const actions = {
	update: async ({ locals, params, request }) => {
		const form = await request.formData();
		const errors = validateEventForm(form);
		if (errors.length) return fail(400, { error: errors.join(" ") });
		await updateEventFromForm(locals.user.id, params.id, form);
		return { message: "Event updated." };
	},
	complete: async ({ locals, params, request }) => {
		const form = await request.formData();
		if (!String(form.get("memoryText") || "").trim()) {
			return fail(400, { error: "Memory text is required when completing an event." });
		}
		await completeEventFromForm(locals.user.id, params.id, form);
		return { message: "Journey memory saved." };
	},
	delete: async ({ locals, params }) => {
		await deleteEvent(locals.user.id, params.id);
		throw redirect(303, "/events");
	}
};
