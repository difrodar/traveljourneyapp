<script>
	import { page } from "$app/state";
	import Avatar from "$lib/components/Avatar.svelte";
	import NotificationBell from "$lib/components/NotificationBell.svelte";
	import ThemeToggle from "$lib/components/ThemeToggle.svelte";

	let { user, notifications } = $props();

	const links = [
		{ href: "/", label: "Dashboard" },
		{ href: "/ideas", label: "Ideas" },
		{ href: "/events", label: "Events" },
		{ href: "/trips", label: "Trips" },
		{ href: "/journey", label: "Journey" },
		{ href: "/map", label: "Map" }
	];
</script>

<nav class="nav">
	<a class="brand" href="/">
		<span><b>Trip</b>Tales</span>
		<small>travel planner & world memory map</small>
	</a>
	<div class="links">
		{#each links as link}
			<a class:active={page.url.pathname === link.href || (link.href !== "/" && page.url.pathname.startsWith(link.href))} href={link.href}>
				{link.label}
			</a>
		{/each}
		{#if user}
			{#if notifications}
				<NotificationBell {notifications} />
			{/if}
			<ThemeToggle current={user.themePreference} />
			<a class="profile-link" class:active={page.url.pathname === "/profile"} href="/profile" aria-label="Open profile, signed in as {user.username}" title={user.username}>
				<Avatar username={user.username} avatarUrl={user.avatarUrl} size={36} ariaHidden={true} />
			</a>
			<form method="POST" action="/logout">
				<button class="logout-button" type="submit">Logout</button>
			</form>
		{/if}
	</div>
</nav>

<style>
	.nav {
		position: sticky;
		top: 0;
		z-index: 20;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 18px;
		padding: 13px max(16px, calc((100vw - 1180px) / 2));
		background: color-mix(in srgb, var(--paper) 92%, transparent);
		backdrop-filter: blur(16px);
		border-bottom: 1px solid var(--line);
		box-shadow: var(--shadow-soft);
	}

	.brand {
		display: grid;
		gap: 1px;
		font-weight: 900;
		color: var(--ink-strong);
	}

	.brand b {
		color: var(--coral);
	}

	.brand small {
		font-size: 0.72rem;
		color: var(--muted);
		font-weight: 700;
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 7px;
	}

	.links a,
	.logout-button {
		border-radius: 999px;
		padding: 8px 13px;
		color: var(--muted);
		font-weight: 800;
		border: 1px solid transparent;
	}

	.links form {
		margin: 0;
	}

	.logout-button {
		background: var(--surface-raised);
		border-color: var(--line);
	}

	.profile-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		border-radius: 50%;
		border: 2px solid transparent;
		line-height: 0;
	}

	.profile-link:hover,
	.profile-link.active,
	.profile-link:focus-visible {
		border-color: var(--coral);
		box-shadow: 0 6px 16px rgba(231, 95, 67, 0.22);
		outline: none;
	}

	.links a.active,
	.links a:hover,
	.logout-button:hover {
		background: linear-gradient(135deg, var(--coral), var(--accent));
		color: white;
		box-shadow: 0 8px 20px rgba(231, 95, 67, 0.22);
	}

	.links a.profile-link.active,
	.links a.profile-link:hover {
		background: transparent;
		color: inherit;
	}

	@media (max-width: 760px) {
		.nav {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>
