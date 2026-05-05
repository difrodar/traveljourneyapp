import { redirect } from "@sveltejs/kit";
import { clearSessionCookie, deleteSession, getSessionCookie } from "$lib/server/auth.js";

export async function POST({ cookies }) {
	await deleteSession(getSessionCookie(cookies));
	clearSessionCookie(cookies);
	throw redirect(303, "/login");
}
