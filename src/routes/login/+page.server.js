import { fail, redirect } from "@sveltejs/kit";
import { createSession, login, setSessionCookie, signup } from "$lib/server/auth.js";

function redirectPath(url) {
	const value = url.searchParams.get("redirectTo") || "/";
	return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

async function signIn(cookies, user, url) {
	const token = await createSession(user.id);
	setSessionCookie(cookies, token);
	throw redirect(303, redirectPath(url));
}

export const actions = {
	login: async ({ cookies, request, url }) => {
		const form = await request.formData();
		const result = await login(form.get("username"), form.get("password"));
		if (result.error) return fail(400, { loginError: result.error, username: form.get("username") });
		await signIn(cookies, result.user, url);
	},
	signup: async ({ cookies, request, url }) => {
		const form = await request.formData();
		const result = await signup(form.get("username"), form.get("password"));
		if (result.error) return fail(400, { signupError: result.error, signupUsername: form.get("username") });
		await signIn(cookies, result.user, url);
	}
};
