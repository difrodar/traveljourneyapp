import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { dev } from "$app/environment";
import { redirect } from "@sveltejs/kit";
import { ObjectId } from "mongodb";
import { getCollections } from "./db.js";
import { initializeUserData } from "./repository.js";

const scrypt = promisify(scryptCallback);
const sessionCookie = "triptales_session";
const sessionMaxAge = 60 * 60 * 24 * 14;
let setupPromise;

function normalizeUsername(username) {
	return String(username || "").trim().toLowerCase();
}

function publicUser(user) {
	return user ? { id: user._id.toString(), username: user.username, avatarUrl: user.avatarUrl || null } : null;
}

function hashToken(token) {
	return createHash("sha256").update(token).digest("hex");
}

async function hashPassword(password) {
	const salt = randomBytes(16).toString("hex");
	const hash = await scrypt(String(password), salt, 64);
	return `${salt}:${hash.toString("hex")}`;
}

async function verifyPassword(password, storedHash) {
	const [salt, key] = String(storedHash || "").split(":");
	if (!salt || !key) return false;
	const expected = Buffer.from(key, "hex");
	const actual = await scrypt(String(password), salt, expected.length);
	return expected.length === actual.length && timingSafeEqual(expected, actual);
}

async function ensureUser(username, password) {
	const collections = await getCollections();
	const normalizedUsername = normalizeUsername(username);
	let user = await collections.users.findOne({ username: normalizedUsername });
	if (user) return user;
	const now = new Date();
	await collections.users.insertOne({
		username: normalizedUsername,
		passwordHash: await hashPassword(password),
		createdAt: now,
		updatedAt: now
	});
	return collections.users.findOne({ username: normalizedUsername });
}

async function runAuthSetup() {
	const collections = await getCollections();
	await Promise.all([
		collections.users.createIndex({ username: 1 }, { unique: true }),
		collections.sessions.createIndex({ tokenHash: 1 }, { unique: true }),
		collections.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
	]);
	const difrodar = await ensureUser("difrodar", "difrodar");
	await ensureUser("dummy", "dummy");
	await initializeUserData(difrodar._id);
}

export async function ensureAuthSetup() {
	if (!setupPromise) {
		setupPromise = runAuthSetup().catch((error) => {
			setupPromise = null;
			throw error;
		});
	}
	return setupPromise;
}

const AVATAR_MAX_BYTES = 1 * 1024 * 1024;
const AVATAR_ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function updateUserAvatar(userId, file) {
	if (!file || typeof file.arrayBuffer !== "function" || !file.size) {
		throw new Error("Please choose an image to upload.");
	}
	if (!AVATAR_ALLOWED_MIME.has(file.type)) {
		throw new Error("Avatar must be a JPG, PNG or WebP image.");
	}
	if (file.size > AVATAR_MAX_BYTES) {
		throw new Error("Avatar must be 1 MB or smaller.");
	}
	const collections = await getCollections();
	const buffer = Buffer.from(await file.arrayBuffer());
	const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
	await collections.users.updateOne(
		{ _id: ObjectId.isValid(userId) ? new ObjectId(userId) : userId },
		{ $set: { avatarUrl: dataUrl, updatedAt: new Date() } }
	);
	return dataUrl;
}

export async function removeUserAvatar(userId) {
	const collections = await getCollections();
	await collections.users.updateOne(
		{ _id: ObjectId.isValid(userId) ? new ObjectId(userId) : userId },
		{ $unset: { avatarUrl: "" }, $set: { updatedAt: new Date() } }
	);
}

export async function signup(username, password) {
	const collections = await getCollections();
	const normalizedUsername = normalizeUsername(username);
	if (!/^[a-z0-9_-]{3,32}$/.test(normalizedUsername)) {
		return { error: "Username must be 3-32 characters and use letters, numbers, - or _." };
	}
	if (String(password || "").length < 8) {
		return { error: "Password must be at least 8 characters." };
	}
	const now = new Date();
	try {
		await collections.users.insertOne({
			username: normalizedUsername,
			passwordHash: await hashPassword(password),
			createdAt: now,
			updatedAt: now
		});
	} catch (error) {
		if (error?.code === 11000) return { error: "That username is already taken." };
		throw error;
	}
	const user = await collections.users.findOne({ username: normalizedUsername });
	return { user: publicUser(user) };
}

export async function login(username, password) {
	const collections = await getCollections();
	const user = await collections.users.findOne({ username: normalizeUsername(username) });
	if (!user || !(await verifyPassword(password, user.passwordHash))) {
		return { error: "Username or password is incorrect." };
	}
	return { user: publicUser(user) };
}

export async function createSession(userId) {
	const collections = await getCollections();
	const token = randomBytes(32).toString("base64url");
	const now = new Date();
	await collections.sessions.insertOne({
		tokenHash: hashToken(token),
		userId: ObjectId.isValid(userId) ? new ObjectId(userId) : userId,
		createdAt: now,
		expiresAt: new Date(now.getTime() + sessionMaxAge * 1000)
	});
	return token;
}

export async function getUserFromSession(token) {
	if (!token) return null;
	const collections = await getCollections();
	const session = await collections.sessions.findOne({
		tokenHash: hashToken(token),
		expiresAt: { $gt: new Date() }
	});
	if (!session) return null;
	const user = await collections.users.findOne({ _id: session.userId });
	return publicUser(user);
}

export async function deleteSession(token) {
	if (!token) return;
	const collections = await getCollections();
	await collections.sessions.deleteOne({ tokenHash: hashToken(token) });
}

export function setSessionCookie(cookies, token) {
	cookies.set(sessionCookie, token, {
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		secure: !dev,
		maxAge: sessionMaxAge
	});
}

export function clearSessionCookie(cookies) {
	cookies.delete(sessionCookie, { path: "/" });
}

export function getSessionCookie(cookies) {
	return cookies.get(sessionCookie);
}

export function requireUser(locals) {
	if (!locals.user) throw redirect(303, "/login");
	return locals.user;
}
