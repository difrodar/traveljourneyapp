<script>
	import { page } from "$app/state";

	const links = [
		{ href: "/", label: "Dashboard" },
		{ href: "/events", label: "Events" },
		{ href: "/journey", label: "Journey" },
		{ href: "/map", label: "Map" },
		{ href: "/ideas", label: "Ideas" }
	];
</script>

<nav class="nav">
	<a class="brand" href="/">
		<span>TripTales</span>
		<small>San Diego semester planner</small>
	</a>
	<div class="links">
		{#each links as link}
			<a class:active={page.url.pathname === link.href || (link.href !== "/" && page.url.pathname.startsWith(link.href))} href={link.href}>
				{link.label}
			</a>
		{/each}
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
		background: rgba(255, 250, 242, 0.9);
		backdrop-filter: blur(16px);
		border-bottom: 1px solid var(--line);
	}

	.brand {
		display: grid;
		gap: 1px;
		font-weight: 900;
		color: #102a2d;
	}

	.brand small {
		font-size: 0.72rem;
		color: var(--muted);
		font-weight: 700;
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 7px;
	}

	.links a {
		border-radius: 999px;
		padding: 8px 12px;
		color: var(--muted);
		font-weight: 800;
	}

	.links a.active,
	.links a:hover {
		background: #0f766e;
		color: white;
	}

	@media (max-width: 760px) {
		.nav {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>
