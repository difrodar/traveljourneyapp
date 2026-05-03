import { fail, redirect } from "@sveltejs/kit";
import { categories, priorities } from "$lib/constants.js";
import { convertIdeaToEvent, createIdeaFromForm, deleteIdea, listIdeas } from "$lib/server/repository.js";

export async function load() {
	try {
		return { ideas: await listIdeas(), categories, priorities, setupError: "" };
	} catch (error) {
		return { ideas: [], categories, priorities, setupError: error.message };
	}
}

export const actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		if (!String(form.get("title") || "").trim()) return fail(400, { error: "Title is required." });
		await createIdeaFromForm(form);
		return { message: "Travel idea saved." };
	},
	delete: async ({ request }) => {
		const form = await request.formData();
		await deleteIdea(form.get("id"));
		return { message: "Travel idea deleted." };
	},
	convert: async ({ request }) => {
		const form = await request.formData();
		const eventId = await convertIdeaToEvent(form.get("id"));
		throw redirect(303, `/events/${eventId}`);
	}
};
