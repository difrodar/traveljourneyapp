import { redirect } from "@sveltejs/kit";
import { ensureAuthSetup, getSessionCookie, getUserFromSession } from "$lib/server/auth.js";

export async function handle({ event, resolve }) {
	await ensureAuthSetup();

	const token = getSessionCookie(event.cookies);
	event.locals.user = await getUserFromSession(token);

	const pathname = event.url.pathname;
	const isPublic = pathname === "/login" || pathname.startsWith("/share/");

	if (!event.locals.user && !isPublic) {
		throw redirect(303, `/login?redirectTo=${encodeURIComponent(pathname + event.url.search)}`);
	}

	if (event.locals.user && pathname === "/login") {
		throw redirect(303, event.url.searchParams.get("redirectTo") || "/");
	}

	const theme = event.locals.user?.themePreference === "dark" ? "dark" : "light";
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('data-theme="light"', `data-theme="${theme}"`)
	});
}
