import { error, fail, redirect } from "@sveltejs/kit";
import {
	completeEventFromForm,
	deleteEvent,
	getEvent,
	updateEventFromForm,
	validateEventForm
} from "$lib/server/repository.js";

export async function load({ params }) {
	const event = await getEvent(params.id);
	if (!event) throw error(404, "Event not found");
	return { event };
}

export const actions = {
	update: async ({ params, request }) => {
		const form = await request.formData();
		const errors = validateEventForm(form);
		if (errors.length) return fail(400, { error: errors.join(" ") });
		await updateEventFromForm(params.id, form);
		return { message: "Event updated." };
	},
	complete: async ({ params, request }) => {
		const form = await request.formData();
		if (!String(form.get("memoryText") || "").trim()) {
			return fail(400, { error: "Memory text is required when completing an event." });
		}
		await completeEventFromForm(params.id, form);
		return { message: "Journey memory saved." };
	},
	delete: async ({ params }) => {
		await deleteEvent(params.id);
		throw redirect(303, "/events");
	}
};
