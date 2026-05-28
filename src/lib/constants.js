export const categories = [
	"Beach",
	"Food",
	"Party",
	"Sightseeing",
	"Travel",
	"Flight",
	"Weekend Trip",
	"Study",
	"Education",
	"Culture",
	"Outdoor",
	"Other"
];

export const repeatFrequencies = [
	{ value: "none", label: "Does not repeat" },
	{ value: "daily", label: "Daily" },
	{ value: "weekly", label: "Weekly" },
	{ value: "monthly", label: "Monthly" }
];

export const priorities = ["Low", "Medium", "High"];

// In-app reminder lead-time presets (issue #36 / U6). Empty value = no reminder; numeric values
// are hours before event start when the reminder enters the "due" window for the notification bell.
export const reminderLeadOptions = [
	{ value: "", label: "No reminder" },
	{ value: "1", label: "1 hour before" },
	{ value: "3", label: "3 hours before" },
	{ value: "12", label: "12 hours before" },
	{ value: "24", label: "1 day before" },
	{ value: "168", label: "1 week before" }
];

export const reminderLeadHoursAllowed = new Set([1, 3, 12, 24, 168]);

export const statusLabels = {
	planned: "Planned",
	completed: "Completed"
};

export const UPLOAD_MAX_BYTES = 2 * 1024 * 1024;
export const UPLOAD_MAX_IMAGES = 5;
export const UPLOAD_MAX_TOTAL_BYTES = 9 * 1024 * 1024;
export const UPLOAD_ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const AVATAR_MAX_BYTES = 1 * 1024 * 1024;
export const AVATAR_ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const MAP_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const MAP_TILE_DARK_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
export const MAP_TILE_MAX_ZOOM = 19;
export const MAP_TILE_ATTRIBUTION =
	'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
export const MAP_TILE_DARK_ATTRIBUTION =
	'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

export const SEARCH_DEBOUNCE_MS = 350;
