import { listMapLocations } from "$lib/server/repository.js";
import { categories } from "$lib/constants.js";

const statuses = new Set(["all", "planned", "completed", "invited"]);

function dateFilter(value) {
	const text = String(value || "");
	return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
}

function mapFilters(url) {
	const category = url.searchParams.get("category") || "all";
	const status = url.searchParams.get("status") || "all";
	return {
		category: categories.includes(category) ? category : "all",
		status: statuses.has(status) ? status : "all",
		from: dateFilter(url.searchParams.get("from")),
		to: dateFilter(url.searchParams.get("to"))
	};
}

export async function load({ locals, url }) {
	const filters = mapFilters(url);
	const highlightedEventId = url.searchParams.get("event") || "";
	const hasActiveFilters = Boolean(filters.category !== "all" || filters.status !== "all" || filters.from || filters.to);
	try {
		const locations = await listMapLocations(locals.user.id, filters);
		return {
			locations,
			filters,
			hasActiveFilters,
			categories,
			highlightedEventId,
			eventCount: locations.reduce((total, location) => total + location.events.length, 0),
			filterKey: `${filters.category}:${filters.status}:${filters.from}:${filters.to}:${highlightedEventId}`,
			setupError: ""
		};
	} catch (error) {
		return {
			locations: [],
			filters,
			hasActiveFilters,
			categories,
			highlightedEventId,
			eventCount: 0,
			filterKey: `${filters.category}:${filters.status}:${filters.from}:${filters.to}:${highlightedEventId}`,
			setupError: error.message
		};
	}
}
