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
	addPhoto(photos, item.media?.imageUrl, item.media?.imageAlt || item.title, "Event cover", item.media?.imageCredit, item.media?.imageLicense);
	addPhoto(
		photos,
		item.location?.media?.imageUrl,
		item.location?.media?.imageAlt || item.location?.name,
		"Location",
		item.location?.media?.imageCredit,
		item.location?.media?.imageLicense
	);
	addPhoto(photos, item.journeyEntry?.imageUrl, `${item.title} memory`, "Memory photo");
	return photos;
}
