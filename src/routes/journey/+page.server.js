import { categories } from "$lib/constants.js";
import { listJourneyEntries } from "$lib/server/repository.js";

export async function load({ locals, url }) {
	const sortParam = url.searchParams.get("sort") || "dateDesc";
	const filters = {
		category: url.searchParams.get("category") || "all",
		minRating: url.searchParams.get("minRating") || "0",
		from: url.searchParams.get("from") || "",
		to: url.searchParams.get("to") || "",
		sort: sortParam === "desc" ? "dateDesc" : sortParam === "asc" ? "dateAsc" : sortParam
	};
	const hasActiveFilters = Boolean(
		filters.from ||
			filters.to ||
			filters.category !== "all" ||
			filters.minRating !== "0" ||
			filters.sort !== "dateDesc"
	);
	try {
		return { entries: await listJourneyEntries(locals.user.id, filters), filters, hasActiveFilters, categories, setupError: "" };
	} catch (error) {
		return { entries: [], filters, hasActiveFilters, categories, setupError: error.message };
	}
}
