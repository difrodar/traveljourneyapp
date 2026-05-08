import { ObjectId } from "mongodb";
import { findCityCoordinates } from "$lib/cities.js";

export const maxUploadBytes = 2 * 1024 * 1024;
export const allowedUploadTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
export const repeatFrequencies = new Set(["none", "daily", "weekly", "monthly"]);
export const maxRepeatCount = 52;
export const oneDayMs = 24 * 60 * 60 * 1000;
export const reminderWindowDays = 7;

export const fallbackCoordinates = {
	"la jolla cove": { lat: 32.8507, lng: -117.2729 },
	"balboa park": { lat: 32.7341, lng: -117.1446 },
	"pacific beach": { lat: 32.8025, lng: -117.2366 },
	"coronado island": { lat: 32.6859, lng: -117.1831 },
	"gaslamp quarter": { lat: 32.7115, lng: -117.1604 },
	"sunset cliffs": { lat: 32.7353, lng: -117.2558 },
	"los angeles": { lat: 34.0522, lng: -118.2437 },
	"griffith observatory": { lat: 34.1184, lng: -118.3004 },
	"new york": { lat: 40.7128, lng: -74.006 },
	"new york city": { lat: 40.7128, lng: -74.006 },
	nyc: { lat: 40.7128, lng: -74.006 },
	"central park": { lat: 40.7829, lng: -73.9654 },
	tijuana: { lat: 32.5149, lng: -117.0382 },
	"avenida revolucion": { lat: 32.5325, lng: -117.0386 },
	denver: { lat: 39.7392, lng: -104.9903 },
	"red rocks park and amphitheatre": { lat: 39.6654, lng: -105.2057 },
	"san francisco": { lat: 37.7749, lng: -122.4194 },
	"golden gate bridge": { lat: 37.8199, lng: -122.4783 },
	"tokyo": { lat: 35.6762, lng: 139.6503 },
	"zurich": { lat: 47.3769, lng: 8.5417 },
	"zürich": { lat: 47.3769, lng: 8.5417 },
	"london": { lat: 51.5072, lng: -0.1276 },
	"paris": { lat: 48.8566, lng: 2.3522 },
	"barcelona": { lat: 41.3874, lng: 2.1686 },
	"mexico city": { lat: 19.4326, lng: -99.1332 },
	"vancouver": { lat: 49.2827, lng: -123.1207 }
};

export function oid(id) {
	return id && ObjectId.isValid(id) ? new ObjectId(id) : null;
}

export function userOid(userId) {
	if (userId instanceof ObjectId) return userId;
	const id = typeof userId === "object" ? userId?.id || userId?._id : userId;
	const objectId = oid(id);
	if (!objectId) throw new Error("Authenticated user is missing.");
	return objectId;
}

export function clean(value) {
	return String(value || "").trim();
}

export function isDateFilter(value) {
	return /^\d{4}-\d{2}-\d{2}$/.test(clean(value));
}

export function normalizeEventSort(value) {
	const sort = clean(value);
	if (sort === "desc") return "dateDesc";
	if (sort === "asc") return "dateAsc";
	return ["dateAsc", "dateDesc", "updatedDesc"].includes(sort) ? sort : "dateAsc";
}

export function normalizeJourneySort(value) {
	const sort = clean(value);
	if (sort === "desc") return "dateDesc";
	if (sort === "asc") return "dateAsc";
	return ["dateDesc", "dateAsc"].includes(sort) ? sort : "dateDesc";
}

function padDatePart(value) {
	return String(value).padStart(2, "0");
}

