import { error } from "@sveltejs/kit";
import { getEvent } from "$lib/server/repository.js";

// Per RFC 5545 §3.3.11: backslash, comma, semicolon, and newlines must be escaped in TEXT properties.
function escapeIcsText(value) {
	return String(value || "")
		.replace(/\\/g, "\\\\")
		.replace(/\r?\n/g, "\\n")
		.replace(/,/g, "\\,")
		.replace(/;/g, "\\;");
}

function toDateTimeStamp(date, time, addHours = 0) {
	const [year, month, day] = (date || "1970-01-01").split("-").map(Number);
	const [hour, minute] = (time || "00:00").split(":").map(Number);
	const d = new Date(Date.UTC(year, (month || 1) - 1, day || 1, hour || 0, (minute || 0) + addHours * 60));
	const pad = (n) => String(n).padStart(2, "0");
	return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
}

export async function GET({ locals, params }) {
	const event = await getEvent(locals.user.id, params.id);
	if (!event) throw error(404, "Event not found");

	const dtStart = toDateTimeStamp(event.date, event.time, 0);
	const dtEnd = toDateTimeStamp(event.date, event.time, 2);
	const dtStamp = toDateTimeStamp(new Date().toISOString().slice(0, 10), new Date().toISOString().slice(11, 16), 0);
	const locationParts = [event.location?.name, event.location?.city, event.location?.country].filter(Boolean).join(", ");

	const lines = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//TripTales//EN",
		"CALSCALE:GREGORIAN",
		"BEGIN:VEVENT",
		`UID:${event.id}@triptales`,
		`DTSTAMP:${dtStamp}`,
		`DTSTART:${dtStart}`,
		`DTEND:${dtEnd}`,
		`SUMMARY:${escapeIcsText(event.title)}`,
		`DESCRIPTION:${escapeIcsText(event.description)}`,
		`LOCATION:${escapeIcsText(locationParts)}`,
		"END:VEVENT",
		"END:VCALENDAR"
	];

	return new Response(lines.join("\r\n") + "\r\n", {
		status: 200,
		headers: {
			"Content-Type": "text/calendar; charset=utf-8",
			"Content-Disposition": `attachment; filename="event-${event.id}.ics"`
		}
	});
}
