import { getDashboardData } from "$lib/server/repository.js";

export async function load() {
	try {
		return { ...(await getDashboardData()), setupError: "" };
	} catch (error) {
		return {
			setupError: error.message,
			upcomingEvents: [],
			journeyHighlights: [],
			stats: { events: 0, locations: 0, averageRating: 0, ideas: 0 }
		};
	}
}
