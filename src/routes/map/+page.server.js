import { env as publicEnv } from "$env/dynamic/public";
import { listLocations } from "$lib/server/repository.js";

export async function load() {
	try {
		return {
			locations: await listLocations(),
			apiKey: publicEnv.PUBLIC_GOOGLE_MAPS_API_KEY || "",
			mapId: publicEnv.PUBLIC_GOOGLE_MAP_ID || "",
			setupError: ""
		};
	} catch (error) {
		return { locations: [], apiKey: "", mapId: "", setupError: error.message };
	}
}
