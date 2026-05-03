import { listMapLocations } from "$lib/server/repository.js";

export async function load({ url }) {
	try {
		return {
			locations: await listMapLocations(),
			highlightedEventId: url.searchParams.get("event") || "",
			setupError: ""
		};
	} catch (error) {
		return { locations: [], highlightedEventId: "", setupError: error.message };
	}
}
