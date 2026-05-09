import { getCollections } from "../db.js";
import { clean, isDateFilter, normalizeJourneySort, serialize, userOid } from "./shared.js";
import { listEvents } from "./events.js";

function matchesJourneySearch(event, search) {
	const query = clean(search).toLowerCase();
	if (!query) return true;
	const fields = [
		event.title,
		event.category,
		event.journeyEntry?.memoryText,
		event.location?.name,
		event.location?.city,
		event.location?.country
	];
	return fields.some((field) => String(field || "").toLowerCase().includes(query));
}

function monthLabel(monthKey) {
	const [year, month] = monthKey.split("-").map(Number);
	const date = new Date(year, month - 1, 1);
	return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(date);
}

function recurrenceDateRange(events) {
	const dates = events.map((event) => event.date).filter(Boolean).sort();
	if (!dates.length) return { startDate: "", endDate: "", label: "Dates not set" };
	const startDate = dates[0];
	const endDate = dates[dates.length - 1];
	return {
		startDate,
		endDate,
		label: startDate === endDate ? startDate : `${startDate} to ${endDate}`
	};
}

function buildJourneyCards(entries, sort) {
	const byRecurrence = new Map();
	const cards = [];
	for (const event of entries) {
		if (!event.recurrenceGroupId) {
			cards.push(event);
			continue;
		}
		if (!byRecurrence.has(event.recurrenceGroupId)) byRecurrence.set(event.recurrenceGroupId, []);
		byRecurrence.get(event.recurrenceGroupId).push(event);
	}

	for (const [recurrenceGroupId, events] of byRecurrence.entries()) {
		const occurrences = [...events].sort(
			(a, b) => (a.date || "").localeCompare(b.date || "") || (a.time || "").localeCompare(b.time || "")
		);
		const first = occurrences[0];
		const range = recurrenceDateRange(occurrences);
		const occurrenceCount = Math.max(...occurrences.map((event) => Number(event.recurrenceCount) || 1), occurrences.length);
		cards.push({
			...first,
			id: `recurrence-${recurrenceGroupId}`,
			isRecurrenceBundle: true,
			recurrenceGroupId,
			occurrences,
			occurrenceCount,
			memoryCount: occurrences.length,
			startDate: range.startDate,
			endDate: range.endDate,
			dateRangeLabel: range.label,
			groupDate: normalizeJourneySort(sort) === "dateAsc" ? range.startDate : range.endDate,
			recurrenceLabel: `${first.recurrenceFrequency?.charAt(0).toUpperCase() || ""}${first.recurrenceFrequency?.slice(1) || ""} series`
		});
	}

	const direction = normalizeJourneySort(sort) === "dateAsc" ? 1 : -1;
	return cards.sort((a, b) => {
		const aDate = a.groupDate || a.date || "";
		const bDate = b.groupDate || b.date || "";
		const dateSort = aDate.localeCompare(bDate) * direction;
		if (dateSort) return dateSort;
		return (a.time || "").localeCompare(b.time || "") * direction;
	});
}

function groupJourneyEntries(entries, sort) {
	const groups = new Map();
	for (const event of entries) {
		const groupDate = event.groupDate || event.date;
		const monthKey = isDateFilter(groupDate) ? groupDate.slice(0, 7) : "undated";
		if (!groups.has(monthKey)) {
			groups.set(monthKey, {
				key: monthKey,
				label: monthKey === "undated" ? "Undated memories" : monthLabel(monthKey),
				memoryCount: 0,
				entries: []
			});
		}
		groups.get(monthKey).entries.push(event);
		groups.get(monthKey).memoryCount += event.memoryCount || 1;
	}
	const direction = normalizeJourneySort(sort) === "dateAsc" ? 1 : -1;
	return [...groups.values()].sort((a, b) => {
		if (a.key === "undated") return 1;
		if (b.key === "undated") return -1;
		return a.key.localeCompare(b.key) * direction;
	});
}

