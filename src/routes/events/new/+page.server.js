import { fail, redirect } from "@sveltejs/kit";
import { createEventFromForm, validateEventForm } from "$lib/server/repository.js";

export const actions = {
	create: async ({ locals, request }) => {
		const form = await request.formData();
		const errors = validateEventForm(form);
		if (errors.length) return fail(400, { error: errors.join(" ") });
		const id = await createEventFromForm(locals.user.id, form);
		throw redirect(303, `/events/${id}`);
	}
};
