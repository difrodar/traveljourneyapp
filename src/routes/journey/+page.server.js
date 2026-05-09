import { fail } from "@sveltejs/kit";
import { categories } from "$lib/constants.js";
import { createShare, getJourneyDiaryData } from "$lib/server/repository.js";

const journeySorts = new Set(["dateDesc", "dateAsc", "desc", "asc"]);

export const actions = {
	share: async ({ locals, request, url }) => {
		const form = await request.formData();
		const expiresIn = String(form.get("expiresIn") || "7d");
		try {
			const { hash, expiresAt } = await createShare(locals.user.id, { expiresIn });
			return {
				shareCreated: {
					hash,
					shareUrl: `${url.origin}/share/${hash}`,
					expiresAt: expiresAt ? expiresAt.toISOString() : null
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
