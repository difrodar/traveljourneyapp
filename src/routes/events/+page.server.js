import { listEvents } from "$lib/server/repository.js";
import { categories } from "$lib/constants.js";

export async function load({ locals, url }) {
	const filters = {
		search: url.searchParams.get("search") || "",
		status: url.searchParams.get("status") || "all",
		category: url.searchParams.get("category") || "all",
		sort: url.searchParams.get("sort") || "asc"
	};
	try {
		return { events: await listEvents(locals.user.id, filters), filters, categories, setupError: "" };
	} catch (error) {
		return { events: [], filters, categories, setupError: error.message };
	}
}
