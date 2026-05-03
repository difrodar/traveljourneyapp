<script>
	let { stats } = $props();

	const items = $derived([
		{ label: "Events", value: stats.events },
		{ label: "Places", value: stats.locations },
		{ label: "Avg. rating", value: stats.averageRating || "n/a" },
		{ label: "Ideas", value: stats.ideas }
	]);
</script>

<section class="stats">
	{#each items as item}
		<div class="card">
			<strong>{item.value}</strong>
			<span>{item.label}</span>
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
		display: grid;
		gap: 5px;
	}

	strong {
		font-size: 2rem;
		color: var(--brand);
		line-height: 1;
	}

	span {
		color: var(--muted);
		font-weight: 800;
	}

	@media (max-width: 820px) {
		.stats {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
