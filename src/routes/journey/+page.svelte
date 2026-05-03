<script>
	import JourneyCard from "$lib/components/JourneyCard.svelte";

	let { data } = $props();
</script>

<main class="page-shell">
	<header class="page-header">
		<div>
			<p class="eyebrow">Journey</p>
			<h1>Your world timeline</h1>
			<p class="lead">Completed events become memories with rating, location and personal notes, from San Diego to every next stop.</p>
		</div>
	</header>

	{#if data.setupError}
		<div class="message error">{data.setupError}</div>
	{/if}

	<form class="panel filters" method="GET">
		<select name="category">
			<option value="all" selected={data.filters.category === "all"}>All categories</option>
			{#each data.categories as category}
				<option value={category} selected={data.filters.category === category}>{category}</option>
			{/each}
		</select>
		<select name="minRating">
			<option value="0" selected={data.filters.minRating === "0"}>Any rating</option>
			<option value="3" selected={data.filters.minRating === "3"}>3+ stars</option>
			<option value="4" selected={data.filters.minRating === "4"}>4+ stars</option>
			<option value="5" selected={data.filters.minRating === "5"}>5 stars</option>
		</select>
		<button class="button" type="submit">Filter</button>
	</form>

	<section class="timeline world-trail">
		{#each data.entries as event}
			<JourneyCard {event} />
		{:else}
			<div class="empty-state">No journey memories match the filter yet.</div>
		{/each}
	</section>
</main>

<style>
	.filters {
		display: flex;
		gap: 10px;
		margin-bottom: 20px;
	}

	.timeline {
		display: grid;
		gap: 16px;
		position: relative;
	}

	.world-trail::before {
		content: "";
		position: absolute;
		top: 8px;
		bottom: 8px;
		left: 22px;
		width: 2px;
		background: linear-gradient(180deg, var(--coral), var(--sky), var(--brand));
		opacity: 0.36;
	}

	.world-trail :global(.journey-card) {
		margin-left: 24px;
	}

	@media (max-width: 720px) {
		.filters {
			display: grid;
		}
	}
</style>
