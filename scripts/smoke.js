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
	for (const [key, value] of Object.entries(fields)) fd.set(key, value);
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

	await step("save journey memory", async () => {
		const result = await action(`/events/${eventId}`, "complete", {
			memoryText: `smoke memory ${Date.now()}`
		});
		if (result.type !== "success") {
			throw new Error(`unexpected complete result: ${JSON.stringify(result)}`);
		}
	});

	await step("list journey", () => get("/journey"));

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
