<script>
	import { page } from "$app/state";

	let { user } = $props();

	const links = [
		{ href: "/", label: "Dashboard" },
		{ href: "/events", label: "Events" },
		{ href: "/trips", label: "Trips" },
		{ href: "/journey", label: "Journey" },
		{ href: "/map", label: "Map" },
		{ href: "/ideas", label: "Ideas" }
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
			<a class="user-pill" class:active={page.url.pathname === "/profile"} href="/profile">{user.username}</a>
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
		background: rgba(255, 247, 236, 0.92);
		backdrop-filter: blur(16px);
		border-bottom: 1px solid #edcfaa;
		box-shadow: 0 8px 24px rgba(126, 75, 38, 0.08);
	}

	.brand {
		display: grid;
		gap: 1px;
		font-weight: 900;
		color: #43291a;
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
	.logout-button,
	.user-pill {
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
		background: #fff7ec;
		border-color: var(--line);
	}

	.user-pill {
		background: #edf8e9;
		border-color: #b8dfad;
		color: #2f6f35;
	}

	.links a.active,
	.links a:hover,
	.logout-button:hover {
		background: linear-gradient(135deg, var(--coral), var(--accent));
		color: white;
		box-shadow: 0 8px 20px rgba(231, 95, 67, 0.22);
	}

	@media (max-width: 760px) {
		.nav {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>
