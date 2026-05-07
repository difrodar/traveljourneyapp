<script>
	import EventCard from "$lib/components/EventCard.svelte";

	let { data } = $props();
	let filterForm;
	let searchTimer;

	function submitFilters() {
		filterForm?.requestSubmit();
	}

	function submitSearch() {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(submitFilters, 350);
	}
</script>

<main class="page-shell">
	<header class="page-header">
		<div>
			<p class="eyebrow">Events</p>
			<h1>Plans and past adventures</h1>
			<p class="lead">Filter by status, category or search term. Events can happen in San Diego or anywhere your journey goes.</p>
		</div>
		<a class="button" href="/events/new">Create event</a>
	</header>

	{#if data.setupError}
		<div class="message error">{data.setupError}</div>
	{/if}

	<form class="panel filters" method="GET" bind:this={filterForm}>
		<input name="search" placeholder="Search event title" value={data.filters.search} oninput={submitSearch} />
		<select name="status" onchange={submitFilters}>
			<option value="all" selected={data.filters.status === "all"}>All status</option>
			<option value="planned" selected={data.filters.status === "planned"}>Planned</option>
			<option value="completed" selected={data.filters.status === "completed"}>Completed</option>
			<option value="invited" selected={data.filters.status === "invited"}>Invited to me</option>
		</select>
		<select name="category" onchange={submitFilters}>
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
		<select name="sort" onchange={submitFilters}>
			<option value="dateAsc" selected={data.filters.sort === "dateAsc" || data.filters.sort === "asc"}>Soonest first</option>
			<option value="dateDesc" selected={data.filters.sort === "dateDesc" || data.filters.sort === "desc"}>Latest date first</option>
			<option value="updatedDesc" selected={data.filters.sort === "updatedDesc"}>Recently edited</option>
		</select>
		{#if data.hasActiveFilters}
			<div class="filter-actions">
				<a class="ghost-button" href="/events">Clear filters</a>
			</div>
		{/if}
	</form>

	<section class="grid three">
		{#each data.events as event}
			<EventCard {event} />
		{:else}
			<div class="empty-state">No events match these filters. Clear the filters or create a new event to continue planning.</div>
		{/each}
	</section>
</main>

<style>
	.filters {
		display: grid;
		grid-template-columns: 1.4fr repeat(5, minmax(130px, 1fr)) auto;
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

	@media (max-width: 900px) {
		.filters {
			grid-template-columns: 1fr;
		}
	}
</style>
