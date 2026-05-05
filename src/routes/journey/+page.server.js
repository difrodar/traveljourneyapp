import { categories } from "$lib/constants.js";
import { listJourneyEntries } from "$lib/server/repository.js";

export async function load({ locals, url }) {
	const filters = {
		category: url.searchParams.get("category") || "all",
		minRating: url.searchParams.get("minRating") || "0"
	};
	try {
		return { entries: await listJourneyEntries(locals.user.id, filters), filters, categories, setupError: "" };
	} catch (error) {
		return { entries: [], filters, categories, setupError: error.message };
	}
}
