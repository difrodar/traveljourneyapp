import { fail } from "@sveltejs/kit";
import { categories } from "$lib/constants.js";
import { createShare, getJourneyDiaryData, getJourneyTripGroups, listTrips } from "$lib/server/repository.js";

const journeySorts = new Set(["dateDesc", "dateAsc", "desc", "asc"]);
const groupings = new Set(["month", "trip"]);

export const actions = {
	share: async ({ locals, request, url }) => {
		const form = await request.formData();
		const expiresIn = String(form.get("expiresIn") || "7d");
		const tripId = String(form.get("tripId") || "");
		try {
			const { hash, expiresAt, tripId: createdTripId } = await createShare(locals.user.id, { expiresIn, tripId });
			return {
				shareCreated: {
					hash,
					shareUrl: `${url.origin}/share/${hash}`,
					expiresAt: expiresAt ? expiresAt.toISOString() : null,
					tripId: createdTripId
				}
			};
		} catch (error) {
			return fail(400, { shareError: error.message });
		}
	}
};

export async function load({ locals, url }) {
	const requestedSort = url.searchParams.get("sort") || "dateDesc";
	const sortParam = journeySorts.has(requestedSort) ? requestedSort : "dateDesc";
	const requestedGroupBy = url.searchParams.get("groupBy") || "month";
	const groupBy = groupings.has(requestedGroupBy) ? requestedGroupBy : "month";
	const filters = {
		search: url.searchParams.get("search") || "",
		category: url.searchParams.get("category") || "all",
		from: url.searchParams.get("from") || "",
		to: url.searchParams.get("to") || "",
		sort: sortParam === "desc" ? "dateDesc" : sortParam === "asc" ? "dateAsc" : sortParam,
		groupBy
	};
	const hasActiveFilters = Boolean(
			filters.search ||
			filters.from ||
			filters.to ||
			filters.category !== "all" ||
			filters.sort !== "dateDesc"
	);
	try {
		const [data, trips] = await Promise.all([
			groupBy === "trip"
				? getJourneyTripGroups(locals.user.id, filters)
				: getJourneyDiaryData(locals.user.id, filters),
			listTrips(locals.user.id)
		]);
		return { ...data, filters, hasActiveFilters, categories, trips, setupError: "" };
	} catch (error) {
		return {
			entries: [],
			groups: [],
			stats: { totalMemories: 0, favoriteCategory: "None yet", mostVisitedCity: "None yet", countriesVisited: 0 },
			recentHighlights: [],
			filters,
			hasActiveFilters,
			categories,
			trips: [],
			setupError: error.message
		};
	}
}
