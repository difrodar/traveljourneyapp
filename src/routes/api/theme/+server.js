import { error, json } from "@sveltejs/kit";
import { setThemePreference } from "$lib/server/auth.js";

export async function POST({ request, locals }) {
	if (!locals.user) throw error(401, "Sign in to change theme.");
	let payload;
	try {
		payload = await request.json();
	} catch {
		throw error(400, "Invalid JSON body.");
	}
	if (payload?.theme !== "light" && payload?.theme !== "dark") {
		throw error(400, "theme must be 'light' or 'dark'.");
	}
	const saved = await setThemePreference(locals.user.id, payload.theme);
	return json({ theme: saved });
}
