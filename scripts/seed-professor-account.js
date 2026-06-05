#!/usr/bin/env node
// Seed a self-contained grading account `dozent` (password `Prototyping2026`) with a rich,
// fresh Zürich + Japan-themed dataset so a reviewing instructor can log in and immediately see
// every MVP workflow and all extensions in action. Deliberately distinct from demo_anna
// (San Diego / Italy) and the usability accounts.
//
// What it creates for `dozent`:
//   • 3 completed past events with memories (Zürich) — events list + journey
//   • 1 upcoming event (now+3d) — feeds the "upcoming soon" reminder (7-day window)
//   • 1 weekly recurring series ×4 — recurring badge + delete-series dialog
//   • Trip "Japan trip" with 2 completed events + memories — /journey?groupBy=trip group
//   • 2 travel ideas (High + Low)
//   • 1 pending invitation FROM demo_max ("Weekend in Munich")
// Every event/memory gets a real, license-verified Wikimedia Commons photo (attribution stored
// inline on each image, shown in-app — same convention as media.js and the other seed scripts).
//
// Dates are computed relative to `new Date()` so the account looks fresh whenever it is seeded
// (the deployed app uses real server time). Idempotent: wipes dozent's prior content first.
//
// Requires `npm run dev` running on http://localhost:5173 and MONGODB_URI in .env.
// IMPORTANT: this writes to whatever DB .env points at — point .env at the production Atlas DB
// (the one Netlify uses) if the account should be visible on the live site.
// Run with: node scripts/seed-professor-account.js

import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";

const BASE_URL = "http://localhost:5173";
const DOZENT = { username: "dozent", password: "Prototyping2026" };
const MAX = { username: "demo_max", password: "demo_max_pw" };
const MUNICH_INVITE_TITLE = "Weekend in Munich";

function loadEnv() {
	try {
		const raw = readFileSync(".env", "utf8");
		for (const line of raw.split(/\r?\n/)) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) continue;
			const idx = trimmed.indexOf("=");
			if (idx === -1) continue;
			const key = trimmed.slice(0, idx).trim();
			const value = trimmed.slice(idx + 1).trim().replace(/^"|"$/g, "");
			if (!process.env[key]) process.env[key] = value;
		}
	} catch {}
}
loadEnv();

