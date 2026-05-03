<script>
	let { stats } = $props();

	const items = $derived([
		{ label: "Events", value: stats.events, hint: "planned and completed" },
		{ label: "Places", value: stats.locations, hint: "saved locations" },
		{ label: "Avg. rating", value: stats.averageRating || "n/a", hint: "journey memories" },
		{ label: "Ideas", value: stats.ideas, hint: "future adventures" }
	]);
</script>

<section class="stats">
	{#each items as item}
		<div class="card">
			<strong>{item.value}</strong>
			<span>{item.label}</span>
			<small>{item.hint}</small>
		</div>
	{/each}
</section>

<style>
	.stats {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 12px;
	}

	.card {
		position: relative;
		display: grid;
		gap: 5px;
		overflow: hidden;
	}

	.card::after {
		content: "";
		position: absolute;
		inset: auto 14px 12px auto;
		width: 42px;
		height: 6px;
		border-radius: 999px;
		background: #f1bf83;
		opacity: 0.7;
	}

	strong {
		font-size: 2rem;
		color: var(--coral);
		line-height: 1;
	}

	span {
		color: var(--muted);
		font-weight: 800;
	}

	small {
		color: #9a7356;
		font-weight: 700;
	}

	@media (max-width: 820px) {
		.stats {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
