<script>
	import EventCard from "$lib/components/EventCard.svelte";
	import { rememberFilters, clearRememberedFilters } from "$lib/utils/filter-persistence.svelte.js";
	import { SEARCH_DEBOUNCE_MS } from "$lib/constants.js";

	let { data } = $props();
	let filterForm = $state();
	let searchTimer = 0;

	rememberFilters("events");

	$effect(() => () => clearTimeout(searchTimer));

	function submitFilters() {
		filterForm?.requestSubmit();
	}

	function submitSearch() {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(submitFilters, SEARCH_DEBOUNCE_MS);
	}

	function handleClearFilters() {
		clearRememberedFilters("events");
	}
</script>

<main class="page-shell">
	<header class="page-header">
		<div>
			<p class="eyebrow">Events</p>
			<h1>Plans and past adventures</h1>
			<p class="lead">Filter by status, category or search term. Events can happen in San Diego or anywhere your journey goes.</p>
		</div>
		<a class="button" href="/events/new">+ Create event</a>
	</header>

	{#if data.setupError}
		<div class="message error">{data.setupError}</div>
	{/if}

	<form class="panel filters" method="GET" bind:this={filterForm}>
		<div class="filters-title">
			<h2>Find an event</h2>
			<p>Search or filter the events below — to add something new, use “+ Create event” above.</p>
		</div>
		<label class="filter-field filter-field--search">
			<span>Search</span>
			<input name="search" placeholder="Search event title" value={data.filters.search} oninput={submitSearch} />
		</label>
		<label class="filter-field">
			<span>Status</span>
			<select name="status" onchange={submitFilters}>
				<option value="all" selected={data.filters.status === "all"}>All status</option>
				<option value="planned" selected={data.filters.status === "planned"}>Planned</option>
				<option value="completed" selected={data.filters.status === "completed"}>Completed</option>
				<option value="invited" selected={data.filters.status === "invited"}>Invited to me</option>
			</select>
		</label>
		<label class="filter-field">
			<span>Category</span>
			<select name="category" onchange={submitFilters}>
				<option value="all" selected={data.filters.category === "all"}>All categories</option>
				{#each data.categories as category}
					<option value={category} selected={data.filters.category === category}>{category}</option>
				{/each}
			</select>
		</label>
		<label class="filter-field">
			<span>From</span>
			<input type="date" name="from" value={data.filters.from} onchange={submitFilters} />
		</label>
		<label class="filter-field">
			<span>To</span>
			<input type="date" name="to" value={data.filters.to} onchange={submitFilters} />
		</label>
		<label class="filter-field">
			<span>Sort</span>
			<select name="sort" onchange={submitFilters}>
				<option value="dateAsc" selected={data.filters.sort === "dateAsc" || data.filters.sort === "asc"}>Soonest first</option>
				<option value="dateDesc" selected={data.filters.sort === "dateDesc" || data.filters.sort === "desc"}>Latest date first</option>
				<option value="updatedDesc" selected={data.filters.sort === "updatedDesc"}>Recently edited</option>
			</select>
		</label>
		{#if data.hasActiveFilters}
			<div class="filter-actions">
				<a class="ghost-button" href="/events" onclick={handleClearFilters}>Clear filters</a>
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
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		margin-bottom: 20px;
		align-items: end;
	}

	.filters > * {
		flex: 1 1 160px;
		min-width: 160px;
	}

	.filters > .filter-field--search {
		flex: 2 1 240px;
		min-width: 240px;
	}

	.filters-title {
		flex: 1 1 100%;
		min-width: 0;
		display: grid;
		gap: 2px;
	}

	.filters-title h2 {
		margin: 0;
		font-size: 1.05rem;
	}

	.filters-title p {
		margin: 0;
		color: var(--muted);
		font-size: 0.85rem;
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
		flex: 0 0 auto;
		min-width: 0;
	}

	@media (max-width: 600px) {
		.filters > * {
			flex-basis: 100%;
			min-width: 0;
		}
	}
</style>
