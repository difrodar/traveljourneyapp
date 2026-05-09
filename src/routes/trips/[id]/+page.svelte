<script>
	import LeafletMapView from "$lib/components/LeafletMapView.svelte";

	let { data, form } = $props();
	let editing = $state(false);
</script>

<main class="page-shell">
	<header class="page-header trip-detail-header">
		<div>
			<p class="eyebrow"><a href="/trips">Trips</a></p>
			{#if editing}
				<form class="trip-edit" method="POST" action="?/update">
					<label class="filter-field">
						<span>Name</span>
						<input name="name" required value={data.trip.name} />
					</label>
					<div class="trip-edit-row">
						<label class="filter-field">
							<span>From</span>
							<input type="date" name="dateFrom" value={data.trip.dateFrom || ""} />
						</label>
						<label class="filter-field">
							<span>To</span>
							<input type="date" name="dateTo" value={data.trip.dateTo || ""} />
						</label>
					</div>
					<label class="filter-field">
						<span>Description</span>
						<input name="description" value={data.trip.description || ""} />
					</label>
					<div class="trip-edit-actions">
						<button class="button" type="submit">Save</button>
						<button class="ghost-button" type="button" onclick={() => (editing = false)}>Cancel</button>
					</div>
				</form>
			{:else}
				<h1>{data.trip.name}</h1>
				<p class="lead">
					{#if data.trip.dateFrom || data.trip.dateTo}
						{data.trip.dateFrom || "?"} – {data.trip.dateTo || "?"}
					{:else}
						No date range set yet.
					{/if}
				</p>
				{#if data.trip.description}
					<p>{data.trip.description}</p>
				{/if}
			{/if}
		</div>
		{#if !editing}
			<div class="trip-actions">
				<button class="ghost-button" type="button" onclick={() => (editing = true)}>Edit trip</button>
				<form method="POST" action="?/delete" onsubmit={(e) => { if (!confirm("Delete this trip? Events will keep existing but lose the trip association.")) e.preventDefault(); }}>
					<button class="ghost-button danger" type="submit">Delete trip</button>
				</form>
			</div>
		{/if}
	</header>

	{#if form?.error}
		<div class="message error">{form.error}</div>
	{/if}
	{#if form?.message}
		<div class="message success">{form.message}</div>
	{/if}

	{#if data.stats.eventCount > 0}
		<section class="trip-stats" aria-label="Trip statistics">
			<div>
				<span>Events</span>
				<strong>{data.stats.eventCount}</strong>
			</div>
			<div>
				<span>Memories</span>
				<strong>{data.stats.memoryCount}</strong>
			</div>
			<div>
				<span>Countries</span>
				<strong>{data.stats.countriesVisited}</strong>
			</div>
			<div>
				<span>Top category</span>
				<strong>{data.stats.topCategory}</strong>
			</div>
		</section>
	{/if}

	{#if data.locations.length > 0}
		<section class="trip-map" aria-label="Trip map">
			<LeafletMapView locations={data.locations} />
		</section>
	{/if}

	<section class="trip-events">
		<div class="section-heading">
			<div>
				<p class="eyebrow">Events</p>
				<h2>What's in this trip</h2>
			</div>
		</div>
		<div class="event-list">
			{#each data.events as event}
				<article class="event-row">
					<div class="event-info">
						<a href="/events/{event.id}"><strong>{event.title}</strong></a>
						<span>
							{event.date || "No date"}
							{#if event.location?.city || event.location?.name}
								· {event.location?.city || event.location?.name}
							{/if}
							· <span class="status-pill" class:completed={event.status === "completed"}>{event.status}</span>
						</span>
					</div>
					<form method="POST" action="?/removeEvent">
						<input type="hidden" name="eventId" value={event.id} />
						<button class="ghost-button" type="submit">Remove</button>
					</form>
				</article>
			{:else}
				<div class="empty-state">No events in this trip yet. Use the picker below to add some.</div>
			{/each}
		</div>
	</section>

	<section class="trip-add-events">
		<div class="section-heading">
			<div>
				<p class="eyebrow">Add events</p>
				<h2>Assign existing events to this trip</h2>
			</div>
		</div>
		{#if data.availableEvents.length === 0}
			<div class="empty-state">All your events are either already in this trip or you have none yet. <a href="/events/new">Create a new event</a> and pick this trip.</div>
		{:else}
			<div class="picker-list">
				{#each data.availableEvents as event}
					<form
						method="POST"
						action="?/addEvent"
						class="picker-row"
						onsubmit={(e) => {
							if (event.tripId && !confirm(`"${event.title}" is currently in another trip. Move it to this one?`)) {
								e.preventDefault();
							}
						}}
					>
						<input type="hidden" name="eventId" value={event.id} />
						<div class="picker-info">
							<strong>{event.title}</strong>
							<span>
								{event.date || "No date"}
								{#if event.location?.city || event.location?.name}
									· {event.location?.city || event.location?.name}
								{/if}
								{#if event.tripId}
									<span class="muted">(currently in another trip)</span>
								{/if}
							</span>
						</div>
						<button class="ghost-button" type="submit">{event.tripId ? "Move here" : "Add"}</button>
					</form>
				{/each}
			</div>
		{/if}
	</section>
</main>

<style>
	.trip-detail-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
	}

	.trip-actions {
		display: flex;
		gap: 8px;
	}

	.danger:hover {
		border-color: #b9442e;
		color: #b9442e;
	}

	.trip-edit {
		display: grid;
		gap: 10px;
		max-width: 520px;
	}

	.trip-edit-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}

	.trip-edit-actions {
		display: flex;
		gap: 8px;
	}

	.trip-stats {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 12px;
		margin-bottom: 22px;
	}

	.trip-stats div {
		border: 1px solid var(--line);
		border-radius: 8px;
		padding: 14px;
		background: rgba(255, 250, 242, 0.82);
		box-shadow: var(--shadow-soft);
	}

	.trip-stats span {
		color: var(--muted);
		font-size: 0.82rem;
		font-weight: 800;
	}

	.trip-stats strong {
		display: block;
		margin-top: 6px;
		color: var(--brand-dark);
		font-size: 1.4rem;
		line-height: 1.1;
	}

	.trip-map {
		margin-bottom: 22px;
		border-radius: 10px;
		overflow: hidden;
	}

	.trip-events,
	.trip-add-events {
		margin-bottom: 22px;
	}

	.section-heading {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 12px;
	}

	.section-heading h2 {
		margin: 0;
	}

	.event-list,
	.picker-list {
		display: grid;
		gap: 8px;
	}

	.event-row,
	.picker-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 14px;
		border: 1px solid var(--line);
		border-radius: 8px;
		background: #fff7ec;
	}

	.event-info,
	.picker-info {
		display: grid;
		gap: 3px;
		min-width: 0;
	}

	.event-info span,
	.picker-info span {
		color: var(--muted);
		font-size: 0.85rem;
		font-weight: 700;
	}

	.muted {
		color: #9a7356;
	}

	.status-pill {
		display: inline-block;
		border-radius: 999px;
		border: 1px solid #b7dff0;
		background: #eaf6fb;
		color: #176b91;
		padding: 1px 8px;
		font-size: 0.78rem;
		font-weight: 800;
	}

	.status-pill.completed {
		border-color: #b8dfad;
		background: #edf8e9;
		color: #2f6f35;
	}

	@media (max-width: 720px) {
		.trip-stats {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.trip-detail-header {
			flex-direction: column;
		}
	}
</style>
