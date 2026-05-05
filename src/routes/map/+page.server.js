import { listMapLocations } from "$lib/server/repository.js";

export async function load({ locals, url }) {
	try {
		return {
			locations: await listMapLocations(locals.user.id),
			highlightedEventId: url.searchParams.get("event") || "",
			setupError: ""
		};
	} catch (error) {
		return { locations: [], highlightedEventId: "", setupError: error.message };
	}
}
