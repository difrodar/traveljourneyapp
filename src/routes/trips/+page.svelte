<script>
	let { data, form } = $props();
</script>

<main class="page-shell">
	<header class="page-header">
		<div>
			<p class="eyebrow">Trips</p>
			<h1>Group events into trips</h1>
			<p class="lead">
				Multi-day journeys belong together. Create a trip and assign events from the event form or here on the trip
				page itself. Events without a trip continue to behave as before.
			</p>
		</div>
	</header>

	{#if data.setupError}
		<div class="message error">{data.setupError}</div>
	{/if}

	<form class="panel trip-create" method="POST" action="?/create">
		<details open={Boolean(form?.error)}>
			<summary>New trip&hellip;</summary>
			{#if form?.error}
				<p class="field-error">{form.error}</p>
			{/if}
			<div class="trip-form">
				<label class="filter-field trip-name">
					<span>Name</span>
					<input
						name="name"
						required
						placeholder="e.g. Vietnam April–May 2026"
						value={form?.values?.name || ""}
					/>
				</label>
				<label class="filter-field">
					<span>From</span>
					<input type="date" name="dateFrom" value={form?.values?.dateFrom || ""} />
				</label>
				<label class="filter-field">
					<span>To</span>
					<input type="date" name="dateTo" value={form?.values?.dateTo || ""} />
				</label>
				<label class="filter-field trip-description">
					<span>Description (optional)</span>
					<input name="description" placeholder="Why this trip?" value={form?.values?.description || ""} />
				</label>
				<button class="button" type="submit">Create trip</button>
			</div>
		</details>
	</form>

	<section class="trip-grid" aria-label="Trips">
		{#each data.trips as trip}
			<a class="card trip-card" href="/trips/{trip.id}">
				<div class="trip-card-header">
					<strong>{trip.name}</strong>
					{#if trip.dateFrom || trip.dateTo}
						<span>{trip.dateFrom || "?"} – {trip.dateTo || "?"}</span>
					{:else}
						<span>No dates yet</span>
					{/if}
				</div>
				{#if trip.description}
					<p class="trip-description-text">{trip.description}</p>
				{/if}
				<div class="trip-stats">
					<span><strong>{trip.eventCount}</strong> event{trip.eventCount === 1 ? "" : "s"}</span>
					<span><strong>{trip.memoryCount}</strong> memor{trip.memoryCount === 1 ? "y" : "ies"}</span>
				</div>
			</a>
		{:else}
			<div class="empty-state">
				No trips yet. Create one to group events into a multi-day journey, like Persona Js Vietnam stretch or a
				weekend in Davos.
			</div>
		{/each}
	</section>
</main>

<style>
	.trip-create {
		margin-bottom: 18px;
		padding: 14px 18px;
	}

	.trip-create summary {
		cursor: pointer;
		font-weight: 900;
		color: var(--brand-dark);
	}

	.trip-form {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		margin-top: 12px;
	}

	.trip-form .trip-name,
	.trip-form .trip-description {
		grid-column: 1 / -1;
	}

	.trip-form button {
		grid-column: 1 / -1;
		justify-self: start;
	}

	.trip-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 14px;
	}

	.trip-card {
		display: grid;
		gap: 10px;
		padding: 16px;
		text-decoration: none;
		color: inherit;
		transition: transform 0.15s ease, border-color 0.15s ease;
	}

	.trip-card:hover {
		transform: translateY(-2px);
		border-color: var(--ghost-hover-border);
	}

	.trip-card-header {
		display: grid;
		gap: 4px;
	}

	.trip-card-header strong {
		font-size: 1.12rem;
		color: var(--ink-strong);
	}

	.trip-card-header span {
		color: var(--muted);
		font-weight: 800;
		font-size: 0.85rem;
	}

	.trip-description-text {
		margin: 0;
		color: var(--ink);
		font-size: 0.95rem;
		line-height: 1.4;
	}

	.trip-stats {
		display: flex;
		gap: 16px;
		color: var(--muted);
		font-size: 0.85rem;
		font-weight: 700;
	}

	.trip-stats strong {
		color: var(--brand-dark);
	}

	@media (max-width: 720px) {
		.trip-form {
			grid-template-columns: 1fr;
		}
	}
</style>
