#!/usr/bin/env node
// Minimal end-to-end smoke test for the TripTales form actions.
// Run `npm run dev` in another terminal first, then `npm run smoke`.
// Override the target via SMOKE_URL / SMOKE_USER / SMOKE_PASSWORD env vars.

const BASE_URL = (process.env.SMOKE_URL || "http://localhost:5173").replace(/\/$/, "");
const USERNAME = process.env.SMOKE_USER || "dummy";
const PASSWORD = process.env.SMOKE_PASSWORD || "dummy";
const EVENT_TITLE = `Smoke test ${new Date().toISOString()}`;

let sessionCookie = "";

function setCookieFromResponse(response) {
	const setCookie = response.headers.get("set-cookie");
	if (!setCookie) return;
	const match = setCookie.match(/triptales_session=([^;]+)/);
	if (match) sessionCookie = `triptales_session=${match[1]}`;
}

async function get(path) {
	const headers = sessionCookie ? { Cookie: sessionCookie } : {};
	const response = await fetch(`${BASE_URL}${path}`, { headers });
	setCookieFromResponse(response);
	if (response.status !== 200) {
		throw new Error(`GET ${path} expected 200 got ${response.status}`);
	}
}

// SvelteKit form actions called via fetch return HTTP 200 with a JSON envelope:
//   {type:"redirect",status:303,location:"/path"}
//   {type:"success",status:200,data:"<serialized return>"}
//   {type:"failure",status:400,data:"<serialized fail payload>"}
async function action(path, name, fields) {
	const fd = new FormData();
	for (const [key, value] of Object.entries(fields)) {
		if (Array.isArray(value)) {
			for (const v of value) {
				if (v instanceof Blob) fd.append(key, v, v.name || "upload.bin");
				else fd.append(key, String(v));
			}
		} else if (value instanceof Blob) {
			fd.append(key, value, value.name || "upload.bin");
		} else {
			fd.set(key, value);
		}
	}
	const headers = { Origin: BASE_URL };
	if (sessionCookie) headers.Cookie = sessionCookie;
	const response = await fetch(`${BASE_URL}${path}?/${name}`, {
		method: "POST",
		redirect: "manual",
		headers,
		body: fd
	});
	setCookieFromResponse(response);
	const text = await response.text();
	let envelope;
	try {
		envelope = JSON.parse(text);
	} catch {
		throw new Error(`POST ${path}?/${name} returned non-JSON (status ${response.status}):\n${text.slice(0, 400)}`);
	}
	if (envelope.type === "failure" || envelope.type === "error") {
		throw new Error(`POST ${path}?/${name} returned ${envelope.type}: ${text.slice(0, 400)}`);
	}
	return envelope;
}

async function step(name, fn) {
	process.stdout.write(`- ${name}... `);
	try {
		const result = await fn();
		console.log("ok");
		return result;
	} catch (error) {
		console.log("FAIL");
		console.error(error.message);
		process.exit(1);
	}
}