// Local-time YYYY-MM-DD, `days` from today. Mirrors the app's date-key format.
function dateOffset(days) {
	const d = new Date();
	d.setDate(d.getDate() + days);
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

function wikimedia(fileName, width = 1200) {
	return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=${width}`;
}

// All entries are real, license-verified Wikimedia Commons files (checked against their File: pages).
const IMG = {
	lakeZurich: {
		imageUrl: wikimedia("Zürich - Bürkliplatz IMG 0524.JPG"),
		imageAlt: "Bürkliplatz square on the shore of Lake Zürich",
		imageCredit: "Roland Fischer / Wikimedia Commons",
		imageLicense: "CC BY-SA 3.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Z%C3%BCrich_-_B%C3%BCrkliplatz_IMG_0524.JPG"
	},
	oldTown: {
		imageUrl: wikimedia("Bauschänzli - Stadthausquai - Limmat - Grossmünster - Limmatquai - Quaibrücke 2012-07-30 09-01-26.JPG"),
		imageAlt: "Grossmünster and the Limmat river in Zürich's old town",
		imageCredit: "Roland Fischer / Wikimedia Commons",
		imageLicense: "CC BY-SA 3.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Bausch%C3%A4nzli_-_Stadthausquai_-_Limmat_-_Grossm%C3%BCnster_-_Limmatquai_-_Quaibr%C3%BCcke_2012-07-30_09-01-26.JPG"
	},
	uetliberg: {
		imageUrl: wikimedia("Zürichsee - Uetliberg IMG 0833.JPG"),
		imageAlt: "View over Lake Zürich from the Uetliberg",
		imageCredit: "Roland Fischer / Wikimedia Commons",
		imageLicense: "CC BY-SA 3.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Z%C3%BCrichsee_-_Uetliberg_IMG_0833.JPG"
	},
	opera: {
		imageUrl: wikimedia("Sechseläutenplatz - Opernhaus - Springbrunnen - Bellevue Zürich 2014-10-29 12-59-21 (P7800).JPG"),
		imageAlt: "Opernhaus Zürich at Sechseläutenplatz",
		imageCredit: "Roland Fischer / Wikimedia Commons",
		imageLicense: "CC BY-SA 3.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Sechsel%C3%A4utenplatz_-_Opernhaus_-_Springbrunnen_-_Bellevue_Z%C3%BCrich_2014-10-29_12-59-21_(P7800).JPG"
	},
	sensoji: {
		imageUrl: wikimedia("Senso-ji main hall 012006.JPG"),
		imageAlt: "Main hall of Sensō-ji temple in Asakusa, Tokyo",
		imageCredit: "Eckhard Pecher / Wikimedia Commons",
		imageLicense: "CC BY 2.5",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Senso-ji_main_hall_012006.JPG"
	},
	fushimi: {
		imageUrl: wikimedia("Fushimi Inari-taisha sembon-torii.jpg"),
		imageAlt: "Thousand torii gates at Fushimi Inari-taisha, Kyoto",
		imageCredit: "M338 / Wikimedia Commons",
		imageLicense: "CC0 1.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Fushimi_Inari-taisha_sembon-torii.jpg"
	},
	munich: {
		imageUrl: wikimedia("Frauenkirche and Neues Rathaus Munich March 2013.JPG"),
		imageAlt: "Frauenkirche and the New Town Hall at Marienplatz, Munich",
		imageCredit: "Martin Falbisoner / Wikimedia Commons",
		imageLicense: "CC BY-SA 3.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Frauenkirche_and_Neues_Rathaus_Munich_March_2013.JPG"
	}
};

function memoryImage(meta, label) {
	return {
		url: meta.imageUrl,
		alt: label || meta.imageAlt,
		credit: meta.imageCredit,
		license: meta.imageLicense,
		sourceUrl: meta.imageSourceUrl
	};
}

// Cookie-aware form-action client. Array values are appended (needed for invitedUserIds[]).
function makeClient(label) {
	let cookie = "";
	const setCookie = (response) => {
		const header = response.headers.get("set-cookie");
		if (!header) return;
		const match = header.match(/triptales_session=([^;]+)/);
		if (match) cookie = `triptales_session=${match[1]}`;
	};
	async function action(path, name, fields) {
		const fd = new FormData();
		for (const [key, value] of Object.entries(fields)) {
			if (Array.isArray(value)) {
				for (const v of value) fd.append(key, String(v));
			} else if (value !== undefined && value !== null) {
				fd.set(key, String(value));
			}
		}
		const headers = { Origin: BASE_URL };
		if (cookie) headers.Cookie = cookie;
		const response = await fetch(`${BASE_URL}${path}?/${name}`, {
			method: "POST",
			redirect: "manual",
			headers,
			body: fd
		});
		setCookie(response);
		const text = await response.text();
		let envelope;
		try {
			envelope = JSON.parse(text);
		} catch {
			throw new Error(`POST ${path}?/${name} non-JSON (status ${response.status}): ${text.slice(0, 300)}`);
		}
		if (envelope.type === "failure" || envelope.type === "error") {
			throw new Error(`POST ${path}?/${name} ${envelope.type}: ${text.slice(0, 400)}`);
		}
		return envelope;
	}
	return {
		label,
		action,
		async login(creds) {
			const result = await action("/login", "login", { username: creds.username, password: creds.password });
			if (result.type !== "redirect") throw new Error(`[${label}] login unexpected: ${JSON.stringify(result)}`);
		},
		async signup(creds) {
			const result = await action("/login", "signup", { username: creds.username, password: creds.password });
			if (result.type !== "redirect") throw new Error(`[${label}] signup unexpected: ${JSON.stringify(result)}`);
		}
	};
}

async function ensureUser(client, creds) {
	try {
		await client.signup(creds);
		return "created";
	} catch (error) {
		if (/already taken/i.test(error.message)) {
			await client.login(creds);
			return "existing";
		}
		throw error;
	}
}

async function createEvent(client, fields) {
	const result = await client.action("/events/new", "create", {
		repeatFrequency: "none",
		repeatCount: "1",
		status: "planned",
		country: "Switzerland",
		...fields
	});
	// Events with invitations redirect to /events/<id>?invited=1, so tolerate an optional query string.
	const match = result.type === "redirect" ? result.location?.match(/^\/events\/([0-9a-f]+)(?:\?.*)?$/) : null;
	if (!match) throw new Error(`createEvent unexpected: ${JSON.stringify(result)}`);
	return match[1];
}

async function createTrip(client, fields) {
	const result = await client.action("/trips", "create", fields);
	const match = result.type === "redirect" ? result.location?.match(/^\/trips\/([0-9a-f]+)$/) : null;
	if (!match) throw new Error(`createTrip unexpected: ${JSON.stringify(result)}`);
	return match[1];
}

async function createIdea(client, fields) {
	const result = await client.action("/ideas", "create", { priority: "Medium", country: "USA", ...fields });
	if (result.type !== "success") throw new Error(`createIdea unexpected: ${JSON.stringify(result)}`);
}

async function fetchUserId(db, username) {
	const user = await db.collection("users").findOne({ username: username.toLowerCase() });
	if (!user) throw new Error(`User ${username} not found in MongoDB after signup`);
	return user._id;
}

async function step(name, fn) {
	process.stdout.write(`  ${name}... `);
	try {
		const result = await fn();
		console.log("ok");
		return result;
	} catch (error) {
		console.log("FAIL");
		throw error;
	}
}

async function main() {
	console.log(`TripTales professor-account seed against ${BASE_URL}`);

	const dozent = makeClient("dozent");
	const max = makeClient("max");

	console.log("\n[1/6] Signup / login dozent + demo_max");
	const dozentState = await step("ensure dozent", () => ensureUser(dozent, DOZENT));
	const maxState = await step("ensure demo_max", () => ensureUser(max, MAX));
	console.log(`  dozent: ${dozentState}, demo_max: ${maxState}`);

	const uri = process.env.MONGODB_URI;
	if (!uri) throw new Error("MONGODB_URI missing in .env");
	const mongo = new MongoClient(uri);
	await mongo.connect();
	const db = mongo.db(process.env.MONGODB_DB || "triptales");

	const dozentId = await fetchUserId(db, DOZENT.username);
	const maxId = await fetchUserId(db, MAX.username);

	console.log("\n[2/6] Reset prior dozent content (idempotency)");
	await step("wipe dozent data + stale invites", async () => {
		const owned = await db.collection("events").find({ userId: dozentId }).project({ _id: 1 }).toArray();
		const ownedIds = owned.map((e) => e._id);
		await Promise.all([
			db.collection("events").deleteMany({ userId: dozentId }),
			db.collection("journeyEntries").deleteMany({ userId: dozentId }),
			db.collection("trips").deleteMany({ userId: dozentId }),
			db.collection("locations").deleteMany({ userId: dozentId }),
			db.collection("travelIdeas").deleteMany({ userId: dozentId })
		]);
		// Drop any prior pending invitation that targets dozent (e.g. demo_max's invite from a past run).
		await db.collection("events").updateMany(
			{ invitedUserIds: dozentId },
			{ $pull: { invitedUserIds: dozentId, invitations: { userId: dozentId } } }
		);
		// Remove demo_max's prior invite event by title so it doesn't accumulate (wipe above is dozent-scoped).
		await db.collection("events").deleteMany({ userId: maxId, title: MUNICH_INVITE_TITLE });
		// Keep dozent's session (we're authenticated with it); only data is purged.
		return ownedIds.length;
	});

	console.log("\n[3/6] Create dozent events (Zürich home base) + Japan trip");
	// 3 completed past events (Zürich) — dates in the past; completed + memory set in step [5].
	await step("past: Lake Zürich promenade walk", () =>
		createEvent(dozent, {
			title: "Lake Zürich promenade walk",
			category: "Outdoor",
			date: dateOffset(-30),
			time: "15:00",
			locationName: "Bürkliplatz Promenade",
			city: "Zürich",
			lat: "47.3664",
			lng: "8.5410",
			description: "Spaziergang am Seebecken, Glace und Schiffe beobachten."
		})
	);
	await step("past: Old Town food tour", () =>
		createEvent(dozent, {
			title: "Old Town food tour",
			category: "Food",
			date: dateOffset(-18),
			time: "12:30",
			locationName: "Zürich Old Town",
			address: "Niederdorfstrasse",
			city: "Zürich",
			lat: "47.3717",
			lng: "8.5430",
			description: "Raclette, Luxemburgerli und Käse durch die Altstadtgassen."
		})
	);
	await step("past: Uetliberg sunrise hike", () =>
		createEvent(dozent, {
			title: "Uetliberg sunrise hike",
			category: "Outdoor",
			date: dateOffset(-9),
			time: "06:00",
			locationName: "Uetliberg",
			city: "Zürich",
			lat: "47.3499",
			lng: "8.4914",
			description: "Sonnenaufgang über dem Nebelmeer am Hausberg von Zürich."
		})
	);

	// 1 upcoming event within the 7-day reminder window.
	await step(`upcoming: Opera night (${dateOffset(3)})`, () =>
		createEvent(dozent, {
			title: "Opera night at Opernhaus Zürich",
			category: "Culture",
			date: dateOffset(3),
			time: "19:30",
			locationName: "Opernhaus Zürich",
			address: "Falkenstrasse 1",
			city: "Zürich",
			lat: "47.3650",
			lng: "8.5456",
			description: "La Bohème am Sechseläutenplatz — Tickets sind gebucht."
		})
	);

	// 1 weekly recurring series ×4 — recurring badge + delete-series dialog.
	await step("recurring: German conversation meetup x4", () =>
		createEvent(dozent, {
			title: "German conversation meetup",
			category: "Study",
			date: dateOffset(2),
			time: "18:30",
			locationName: "Sprachcafé Niederdorf",
			city: "Zürich",
			lat: "47.3724",
			lng: "8.5443",
			description: "Wöchentlicher Stammtisch zum Deutsch üben.",
			repeatFrequency: "weekly",
			repeatCount: "4"
		})
	);

	// Trip with 2 past completed events (Japan) — appears as its own /journey?groupBy=trip group.
	const tripId = await step("trip: Japan trip", () =>
		createTrip(dozent, {
			name: "Japan trip",
			dateFrom: dateOffset(-40),
			dateTo: dateOffset(-38),
			description: "Tokyo und Kyoto — Tempel, Ramen und Kirschblüten."
		})
	);
	const sensojiId = await step("trip event: Sensō-ji Temple visit", () =>
		createEvent(dozent, {
			title: "Sensō-ji Temple visit",
			category: "Culture",
			date: dateOffset(-40),
			time: "10:00",
			locationName: "Sensō-ji Temple",
			address: "2-3-1 Asakusa",
			city: "Tokyo",
			country: "Japan",
			lat: "35.7148",
			lng: "139.7967",
			description: "Ältester Tempel Tokyos, durch das Kaminarimon-Tor zur Haupthalle."
		})
	);
	await step("  attach Sensō-ji to trip", () => dozent.action(`/trips/${tripId}`, "addEvent", { eventId: sensojiId }));
	const fushimiId = await step("trip event: Fushimi Inari shrine hike", () =>
		createEvent(dozent, {
			title: "Fushimi Inari shrine hike",
			category: "Outdoor",
			date: dateOffset(-39),
			time: "08:00",
			locationName: "Fushimi Inari Shrine",
			address: "68 Fukakusa Yabunouchichō",
			city: "Kyoto",
			country: "Japan",
			lat: "34.9671",
			lng: "135.7727",
			description: "Aufstieg durch den Tausend-Torii-Pfad am frühen Morgen."
		})
	);
	await step("  attach Fushimi Inari to trip", () => dozent.action(`/trips/${tripId}`, "addEvent", { eventId: fushimiId }));

	console.log("\n[4/6] Create 2 travel ideas + demo_max invitation");
	await step("idea: Norway fjords cruise (High)", () =>
		createIdea(dozent, {
			title: "Norway fjords cruise",
			location: "Geirangerfjord",
			city: "Bergen",
			country: "Norway",
			category: "Outdoor",
			priority: "High",
			notes: "Hurtigruten ab Bergen, Geirangerfjord und Trolltunga. Beste Reisezeit Juni–August."
		})
	);
	await step("idea: Iceland Golden Circle (Low)", () =>
		createIdea(dozent, {
			title: "Iceland Golden Circle",
			location: "Þingvellir National Park",
			city: "Reykjavík",
			country: "Iceland",
			category: "Sightseeing",
			priority: "Low",
			notes: "Þingvellir, Geysir und Gullfoss an einem Tag. Mietwagen ab Reykjavík."
		})
	);

	await step(`demo_max invites dozent: ${MUNICH_INVITE_TITLE} (${dateOffset(5)})`, () =>
		createEvent(max, {
			title: MUNICH_INVITE_TITLE,
			category: "Weekend Trip",
			date: dateOffset(5),
			time: "10:00",
			locationName: "Marienplatz",
			city: "Munich",
			country: "Germany",
			lat: "48.1374",
			lng: "11.5755",
			description: "Wochenende in München am Marienplatz — komm doch mit!",
			invitedUserIds: [dozentId.toString()]
		})
	);

	console.log("\n[5/6] Complete past events, attach memories + Wikimedia photos");
	const now = new Date();

	// Attach a location photo to a set of events (by title) owned by `userId`.
	async function paintLocations(userId, titleToMeta) {
		const titles = Object.keys(titleToMeta);
		const events = await db.collection("events").find({ userId, title: { $in: titles } }).toArray();
		for (const event of events) {
			const meta = titleToMeta[event.title];
			if (!meta || !event.locationId) continue;
			await db.collection("locations").updateOne({ _id: event.locationId }, { $set: { ...meta, updatedAt: now } });
		}
	}

	// Completed events: set status, upsert memory (text + photo), and paint the location.
	const completed = [
		{ title: "Lake Zürich promenade walk", meta: IMG.lakeZurich, memoryText: "Sonniger Nachmittag entlang der Seepromenade, Glace am Bürkliplatz und die Boote beobachtet." },
		{ title: "Old Town food tour", meta: IMG.oldTown, memoryText: "Durch die Niederdorf-Gassen geschlendert, Raclette und Luxemburgerli probiert." },
		{ title: "Uetliberg sunrise hike", meta: IMG.uetliberg, memoryText: "Früh aufgestanden für den Sonnenaufgang — Nebelmeer über dem Zürichsee, fantastische Sicht." },
		{ title: "Sensō-ji Temple visit", meta: IMG.sensoji, memoryText: "Durch das Kaminarimon-Tor zur Haupthalle, Räucherstäbchen-Duft und ein Omikuji-Orakel gezogen." },
		{ title: "Fushimi Inari shrine hike", meta: IMG.fushimi, memoryText: "Den Tausend-Torii-Pfad hochgewandert, früh am Morgen fast menschenleer und magisch." }
	];
	for (const item of completed) {
		await step(`  complete + memory: ${item.title}`, async () => {
			const event = await db.collection("events").findOne({ userId: dozentId, title: item.title });
			if (!event) throw new Error(`event not found: ${item.title}`);
			await db.collection("events").updateOne({ _id: event._id }, { $set: { status: "completed", updatedAt: now } });
			if (event.locationId) {
				await db.collection("locations").updateOne({ _id: event.locationId }, { $set: { ...item.meta, updatedAt: now } });
			}
			await db.collection("journeyEntries").findOneAndUpdate(
				{ userId: dozentId, eventId: event._id },
				{
					$set: {
						memoryText: item.memoryText,
						images: [memoryImage(item.meta, `${event.title} — memory photo`)],
						updatedAt: now
					},
					$setOnInsert: { userId: dozentId, eventId: event._id, createdAt: now }
				},
				{ upsert: true }
			);
		});
	}

	// Planned events (no memory): paint their location photo so the cards aren't placeholders.
	await step("  photo: Opera night + recurring meetup", () =>
		paintLocations(dozentId, {
			"Opera night at Opernhaus Zürich": IMG.opera,
			"German conversation meetup": IMG.oldTown
		})
	);
	await step("  photo: demo_max Munich invite", () => paintLocations(maxId, { [MUNICH_INVITE_TITLE]: IMG.munich }));

	// Set a 1-week in-app reminder on the upcoming Opera night (extension 4.12). Opera night is ~3 days
	// out, so a 168h lead-time puts it inside the "due" window now -> shows in the bell's "Reminders due"
	// section with a countdown, plus the "Coming up" banner + reminder row on the event detail.
	await step("  reminder: Opera night (1 week before, in-app 4.12)", () =>
		db.collection("events").updateOne(
			{ userId: dozentId, title: "Opera night at Opernhaus Zürich" },
			{ $set: { reminderLeadHours: 168, updatedAt: now } }
		)
	);

	console.log("\n[6/6] Done");
	await mongo.close();

	console.log("\n✅ Professor account ready.");
	console.log("\n  Login:");
	console.log(`    URL:      ${BASE_URL}/login   (and the live Netlify site, if .env points at its DB)`);
	console.log(`    Username: ${DOZENT.username}`);
	console.log(`    Password: ${DOZENT.password}`);
	console.log("\n  dozent should now show:");
	console.log("    • 3 completed events with memories (Zürich: promenade, food tour, Uetliberg)");
	console.log(`    • 1 upcoming event (${dateOffset(3)} — Opera night) with a 1-week in-app reminder (bell "Reminders due" + "Coming up" banner)`);
	console.log(`    • 1 weekly recurring series ×4 starting ${dateOffset(2)} (German conversation meetup)`);
	console.log("    • Trip \"Japan trip\" with Sensō-ji + Fushimi Inari (completed, in /journey?groupBy=trip)");
	console.log("    • 2 ideas (Norway fjords High, Iceland Golden Circle Low)");
	console.log(`    • 1 pending invitation from demo_max (${MUNICH_INVITE_TITLE}, ${dateOffset(5)})`);
	console.log("    • Real Wikimedia photos on every event + memory card");
}

main().catch((error) => {
	if (error.cause?.code === "ECONNREFUSED") {
		console.error(`\nDev server not reachable at ${BASE_URL}. Start it with \`npm run dev\`.`);
	} else {
		console.error("\n" + (error.stack || error.message));
	}
	process.exit(1);
});
