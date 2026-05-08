<script>
	import LeafletMapView from "$lib/components/LeafletMapView.svelte";

	let { data } = $props();
	let filterForm;
	const clearHref = $derived(data.highlightedEventId ? `/map?event=${data.highlightedEventId}` : "/map");

	function submitFilters() {
		filterForm?.requestSubmit();
	}
</script>

<main class="page-shell">
	<header class="page-header">
		<div>
			<p class="eyebrow">Map</p>
			<h1>World map of your plans</h1>
			<p class="lead">Browse the journey on an OpenStreetMap view by country, city and concrete place.</p>
		</div>
	</header>

	{#if data.setupError}
		<div class="message error">{data.setupError}</div>
	{/if}

	<form class="panel map-filters" method="GET" bind:this={filterForm}>
		{#if data.highlightedEventId}
			<input type="hidden" name="event" value={data.highlightedEventId} />
		{/if}
		<select name="status" aria-label="Filter map by status" onchange={submitFilters}>
			<option value="all" selected={data.filters.status === "all"}>All status</option>
			<option value="planned" selected={data.filters.status === "planned"}>Planned</option>
			<option value="completed" selected={data.filters.status === "completed"}>Completed</option>
			<option value="invited" selected={data.filters.status === "invited"}>Invited to me</option>
		</select>
		<select name="category" aria-label="Filter map by category" onchange={submitFilters}>
			<option value="all" selected={data.filters.category === "all"}>All categories</option>
			{#each data.categories as category}
				<option value={category} selected={data.filters.category === category}>{category}</option>
			{/each}
		</select>
		<label class="filter-field">
			<span>From</span>
			<input type="date" name="from" value={data.filters.from} onchange={submitFilters} />
		</label>
		<label class="filter-field">
			<span>To</span>
			<input type="date" name="to" value={data.filters.to} onchange={submitFilters} />
		</label>
		{#if data.hasActiveFilters}
			<a class="ghost-button" href={clearHref}>Clear filters</a>
		{/if}
	</form>

	<div class="map-summary">
		<strong>{data.eventCount} mapped event{data.eventCount === 1 ? "" : "s"}</strong>
		<span>{data.locations.length} concrete place{data.locations.length === 1 ? "" : "s"}</span>
		{#if data.hasActiveFilters}
			<span>Filtered map view</span>
		{/if}
	</div>

	{#if data.locations.length === 0 && !data.hasActiveFilters}
		<div class="empty-state">No mapped places yet. Create an event with a city to see the first pin appear here.</div>
	{:else if data.locations.length === 0 && data.hasActiveFilters}
		<div class="empty-state">No places match these filters. Clear the filters to see all your mapped events.</div>
	{/if}

	{#key data.filterKey}
		<LeafletMapView locations={data.locations} highlightedEventId={data.highlightedEventId} />
	{/key}
</main>

<style>
	.map-filters {
		display: grid;
		grid-template-columns: repeat(2, minmax(150px, 1fr)) repeat(2, minmax(140px, 0.8fr)) auto;
		gap: 10px;
		align-items: end;
		margin-bottom: 14px;
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

	.map-summary {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
		margin-bottom: 16px;
		color: var(--muted);
	}

	.map-summary strong,
	.map-summary span {
		border: 1px solid var(--line);
		border-radius: 999px;
		padding: 6px 10px;
		background: rgba(255, 247, 236, 0.8);
		font-size: 0.86rem;
	}

	.map-summary strong {
		color: var(--brand-dark);
	}

	@media (max-width: 900px) {
		.map-filters {
			grid-template-columns: 1fr;
		}
	}
</style>
