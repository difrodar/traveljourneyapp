import { listEvents } from "$lib/server/repository.js";
import { categories } from "$lib/constants.js";

const eventSorts = new Set(["dateAsc", "dateDesc", "updatedDesc", "asc", "desc"]);

export async function load({ locals, url }) {
	const requestedSort = url.searchParams.get("sort") || "dateAsc";
	const sortParam = eventSorts.has(requestedSort) ? requestedSort : "dateAsc";
	const defaultStatus = "planned";
	const filters = {
		search: url.searchParams.get("search") || "",
		status: url.searchParams.get("status") || defaultStatus,
		category: url.searchParams.get("category") || "all",
		from: url.searchParams.get("from") || "",
		to: url.searchParams.get("to") || "",
		sort: sortParam === "asc" ? "dateAsc" : sortParam === "desc" ? "dateDesc" : sortParam,
		includeInvitations: true
	};
	const hasActiveFilters = Boolean(
			filters.search ||
			filters.from ||
			filters.to ||
			filters.status !== defaultStatus ||
			filters.category !== "all" ||
			filters.sort !== "dateAsc"
	);
	try {
		return { events: await listEvents(locals.user.id, filters), filters, hasActiveFilters, categories, setupError: "" };
	} catch (error) {
		return { events: [], filters, hasActiveFilters, categories, setupError: error.message };
	}
}
