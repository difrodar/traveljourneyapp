<script>
	import { dev } from "$app/environment";
	import { categoryMedia } from "$lib/media.js";

	let { form } = $props();
	const heroMedia = categoryMedia["weekend trip"];
</script>

<main class="login-shell">
	<section class="login-hero">
		<div class="welcome">
			<p class="eyebrow">TripTales</p>
			<h1>Your travel plans, memories and map in one private account.</h1>
			<p class="lead">
				Sign in to continue to your dashboard, events, journey timeline, travel ideas and map.
			</p>
			{#if dev}
				<div class="demo-logins">
					<span>difrodar / difrodar</span>
					<span>dummy / dummy</span>
				</div>
			{/if}
		</div>

		<div class="visual">
			{#if heroMedia?.imageUrl}
				<img src={heroMedia.imageUrl} alt={heroMedia.imageAlt || "TripTales travel scene"} />
			{/if}
			<div>
				<p class="eyebrow">Welcome back</p>
				<h2>Start with an account, then build the journey.</h2>
			</div>
		</div>
	</section>

	<section class="auth-grid" aria-label="Account access">
		<form class="panel auth-form" method="POST" action="?/login">
			<div>
				<p class="eyebrow">Login</p>
				<h2>Open your account</h2>
			</div>
			{#if form?.loginError}
				<div class="message error">{form.loginError}</div>
			{/if}
			<label class="field">
				<span>Username</span>
				<input name="username" value={form?.username || ""} autocomplete="username" required />
			</label>
			<label class="field">
				<span>Password</span>
				<input name="password" type="password" autocomplete="current-password" required />
			</label>
			<button class="button" type="submit">Login</button>
		</form>

		<form class="panel auth-form" method="POST" action="?/signup">
			<div>
				<p class="eyebrow">Signup</p>
				<h2>Create a new account</h2>
			</div>
			{#if form?.signupError}
				<div class="message error">{form.signupError}</div>
			{/if}
			<label class="field">
				<span>Username</span>
				<input name="username" value={form?.signupUsername || ""} autocomplete="username" required />
			</label>
			<label class="field">
				<span>Password</span>
				<input name="password" type="password" autocomplete="new-password" minlength="8" required />
				<small class="muted">At least 8 characters.</small>
			</label>
			<button class="ghost-button" type="submit">Create account</button>
		</form>
	</section>
</main>

<style>
	.login-shell {
		width: min(1080px, calc(100% - 32px));
		margin: 0 auto;
		padding: 38px 0 56px;
	}

	.login-hero {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(320px, 0.82fr);
		gap: 22px;
		align-items: stretch;
		margin-bottom: 22px;
	}

	.welcome {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 22px 0;
	}

	.demo-logins {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 8px;
	}

	.demo-logins span {
		border: 1px solid var(--line);
		border-radius: 999px;
		background: #fff7ec;
		color: var(--muted);
		padding: 7px 11px;
		font-weight: 800;
	}

	.visual {
		min-height: 330px;
		border-radius: 8px;
		overflow: hidden;
		position: relative;
		display: flex;
		align-items: flex-end;
		padding: 24px;
		color: white;
		box-shadow: var(--shadow);
		background: linear-gradient(135deg, var(--coral), var(--accent), var(--brand));
	}

	.visual img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.visual::before {
		content: "";
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(56, 34, 22, 0.08), rgba(56, 34, 22, 0.7));
		z-index: 1;
	}

	.visual > div {
		position: relative;
		z-index: 2;
	}

	.visual h2 {
		color: white;
		font-size: 2rem;
		margin: 0;
	}

	.auth-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 18px;
	}

	.auth-form {
		display: grid;
		gap: 14px;
	}

	.auth-form .button,
	.auth-form .ghost-button {
		width: 100%;
	}

	@media (max-width: 820px) {
		.login-shell {
			width: min(100% - 22px, 1080px);
			padding-top: 22px;
		}

		.login-hero,
		.auth-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
