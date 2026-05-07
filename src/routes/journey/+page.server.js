import { categories } from "$lib/constants.js";
import { getJourneyDiaryData } from "$lib/server/repository.js";

const journeySorts = new Set(["dateDesc", "dateAsc", "desc", "asc"]);

export async function load({ locals, url }) {
	const requestedSort = url.searchParams.get("sort") || "dateDesc";
	const sortParam = journeySorts.has(requestedSort) ? requestedSort : "dateDesc";
	const filters = {
		search: url.searchParams.get("search") || "",
		category: url.searchParams.get("category") || "all",
		from: url.searchParams.get("from") || "",
		to: url.searchParams.get("to") || "",
		sort: sortParam === "desc" ? "dateDesc" : sortParam === "asc" ? "dateAsc" : sortParam
	};
	const hasActiveFilters = Boolean(
			filters.search ||
			filters.from ||
			filters.to ||
			filters.category !== "all" ||
			filters.sort !== "dateDesc"
	);
	try {
		return { ...(await getJourneyDiaryData(locals.user.id, filters)), filters, hasActiveFilters, categories, setupError: "" };
	} catch (error) {
		return {
			entries: [],
			groups: [],
			stats: { totalMemories: 0, favoriteCategory: "None yet", mostVisitedCity: "None yet", countriesVisited: 0 },
			recentHighlights: [],
			filters,
			hasActiveFilters,
			categories,
			setupError: error.message
		};
	}
}
