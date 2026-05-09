<script>
	import JourneyCard from "$lib/components/JourneyCard.svelte";
	import { rememberFilters, clearRememberedFilters } from "$lib/utils/filter-persistence.svelte.js";

	let { data } = $props();
	let filterForm;
	let searchTimer;

	rememberFilters("journey");

	function submitFilters() {
		filterForm?.requestSubmit();
	}

	function submitSearch() {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(submitFilters, 350);
	}

	function handleClearFilters() {
		clearRememberedFilters("journey");
	}
</script>

<main class="page-shell">
	<header class="page-header">
		<div>
			<p class="eyebrow">Journey</p>
			<h1>Your world timeline</h1>
			<p class="lead">Completed events become memories with locations, photos and personal notes, from San Diego to every next stop.</p>
		</div>
	</header>

	{#if data.setupError}
		<div class="message error">{data.setupError}</div>
	{/if}

	<form class="panel filters" method="GET" bind:this={filterForm}>
		<label class="filter-field filter-field--search">
			<span>Search</span>
			<input
				name="search"
				placeholder="Search memories, places or categories"
				value={data.filters.search}
				oninput={submitSearch}
			/>
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
				<option value="dateDesc" selected={data.filters.sort === "dateDesc" || data.filters.sort === "desc"}>Newest memories first</option>
				<option value="dateAsc" selected={data.filters.sort === "dateAsc" || data.filters.sort === "asc"}>Oldest first</option>
			</select>
		</label>
		{#if data.hasActiveFilters}
			<div class="filter-actions">
				<a class="ghost-button" href="/journey" onclick={handleClearFilters}>Clear filters</a>
			</div>
		{/if}
	</form>

	<section class="diary-stats" aria-label="Journey statistics">
		<div>
			<span>Total memories</span>
			<strong>{data.stats.totalMemories}</strong>
		</div>
		<div>
			<span>Favorite category</span>
			<strong>{data.stats.favoriteCategory}</strong>
		</div>
		<div>
			<span>Most visited city</span>
			<strong>{data.stats.mostVisitedCity}</strong>
		</div>
		<div>
			<span>Countries visited</span>
			<strong>{data.stats.countriesVisited}</strong>
		</div>
	</section>

	{#if data.recentHighlights.length}
		<section class="recent-highlights" aria-label="Recent highlights">
			<div class="section-heading">
				<div>
					<p class="eyebrow">Recent Highlights</p>
					<h2>Latest diary stops</h2>
				</div>
			</div>
			<div class="highlight-grid">
				{#each data.recentHighlights as event}
					<a class="card diary-highlight" href="/events/{event.id}">
						<span class="category">{event.category}</span>
						<strong>{event.title}</strong>
						<span>{event.location?.city || event.location?.name}, {event.location?.country || "World"}</span>
						<small>{event.date || "No date yet"}</small>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	<section class="timeline world-trail">
		{#each data.groups as group}
			<section class="month-group">
				<div class="month-heading">
					<p>{group.label}</p>
					<span>{group.memoryCount} memor{group.memoryCount === 1 ? "y" : "ies"}</span>
				</div>
				<div class="month-entries">
					{#each group.entries as event}
						<JourneyCard {event} />
					{/each}
				</div>
			</section>
		{:else}
			<div class="empty-state">
				{data.hasActiveFilters
					? "No journey memories match these filters. Clear the filters or adjust your search."
					: "No journey memories yet. Mark an event as completed and add a memory to start your timeline."}
			</div>
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

	.diary-stats {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 12px;
		margin-bottom: 22px;
	}

	.diary-stats div {
		border: 1px solid var(--line);
		border-radius: 8px;
		padding: 14px;
		background: rgba(255, 250, 242, 0.82);
		box-shadow: var(--shadow-soft);
	}

	.diary-stats span,
	.diary-highlight span,
	.diary-highlight small,
	.month-heading span {
		color: var(--muted);
		font-size: 0.82rem;
		font-weight: 800;
	}

	.diary-stats strong {
		display: block;
		margin-top: 6px;
		color: var(--brand-dark);
		font-size: 1.4rem;
		line-height: 1.1;
	}

	.recent-highlights {
		display: grid;
		gap: 12px;
		margin-bottom: 24px;
	}

	.section-heading {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 16px;
	}

	.section-heading h2,
	.section-heading p {
		margin: 0;
	}

	.highlight-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 14px;
	}

	.diary-highlight {
		display: grid;
		gap: 8px;
		min-height: 150px;
		align-content: start;
	}

	.diary-highlight strong {
		color: #402a1e;
		font-size: 1.08rem;
	}

	.diary-highlight small {
		color: var(--brand-dark);
	}

	.timeline {
		display: grid;
		gap: 24px;
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

	.month-group {
		display: grid;
		gap: 12px;
	}

	.month-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-left: 24px;
		border-bottom: 1px solid var(--line);
		padding-bottom: 8px;
	}

	.month-heading p {
		margin: 0;
		color: var(--brand-dark);
		font-size: 1.08rem;
		font-weight: 900;
	}

	.month-entries {
		display: grid;
		gap: 16px;
	}

	@media (max-width: 980px) {
		.diary-stats,
		.highlight-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 600px) {
		.filters > * {
			flex-basis: 100%;
			min-width: 0;
		}
	}

	@media (max-width: 720px) {
		.diary-stats,
		.highlight-grid {
			grid-template-columns: 1fr;
		}

		.month-heading {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>
