import { error, fail, redirect } from "@sveltejs/kit";
import {
	addEventToTrip,
	deleteTrip,
	getTripDetail,
	listEvents,
	removeEventFromTrip,
	updateTrip
} from "$lib/server/repository.js";

export async function load({ locals, params }) {
	const detail = await getTripDetail(locals.user.id, params.id);
	if (!detail) throw error(404, "Trip not found");
	const allEvents = await listEvents(locals.user.id, { sort: "dateAsc" });
	const availableEvents = allEvents.filter(
		(event) => event.isOwner && (!event.tripId || event.tripId.toString() !== params.id)
	);
	return { ...detail, availableEvents };
}

export const actions = {
	update: async ({ locals, params, request }) => {
		const form = await request.formData();
		try {
			await updateTrip(locals.user.id, params.id, {
				name: String(form.get("name") || ""),
				description: String(form.get("description") || ""),
				dateFrom: String(form.get("dateFrom") || ""),
				dateTo: String(form.get("dateTo") || "")
			});
		} catch (err) {
			return fail(400, { error: err.message });
		}
		return { message: "Trip saved." };
	},
	delete: async ({ locals, params }) => {
		try {
			await deleteTrip(locals.user.id, params.id);
		} catch (err) {
			return fail(400, { error: err.message });
		}
		throw redirect(303, "/trips");
	},
	addEvent: async ({ locals, params, request }) => {
		const form = await request.formData();
		try {
			await addEventToTrip(locals.user.id, params.id, String(form.get("eventId") || ""));
		} catch (err) {
			return fail(400, { error: err.message });
		}
		return { message: "Event added to trip." };
	},
	removeEvent: async ({ locals, request }) => {
		const form = await request.formData();
		try {
			await removeEventFromTrip(locals.user.id, String(form.get("eventId") || ""));
		} catch (err) {
			return fail(400, { error: err.message });
		}
		return { message: "Event removed from trip." };
	}
};