export function dateKey(date) {
	return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

export function dateOnly(value) {
	if (!isDateFilter(value)) return null;
	const [year, month, day] = value.split("-").map(Number);
	return new Date(year, month - 1, day);
}

function formatDate(date) {
	return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

function daysInMonth(year, monthIndex) {
	return new Date(year, monthIndex + 1, 0).getDate();
}

export function addRecurringDate(value, frequency, index) {
	const date = dateOnly(value);
	if (!date || index === 0 || frequency === "none") return value;
	if (frequency === "daily") return formatDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + index));
	if (frequency === "weekly") return formatDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + index * 7));
	const targetMonth = date.getMonth() + index;
	const targetYear = date.getFullYear() + Math.floor(targetMonth / 12);
	const normalizedMonth = ((targetMonth % 12) + 12) % 12;
	const targetDay = Math.min(date.getDate(), daysInMonth(targetYear, normalizedMonth));
	return formatDate(new Date(targetYear, normalizedMonth, targetDay));
}

function monthParamFromDate(date) {
	return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}`;
}

function parseMonthParam(value) {
	const text = clean(value);
	if (!/^\d{4}-\d{2}$/.test(text)) return new Date();
	const [year, month] = text.split("-").map(Number);
	if (month < 1 || month > 12) return new Date();
	return new Date(year, month - 1, 1);
}

function addMonths(date, amount) {
	return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function upcomingForEvent(event) {
	const eventDate = dateOnly(event.date);
	if (!eventDate || event.status !== "planned") {
		return { active: false, label: "", badge: "" };
	}
	const today = dateOnly(dateKey(new Date()));
	const daysUntil = Math.round((eventDate.getTime() - today.getTime()) / oneDayMs);
	if (daysUntil < 0) {
		return { active: false, label: "", badge: "" };
	}
	const label = daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`;
	return { active: true, label, badge: "Upcoming", daysUntil };
}

export function reminderForEvent(event) {
	const upcoming = upcomingForEvent(event);
	if (!upcoming.active || upcoming.daysUntil > reminderWindowDays) {
		return { active: false, label: "", badge: "" };
	}
	return { ...upcoming, badge: "Upcoming soon" };
}

export function recurrenceLabel(event) {
	if (!event.recurrenceGroupId || !event.recurrenceFrequency || !event.recurrenceIndex || !event.recurrenceCount) return "";
	const frequency = `${event.recurrenceFrequency.charAt(0).toUpperCase()}${event.recurrenceFrequency.slice(1)}`;
	return `${frequency} series ${event.recurrenceIndex}/${event.recurrenceCount}`;
}

export function buildCalendarMonth(events, month) {
	const selected = parseMonthParam(month);
	const monthParam = monthParamFromDate(selected);
	const today = new Date();
	const todayKey = dateKey(today);
	const currentMonthParam = monthParamFromDate(today);
	const firstOfMonth = new Date(selected.getFullYear(), selected.getMonth(), 1);
	const firstCalendarDate = new Date(firstOfMonth);
	firstCalendarDate.setDate(firstOfMonth.getDate() - ((firstOfMonth.getDay() + 6) % 7));
	const eventsByDate = new Map();

	for (const event of events) {
		if (!isDateFilter(event.date)) continue;
		if (!eventsByDate.has(event.date)) eventsByDate.set(event.date, []);
		eventsByDate.get(event.date).push(event);
	}

	const days = [];
	for (let index = 0; index < 42; index += 1) {
		const current = new Date(firstCalendarDate);
		current.setDate(firstCalendarDate.getDate() + index);
		const currentDateKey = dateKey(current);
		days.push({
			date: currentDateKey,
			dayNumber: current.getDate(),
			weekdayLabel: new Intl.DateTimeFormat("en", { weekday: "short" }).format(current),
			isToday: currentDateKey === todayKey,
			isCurrentMonth: current.getMonth() === selected.getMonth(),
			events: eventsByDate.get(currentDateKey) || []
		});
	}

	return {
		monthLabel: new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(selected),
		monthParam,
		currentMonthParam,
		isSelectedCurrentMonth: monthParam === currentMonthParam,
		previousMonthParam: monthParamFromDate(addMonths(selected, -1)),
		nextMonthParam: monthParamFromDate(addMonths(selected, 1)),
		weekdayLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
		hasMonthEvents: events.some((event) => event.date?.startsWith(monthParam)),
		weeks: Array.from({ length: 6 }, (_, weekIndex) => days.slice(weekIndex * 7, weekIndex * 7 + 7))
	};
}