function journeyStats(entries) {
	const totalMemories = entries.length;
	const categories = new Map();
	const cities = new Map();
	const countries = new Set();

	for (const event of entries) {
		const category = event.category || "Uncategorized";
		const categoryStats = categories.get(category) || { name: category, count: 0 };
		categoryStats.count += 1;
		categories.set(category, categoryStats);

		const city = event.location?.city || event.location?.name || "World";
		const cityStats = cities.get(city) || { name: city, count: 0 };
		cityStats.count += 1;
		cities.set(city, cityStats);
		if (event.location?.country) countries.add(event.location.country);
	}

	const favoriteCategory = [...categories.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))[0];
	const mostVisitedCity = [...cities.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))[0];

	return {
		totalMemories,
		favoriteCategory: favoriteCategory?.name || "None yet",
		mostVisitedCity: mostVisitedCity?.name || "None yet",
		countriesVisited: countries.size
	};
}

export async function listJourneyEntries(userId, filters = {}) {
	const events = await listEvents(userId, {
		status: "completed",
		sort: normalizeJourneySort(filters.sort) === "dateAsc" ? "dateAsc" : "dateDesc",
		category: filters.category,
		from: filters.from,
		to: filters.to,
		tripId: filters.tripId,
		includeInvitations: true
	});
	const entries = events.filter(
		(event) =>
			(event.isOwner || event.invitationStatus === "accepted") &&
			event.journeyEntry &&
			matchesJourneySearch(event, filters.search)
	);
	return entries;
}

export async function getJourneyDiaryData(userId, filters = {}) {
	const entries = await listJourneyEntries(userId, filters);
	const journeyCards = buildJourneyCards(entries, filters.sort);
	return {
		entries,
		groups: groupJourneyEntries(journeyCards, filters.sort),
		stats: journeyStats(entries),
		recentHighlights: [...entries]
			.sort(
				(a, b) =>
					(b.date || "").localeCompare(a.date || "") ||
					(b.time || "").localeCompare(a.time || "")
			)
			.slice(0, 3)
	};
}

function groupJourneyByTrip(cards, tripsById, sort) {
	const direction = normalizeJourneySort(sort) === "dateAsc" ? 1 : -1;
	const groups = new Map();
	for (const card of cards) {
		const tripId = card.tripId?.toString() || "";
		const key = tripId || "untripped";
		if (!groups.has(key)) {
			const trip = tripId ? tripsById.get(tripId) : null;
			groups.set(key, {
				key,
				label: trip ? trip.name : "Untripped memories",
				tripId: trip?.id || "",
				dateFrom: trip?.dateFrom || "",
				dateTo: trip?.dateTo || "",
				memoryCount: 0,
				entries: []
			});
		}
		groups.get(key).entries.push(card);
		groups.get(key).memoryCount += card.memoryCount || 1;
	}
	const result = [...groups.values()];
	for (const group of result) {
		group.entries.sort((a, b) => {
			const aDate = a.groupDate || a.date || "";
			const bDate = b.groupDate || b.date || "";
			return aDate.localeCompare(bDate) * direction;
		});
	}
	return result.sort((a, b) => {
		if (a.key === "untripped") return 1;
		if (b.key === "untripped") return -1;
		return (a.dateFrom || "").localeCompare(b.dateFrom || "") * direction;
	});
}

export async function getJourneyTripGroups(userId, filters = {}) {
	const entries = await listJourneyEntries(userId, filters);
	const journeyCards = buildJourneyCards(entries, filters.sort);
	const collections = await getCollections();
	const ownerId = userOid(userId);
	const trips = await collections.trips.find({ userId: ownerId }).toArray();
	const tripsById = new Map(trips.map((trip) => [trip._id.toString(), serialize(trip)]));
	return {
		entries,
		groups: groupJourneyByTrip(journeyCards, tripsById, filters.sort),
		stats: journeyStats(entries),
		recentHighlights: [...entries]
			.sort(
				(a, b) =>
					(b.date || "").localeCompare(a.date || "") ||
					(b.time || "").localeCompare(a.time || "")
			)
			.slice(0, 3)
	};
}
