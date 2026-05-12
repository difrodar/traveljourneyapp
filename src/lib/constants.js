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
	"Outdoor"
];

export const repeatFrequencies = [
	{ value: "none", label: "Does not repeat" },
	{ value: "daily", label: "Daily" },
	{ value: "weekly", label: "Weekly" },
	{ value: "monthly", label: "Monthly" }
];

export const priorities = ["Low", "Medium", "High"];

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
export const MAP_TILE_MAX_ZOOM = 19;
export const MAP_TILE_ATTRIBUTION =
	'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const SEARCH_DEBOUNCE_MS = 350;