async function main() {
	console.log(`TripTales smoke test against ${BASE_URL} as ${USERNAME}`);

	await step("login", async () => {
		const result = await action("/login", "login", { username: USERNAME, password: PASSWORD });
		if (!sessionCookie) throw new Error("no session cookie set");
		if (result.type !== "redirect" || result.location !== "/") {
			throw new Error(`unexpected login result: ${JSON.stringify(result)}`);
		}
	});

	let eventId = "";
	await step("create event", async () => {
		const result = await action("/events/new", "create", {
			title: EVENT_TITLE,
			category: "Beach",
			date: "2027-01-01",
			time: "12:00",
			status: "planned",
			locationName: "Smoke Beach",
			city: "San Diego",
			country: "USA",
			lat: "32.8025",
			lng: "-117.2366",
			description: "smoke test fixture",
			repeatFrequency: "none",
			repeatCount: "1"
		});
		const match = result.type === "redirect" ? result.location?.match(/^\/events\/([0-9a-f]+)$/) : null;
		if (!match) throw new Error(`unexpected create result: ${JSON.stringify(result)}`);
		eventId = match[1];
	});

	await step("list events", () => get("/events"));

	await step("download ics", async () => {
		const headers = sessionCookie ? { Cookie: sessionCookie } : {};
		const response = await fetch(`${BASE_URL}/events/${eventId}/ics`, { headers });
		if (response.status !== 200) throw new Error(`expected 200 got ${response.status}`);
		const ct = response.headers.get("content-type") || "";
		if (!ct.startsWith("text/calendar")) throw new Error(`expected text/calendar got ${ct}`);
		const body = await response.text();
		if (!body.includes("BEGIN:VEVENT") || !body.includes(EVENT_TITLE)) {
			throw new Error(`ics body missing required parts: ${body.slice(0, 200)}`);
		}
	});

	await step("save journey memory with 2 images", async () => {
		const tinyPng = Buffer.from(
			"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAfbLI3wAAAABJRU5ErkJggg==",
			"base64"
		);
		const file1 = new File([tinyPng], "smoke-1.png", { type: "image/png" });
		const file2 = new File([tinyPng], "smoke-2.png", { type: "image/png" });
		const result = await action(`/events/${eventId}`, "complete", {
			memoryText: `smoke memory ${Date.now()}`,
			memoryImageFiles: [file1, file2]
		});
		if (result.type !== "success") {
			throw new Error(`unexpected complete result: ${JSON.stringify(result)}`);
		}
	});

	await step("dashboard awaiting-memory section renders", () => get("/"));

	await step("list journey", () => get("/journey"));

	let tripId = "";
	await step("create trip", async () => {
		const result = await action("/trips", "create", { name: `Smoke trip ${Date.now()}` });
		const match = result.location?.match(/^\/trips\/([0-9a-f]+)$/);
		if (!match) throw new Error(`unexpected trip create result: ${JSON.stringify(result)}`);
		tripId = match[1];
	});

	await step("add event to trip", async () => {
		const result = await action(`/trips/${tripId}`, "addEvent", { eventId });
		if (result.type !== "success") {
			throw new Error(`addEvent failed: ${JSON.stringify(result)}`);
		}
	});

	await step("trip detail renders with event", async () => {
		const headers = sessionCookie ? { Cookie: sessionCookie } : {};
		const response = await fetch(`${BASE_URL}/trips/${tripId}`, { headers });
		if (response.status !== 200) {
			throw new Error(`expected 200 got ${response.status}`);
		}
		const html = await response.text();
		if (!html.includes(EVENT_TITLE)) {
			throw new Error("trip detail missing event title");
		}
	});

	await step("journey by-trip view groups by trip", async () => {
		const headers = sessionCookie ? { Cookie: sessionCookie } : {};
		const response = await fetch(`${BASE_URL}/journey?groupBy=trip`, { headers });
		if (response.status !== 200) {
			throw new Error(`expected 200 got ${response.status}`);
		}
	});

	let tripShareHash = "";
	await step("create trip-scoped share", async () => {
		const result = await action("/journey", "share", { expiresIn: "7d", tripId });
		if (result.type !== "success") {
			throw new Error(`unexpected trip-share result: ${JSON.stringify(result)}`);
		}
		const match = String(result.data || "").match(/[a-f0-9]{32}/);
		if (!match) throw new Error(`no trip-share hash in result: ${result.data}`);
		tripShareHash = match[0];
	});

	await step("trip-scoped share renders with event title only", async () => {
		const response = await fetch(`${BASE_URL}/share/${tripShareHash}`);
		if (response.status !== 200) {
			throw new Error(`expected 200 got ${response.status}`);
		}
		const html = await response.text();
		if (!html.includes(EVENT_TITLE)) {
			throw new Error("trip share missing event title");
		}
		if (!html.includes("Shared TripTales trip")) {
			throw new Error("trip share missing 'Shared TripTales trip' eyebrow");
		}
	});

	await step("remove event from trip", async () => {
		const result = await action(`/trips/${tripId}`, "removeEvent", { eventId });
		if (result.type !== "success") {
			throw new Error(`removeEvent failed: ${JSON.stringify(result)}`);
		}
	});

	await step("delete trip", async () => {
		const result = await action(`/trips/${tripId}`, "delete", {});
		if (result.type !== "redirect" || result.location !== "/trips") {
			throw new Error(`unexpected trip delete: ${JSON.stringify(result)}`);
		}
	});

	await step("trip share auto-revoked after trip delete", async () => {
		const response = await fetch(`${BASE_URL}/share/${tripShareHash}`);
		if (response.status !== 404) {
			throw new Error(`expected 404 after trip delete, got ${response.status}`);
		}
	});

	let shareHash = "";
	await step("create share link", async () => {
		const result = await action("/journey", "share", { expiresIn: "7d" });
		if (result.type !== "success") {
			throw new Error(`unexpected share result: ${JSON.stringify(result)}`);
		}
		const match = String(result.data || "").match(/[a-f0-9]{32}/);
		if (!match) throw new Error(`no share hash in result: ${result.data}`);
		shareHash = match[0];
	});

	await step("public share renders without auth", async () => {
		// Deliberately omit Cookie header to verify the route is public.
		const response = await fetch(`${BASE_URL}/share/${shareHash}`);
		if (response.status !== 200) {
			throw new Error(`expected 200 got ${response.status}`);
		}
		const html = await response.text();
		if (!html.includes(EVENT_TITLE)) {
			throw new Error("share page missing event title");
		}
		for (const marker of ["invitedUserIds", '"invitations"', '"isOwner"', '"invitationStatus"']) {
			if (html.includes(marker)) {
				throw new Error(`leak marker present in public share: ${marker}`);
			}
		}
	});

	await step("revoke share link", async () => {
		const result = await action("/profile", "revoke", { hash: shareHash });
		if (result.type !== "success") {
			throw new Error(`unexpected revoke result: ${JSON.stringify(result)}`);
		}
	});

	await step("revoked share returns 404", async () => {
		const response = await fetch(`${BASE_URL}/share/${shareHash}`);
		if (response.status !== 404) {
			throw new Error(`expected 404 got ${response.status}`);
		}
	});

	await step("invalid share hash returns 404", async () => {
		const response = await fetch(`${BASE_URL}/share/short`);
		if (response.status !== 404) {
			throw new Error(`expected 404 got ${response.status}`);
		}
	});

	await step("delete event (cleanup)", async () => {
		const result = await action(`/events/${eventId}`, "delete", { deleteScope: "single" });
		if (result.type !== "redirect" || result.location !== "/events") {
			throw new Error(`unexpected delete result: ${JSON.stringify(result)}`);
		}
	});

	console.log("\nall steps passed");
}

main().catch((error) => {
	if (error.cause?.code === "ECONNREFUSED") {
		console.error(`\nCould not reach ${BASE_URL}. Is \`npm run dev\` running?`);
	} else {
		console.error(error);
	}
	process.exit(1);
});
