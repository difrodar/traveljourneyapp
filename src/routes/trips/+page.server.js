import { fail, redirect } from "@sveltejs/kit";
import { createTrip, listTrips } from "$lib/server/repository.js";

export async function load({ locals }) {
	try {
		const trips = await listTrips(locals.user.id);
		return { trips, setupError: "" };
	} catch (error) {
		return { trips: [], setupError: error.message };
	}
}

export const actions = {
	create: async ({ locals, request }) => {
		const form = await request.formData();
		const values = {
			name: String(form.get("name") || ""),
			description: String(form.get("description") || ""),
			dateFrom: String(form.get("dateFrom") || ""),
			dateTo: String(form.get("dateTo") || "")
		};
		let id;
		try {
			id = await createTrip(locals.user.id, values);
		} catch (error) {
			return fail(400, { error: error.message, values });
		}
		throw redirect(303, `/trips/${id}`);
	}
};
