#!/usr/bin/env node
// One-off setup for the usability-test account `demo_traveler`. Idempotent.
// Creates the account and pre-stages:
//   - three single Milan activities (no trip assignment) for Aufgabe 7
//   - one completed Italy trip with three Rome memories for Aufgabe 8
// Run with: node scripts/seed-usability-test-account.js
// Requires `npm run dev` running on http://localhost:5173.

import { readFileSync } from "node:fs";
import { MongoClient, ObjectId } from "mongodb";

const oidFromHex = (hex) => new ObjectId(hex);

const BASE_URL = "http://localhost:5173";
const USER = { username: "demo_traveler", password: "demo_traveler_pw" };

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

function wikimedia(fileName, width = 1200) {
	return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=${width}`;
}

const imageByLocation = {
	"ristorante cracco": {
		imageUrl: wikimedia("Milano Galleria Vittorio Emanuele II.jpg"),
		imageAlt: "Galleria Vittorio Emanuele II in Milan",
		imageCredit: "Jakub Hałun / Wikimedia Commons",
		imageLicense: "CC BY-SA 4.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Milano_Galleria_Vittorio_Emanuele_II.jpg"
	},
	"san siro stadium": {
		imageUrl: wikimedia("Stadio Giuseppe Meazza interno.jpg"),
		imageAlt: "Interior of San Siro stadium in Milan",
		imageCredit: "Mvtm / Wikimedia Commons",
		imageLicense: "CC BY-SA 4.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Stadio_Giuseppe_Meazza_interno.jpg"
	},
	"lake como": {
		imageUrl: wikimedia("Lake Como from Bellagio.jpg"),
		imageAlt: "Lake Como seen from Bellagio",
		imageCredit: "Stefano Cannas / Wikimedia Commons",
		imageLicense: "CC BY-SA 4.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Lake_Como_from_Bellagio.jpg"
	},
	"trevi fountain": {
		imageUrl: wikimedia("Trevi Fountain, Rome, Italy 2 - May 2007.jpg"),
		imageAlt: "Trevi Fountain in Rome",
		imageCredit: "Diliff / Wikimedia Commons",
		imageLicense: "CC BY-SA 3.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Trevi_Fountain,_Rome,_Italy_2_-_May_2007.jpg"
	},
	"st peter's basilica": {
		imageUrl: wikimedia("Basilica di San Pietro a Roma - panoramio.jpg"),
		imageAlt: "St. Peter's Basilica in Vatican City",
		imageCredit: "trolvag / Wikimedia Commons",
		imageLicense: "CC BY-SA 3.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Basilica_di_San_Pietro_a_Roma_-_panoramio.jpg"
	},
	"spanish steps": {
		imageUrl: wikimedia("Spanish Steps in 2022.05.jpg"),
		imageAlt: "Spanish Steps in Rome",
		imageCredit: "Livioandronico2013 / Wikimedia Commons",
		imageLicense: "CC BY-SA 4.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Spanish_Steps_in_2022.05.jpg"
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

function makeClient() {
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
			if (value !== undefined && value !== null) fd.set(key, String(value));
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
		action,
		async login() {
			const result = await action("/login", "login", { username: USER.username, password: USER.password });
			if (result.type !== "redirect") throw new Error(`login unexpected: ${JSON.stringify(result)}`);
		},
		async signup() {
			const result = await action("/login", "signup", { username: USER.username, password: USER.password });
			if (result.type !== "redirect") throw new Error(`signup unexpected: ${JSON.stringify(result)}`);
		}
	};
}

async function ensureUser(client) {
	try {
		await client.signup();
		return "created";
	} catch (error) {
		if (/already taken/i.test(error.message)) {
			await client.login();
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
		country: "Italy",
		...fields
	});
	const match = result.type === "redirect" ? result.location?.match(/^\/events\/([0-9a-f]+)$/) : null;
	if (!match) throw new Error(`createEvent unexpected: ${JSON.stringify(result)}`);
	return match[1];
}

async function createTrip(client, fields) {
	const result = await client.action("/trips", "create", fields);
	const match = result.type === "redirect" ? result.location?.match(/^\/trips\/([0-9a-f]+)$/) : null;
	if (!match) throw new Error(`createTrip unexpected: ${JSON.stringify(result)}`);
	return match[1];
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
	console.log(`TripTales usability-test account setup against ${BASE_URL}`);

	const client = makeClient();

	console.log("\n[1/5] Signup / login demo_traveler");
	const state = await step("ensure demo_traveler", () => ensureUser(client));
	console.log(`  demo_traveler: ${state}`);

	const uri = process.env.MONGODB_URI;
	if (!uri) throw new Error("MONGODB_URI missing in .env");
	const mongo = new MongoClient(uri);
	await mongo.connect();
	const db = mongo.db(process.env.MONGODB_DB || "triptales");
	const user = await db.collection("users").findOne({ username: USER.username });
	if (!user) throw new Error("demo_traveler not found in MongoDB after signup");

	console.log("\n[2/5] Reset prior content (idempotency)");
	await step("delete prior events", async () => {
		const events = await db.collection("events").find({ userId: user._id }).toArray();
		const ids = events.map((e) => e._id);
		await db.collection("events").deleteMany({ userId: user._id });
		await db.collection("journeyEntries").deleteMany({ userId: user._id, eventId: { $in: ids } });
		await db.collection("trips").deleteMany({ userId: user._id });
		await db.collection("locations").deleteMany({ userId: user._id });
	});

	console.log("\n[3/5] Create Milan activities (Aufgabe 7 prerequisites)");
	await step("Cena da Cracco", () =>
		createEvent(client, {
			title: "Cena da Cracco",
			category: "Food",
			date: "2026-05-23",
			time: "19:30",
			locationName: "Ristorante Cracco",
			address: "Via Victor Hugo 4",
			city: "Milan",
			lat: "45.4655",
			lng: "9.1903",
			description: "Reservation für vier Personen am Galleria-Eingang."
		})
	);
	await step("San Siro Stadium Tour", () =>
		createEvent(client, {
			title: "San Siro Stadium Tour",
			category: "Culture",
			date: "2026-05-24",
			time: "11:00",
			locationName: "San Siro Stadium",
			address: "Piazzale Angelo Moratti",
			city: "Milan",
			lat: "45.4781",
			lng: "9.1240",
			description: "Geführte Tour durch die Spielerkabinen und Tribünen."
		})
	);
	await step("Day trip to Lake Como", () =>
		createEvent(client, {
			title: "Day trip to Lake Como",
			category: "Outdoor",
			date: "2026-05-25",
			time: "09:00",
			locationName: "Lake Como",
			address: "Como Lago",
			city: "Como",
			lat: "45.9985",
			lng: "9.2615",
			description: "Zug nach Como, dann mit dem Schiff nach Bellagio."
		})
	);

	console.log("\n[4/5] Create Italy trip + completed Rome events with memories (Aufgabe 8 prerequisites)");
	const tripId = await step("trip: Italien Frühling 2026", () =>
		createTrip(client, {
			name: "Italien Frühling 2026",
			dateFrom: "2026-03-15",
			dateTo: "2026-03-22",
			description: "Eine Woche Rom mit Mama und Papa."
		})
	);
	const treviId = await step("event: Eis am Trevi", () =>
		createEvent(client, {
			title: "Eis am Trevi",
			category: "Food",
			date: "2026-03-16",
			time: "17:00",
			locationName: "Trevi Fountain",
			address: "Piazza di Trevi",
			city: "Rome",
			lat: "41.9009",
			lng: "12.4833",
			description: "Pistazien-Eis von Giolitti, dann Münzen werfen."
		})
	);
	const vaticanId = await step("event: Vatikan-Besuch", () =>
		createEvent(client, {
			title: "Vatikan-Besuch",
			category: "Culture",
			date: "2026-03-17",
			time: "09:30",
			locationName: "St Peter's Basilica",
			address: "Piazza San Pietro",
			city: "Rome",
			lat: "41.9022",
			lng: "12.4533",
			description: "Petersdom, Vatikanische Museen und Sixtinische Kapelle."
		})
	);
	const stepsId = await step("event: Sonnenuntergang auf der Spanischen Treppe", () =>
		createEvent(client, {
			title: "Sonnenuntergang auf der Spanischen Treppe",
			category: "Sightseeing",
			date: "2026-03-18",
			time: "19:00",
			locationName: "Spanish Steps",
			address: "Piazza di Spagna",
			city: "Rome",
			lat: "41.9059",
			lng: "12.4823",
			description: "Aperol Spritz und Goldlicht über den Dächern."
		})
	);
	await step("attach Trevi to trip", () => client.action(`/trips/${tripId}`, "addEvent", { eventId: treviId }));
	await step("attach Vatican to trip", () => client.action(`/trips/${tripId}`, "addEvent", { eventId: vaticanId }));
	await step("attach Spanish Steps to trip", () => client.action(`/trips/${tripId}`, "addEvent", { eventId: stepsId }));

	console.log("\n[5/5] MongoDB: complete events, attach memories, attach Wikimedia images");
	const now = new Date();

	const romeUpdates = [
		{
			eventIdStr: treviId,
			locationKey: "trevi fountain",
			memoryText: "Pistazien-Eis war goldrichtig, Touristen-Massen waren tragbar am späten Nachmittag."
		},
		{
			eventIdStr: vaticanId,
			locationKey: "st peter's basilica",
			memoryText: "Sixtinische Kapelle hat uns sprachlos gemacht. Audio-Guide unbedingt nehmen."
		},
		{
			eventIdStr: stepsId,
			locationKey: "spanish steps",
			memoryText: "Aperol Spritz und Goldlicht — Rom in seiner schönsten Form."
		}
	];
	for (const upd of romeUpdates) {
		await step(`  complete + memory: ${upd.locationKey}`, async () => {
			const eventDoc = await db.collection("events").findOne({ userId: user._id, _id: oidFromHex(upd.eventIdStr) });
			if (!eventDoc) throw new Error(`event not found: ${upd.eventIdStr}`);
			const meta = imageByLocation[upd.locationKey];
			await db.collection("events").updateOne(
				{ _id: eventDoc._id },
				{ $set: { status: "completed", updatedAt: now } }
			);
			await db.collection("locations").updateOne(
				{ _id: eventDoc.locationId },
				{ $set: { ...meta, updatedAt: now } }
			);
			await db.collection("journeyEntries").findOneAndUpdate(
				{ userId: user._id, eventId: eventDoc._id },
				{
					$set: {
						memoryText: upd.memoryText,
						images: [memoryImage(meta, `${eventDoc.title} memory photo`)],
						updatedAt: now
					},
					$setOnInsert: { userId: user._id, eventId: eventDoc._id, createdAt: now }
				},
				{ upsert: true }
			);
		});
	}

	const milanEventIds = await db.collection("events").find({
		userId: user._id,
		title: { $in: ["Cena da Cracco", "San Siro Stadium Tour", "Day trip to Lake Como"] }
	}).toArray();
	const milanImageKeys = {
		"Cena da Cracco": "ristorante cracco",
		"San Siro Stadium Tour": "san siro stadium",
		"Day trip to Lake Como": "lake como"
	};
	for (const eventDoc of milanEventIds) {
		await step(`  Milan image: ${milanImageKeys[eventDoc.title]}`, async () => {
			const meta = imageByLocation[milanImageKeys[eventDoc.title]];
			await db.collection("locations").updateOne(
				{ _id: eventDoc.locationId },
				{ $set: { ...meta, updatedAt: now } }
			);
		});
	}

	await mongo.close();

	console.log("\n✅ Usability-test account ready.");
	console.log(`\n  Login:`);
	console.log(`    URL:      ${BASE_URL}/login`);
	console.log(`    Username: ${USER.username}`);
	console.log(`    Password: ${USER.password}`);
	console.log("\n  Prepared content:");
	console.log("    Aufgabe 7 (Milan):    3 separate activities, no trip assignment");
	console.log("    Aufgabe 8 (Italy):    1 trip 'Italien Frühling 2026' with 3 completed memories");
}

main().catch((error) => {
	if (error.cause?.code === "ECONNREFUSED") {
		console.error(`\nDev server not reachable at ${BASE_URL}. Start it with \`npm run dev\`.`);
	} else {
		console.error("\n" + (error.stack || error.message));
	}
	process.exit(1);
});
