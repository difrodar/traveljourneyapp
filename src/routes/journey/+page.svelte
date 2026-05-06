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
		<label class="filter-field">
			<span>From</span>
			<input type="date" name="from" value={data.filters.from} />
		</label>
		<label class="filter-field">
			<span>To</span>
			<input type="date" name="to" value={data.filters.to} />
		</label>
		<select name="sort">
			<option value="dateDesc" selected={data.filters.sort === "dateDesc" || data.filters.sort === "desc"}>Newest memories first</option>
			<option value="dateAsc" selected={data.filters.sort === "dateAsc" || data.filters.sort === "asc"}>Oldest first</option>
			<option value="ratingDesc" selected={data.filters.sort === "ratingDesc"}>Highest rated</option>
			<option value="ratingAsc" selected={data.filters.sort === "ratingAsc"}>Lowest rated</option>
		</select>
		<div class="filter-actions">
			<button class="button" type="submit">Filter</button>
			{#if data.hasActiveFilters}
				<a class="ghost-button" href="/journey">Clear filters</a>
			{/if}
		</div>
	</form>

	<section class="timeline world-trail">
		{#each data.entries as event}
			<JourneyCard {event} />
		{:else}
			<div class="empty-state">No journey memories yet. Mark an event as completed and add a memory to start your timeline.</div>
		{/each}
	</section>
</main>

<style>
	.filters {
		display: grid;
		grid-template-columns: repeat(4, minmax(130px, 1fr)) auto;
		gap: 10px;
		margin-bottom: 20px;
		align-items: end;
	}

	.filter-field {
		display: grid;
		gap: 4px;
	}

	.filter-field span {
		color: var(--muted);
		font-size: 0.78rem;
		font-weight: 800;
		text-transform: uppercase;
	}

	.filter-actions {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
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
			grid-template-columns: 1fr;
		}
	}
</style>
