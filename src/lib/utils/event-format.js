export function formatEventDate(date, time) {
	if (!date) return "Date not set";
	const eventDate = new Date(`${date}T${time || "00:00"}`);
	if (Number.isNaN(eventDate.getTime())) return `${date}${time ? ` at ${time}` : ""}`;
	return new Intl.DateTimeFormat("en", {
		month: "long",
		day: "numeric",
		year: "numeric",
		hour: time ? "numeric" : undefined,
		minute: time ? "2-digit" : undefined
	}).format(eventDate);
}

function addPhoto(photos, url, alt, label, credit = "", license = "") {
	if (!url || photos.some((photo) => photo.url === url)) return;
	photos.push({ url, alt, label, credit, license });
}

export function buildGallery(item) {
	const photos = [];
	for (const img of item.media?.images || []) {
		addPhoto(photos, img.url, img.alt || item.title, "Event photo", img.credit || "", img.license || "");
	}
	for (const img of item.location?.media?.images || []) {
		addPhoto(photos, img.url, img.alt || item.location?.name, "Location", img.credit || "", img.license || "");
	}
	for (const img of item.journeyEntry?.images || []) {
		addPhoto(photos, img.url, img.alt || `${item.title} memory`, "Memory photo");
	}
	return photos;
}

export function buildShareText(event) {
	if (!event) return "";
	const title = (event.title || "").trim();
	const place = (event.location?.city || event.location?.country || "").trim();
	const body = (event.journeyEntry?.memoryText || event.description || "").trim();
	const trimmed = body.length > 140 ? `${body.slice(0, 137).trimEnd()}…` : body;
	const lines = [];
	if (title) lines.push(place ? `${title} — ${place}` : title);
	else if (place) lines.push(place);
	if (trimmed) lines.push(trimmed);
	lines.push("");
	lines.push("shared via TripTales");
	return lines.join("\n");
}