export function parseCoordinate(value) {
	const text = clean(value);
	if (!text) return null;
	const number = Number(text);
	return Number.isFinite(number) ? number : null;
}

function serializeValue(value) {
	if (value instanceof ObjectId) return value.toString();
	if (value instanceof Date) return value.toISOString();
	if (Array.isArray(value)) return value.map(serializeValue);
	if (value && typeof value === "object") {
		return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, serializeValue(nested)]));
	}
	return value;
}

export function serialize(doc) {
	if (!doc) return null;
	const copy = serializeValue({ ...doc, id: doc._id.toString() });
	delete copy._id;
	return copy;
}

export function parseInvitedUserIds(form) {
	return [...new Set(form.getAll("invitedUserIds").flatMap((value) => clean(value).split(",")))]
		.map((id) => clean(id))
		.filter(Boolean);
}

export function recurrenceFromForm(form) {
	const frequency = repeatFrequencies.has(clean(form.get("repeatFrequency"))) ? clean(form.get("repeatFrequency")) : "none";
	const countValue = Number(clean(form.get("repeatCount")) || "1");
	const count = Number.isInteger(countValue) && countValue >= 1 && countValue <= maxRepeatCount ? countValue : 1;
	return {
		frequency,
		count: frequency === "none" ? 1 : count
	};
}

export function buildInvitations(existing = [], invitedUserIds = []) {
	const existingMap = new Map((existing || []).map((invitation) => [invitation.userId?.toString(), invitation.status || "invited"]));
	const now = new Date();
	return invitedUserIds.map((userId) => ({
		userId,
		status: existingMap.get(userId.toString()) === "accepted" ? "accepted" : "invited",
		updatedAt: now
	}));
}

function hasUploadedFile(value) {
	return value && typeof value === "object" && typeof value.arrayBuffer === "function" && value.size > 0;
}

export async function uploadedImageFields(
	form,
	fieldName,
	clearFieldName,
	existing = {},
	altFallback = "Uploaded image",
	uploadLabel = "Image upload"
) {
	const file = form.get(fieldName);
	if (hasUploadedFile(file)) {
		if (!allowedUploadTypes.has(file.type)) {
			throw new Error(`${uploadLabel}: Please upload a JPG, PNG, WebP or GIF image.`);
		}
		if (file.size > maxUploadBytes) {
			throw new Error(`${uploadLabel}: The selected file is too large. Please upload an image up to 2 MB.`);
		}
		const buffer = Buffer.from(await file.arrayBuffer());
		return {
			imageUrl: `data:${file.type};base64,${buffer.toString("base64")}`,
			imageAlt: altFallback,
			imageCredit: "",
			imageLicense: "",
			imageSourceUrl: ""
		};
	}

	if (form.get(clearFieldName)) {
		return {
			imageUrl: "",
			imageAlt: "",
			imageCredit: "",
			imageLicense: "",
			imageSourceUrl: ""
		};
	}

	return {
		imageUrl: existing.imageUrl || clean(form.get("imageUrl")),
		imageAlt: existing.imageAlt || clean(form.get("imageAlt")),
		imageCredit: existing.imageCredit || clean(form.get("imageCredit")),
		imageLicense: existing.imageLicense || clean(form.get("imageLicense")),
		imageSourceUrl: existing.imageSourceUrl || clean(form.get("imageSourceUrl"))
	};
}

export function defaultCoordinates(name, city, country, lat, lng) {
	const parsedLat = parseCoordinate(lat);
	const parsedLng = parseCoordinate(lng);
	if (parsedLat !== null && parsedLng !== null) return { lat: parsedLat, lng: parsedLng };

	const normalizedName = name.toLowerCase();
	const partialMatch = Object.entries(fallbackCoordinates).find(([place]) => normalizedName.includes(place));
	const locationCoordinates = fallbackCoordinates[normalizedName] || partialMatch?.[1];
	if (locationCoordinates) return locationCoordinates;

	return findCityCoordinates({ city: city || name, country }) || null;
}
