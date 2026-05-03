<script>
	import EventCard from "$lib/components/EventCard.svelte";

	let { data } = $props();
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

	<form class="panel filters" method="GET">
		<input name="search" placeholder="Search event title" value={data.filters.search} />
		<select name="status">
			<option value="all" selected={data.filters.status === "all"}>All status</option>
			<option value="planned" selected={data.filters.status === "planned"}>Planned</option>
			<option value="completed" selected={data.filters.status === "completed"}>Completed</option>
		</select>
		<select name="category">
			<option value="all" selected={data.filters.category === "all"}>All categories</option>
			{#each data.categories as category}
				<option value={category} selected={data.filters.category === category}>{category}</option>
			{/each}
		</select>
		<select name="sort">
			<option value="asc" selected={data.filters.sort === "asc"}>Soonest first</option>
			<option value="desc" selected={data.filters.sort === "desc"}>Newest first</option>
		</select>
		<button class="button" type="submit">Apply</button>
	</form>

	<section class="grid three">
		{#each data.events as event}
			<EventCard {event} />
		{:else}
			<div class="empty-state">No events match the selected filters.</div>
		{/each}
	</section>
</main>

<style>
	.filters {
		display: grid;
		grid-template-columns: 1.4fr repeat(3, minmax(130px, 1fr)) auto;
		gap: 10px;
		margin-bottom: 20px;
	}

	@media (max-width: 900px) {
		.filters {
			grid-template-columns: 1fr;
		}
	}
</style>
