<script>
	let { locations = [], highlightedEventId = "", highlightedLocationId = "" } = $props();

	function groupLocations(items) {
		const countries = new Map();
		for (const location of items) {
			const countryName = location.country || "World";
			const cityName = location.city || "Unknown city";
			if (!countries.has(countryName)) countries.set(countryName, new Map());
			const cities = countries.get(countryName);
			if (!cities.has(cityName)) cities.set(cityName, []);
			cities.get(cityName).push(location);
		}

		return [...countries.entries()]
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([country, cities]) => ({
				country,
				cities: [...cities.entries()]
					.sort(([a], [b]) => a.localeCompare(b))
					.map(([city, cityLocations]) => ({
						city,
						locations: cityLocations.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
					}))
			}));
	}

	const groups = $derived(groupLocations(locations));
</script>

<div class="map-directory">
	{#each groups as group}
		<section class="country-group">
			<div class="country-heading">
				<p class="eyebrow">Country</p>
				<h2>{group.country}</h2>
			</div>

			{#each group.cities as cityGroup}
				<div class="city-group">
					<h3>{cityGroup.city}</h3>
					<div class="pin-grid">
						{#each cityGroup.locations as location}
							<article
								id="location-{location.id}"
								data-location-id={location.id}
								class="card pin-card"
								class:highlighted={location.id === highlightedLocationId}
							>
								<div class="location-image">
									{#if location.media?.imageUrl}
										<img src={location.media.imageUrl} alt={location.media.imageAlt || location.name} />
									{:else}
										<span class="pin">•</span>
									{/if}
								</div>
								<div class="location-content">
									<div class="location-title">
										<div>
											<p class="muted">Concrete place</p>
											<h4>{location.name}</h4>
										</div>
										<span>{location.events.length} event{location.events.length === 1 ? "" : "s"}</span>
									</div>
									<p class="muted">{location.address || "Address not added yet"}</p>
									<div class="event-list">
										{#each location.events as event}
											<a
												class="event-row"
												class:active={event.id === highlightedEventId}
												href="/events/{event.id}"
											>
												<span>
													<strong>{event.title}</strong>
													<small>{event.date} at {event.time}</small>
												</span>
												<span class="status {event.status}">{event.status}</span>
											</a>
										{/each}
									</div>
									<div class="meta-row">
										<span>{location.coordinates?.lat}</span>
										<span>{location.coordinates?.lng}</span>
									</div>
									{#if location.media?.imageCredit}
										<p class="credit">{location.media.imageCredit} · {location.media.imageLicense}</p>
									{/if}
								</div>
							</article>
						{/each}
					</div>
				</div>
			{/each}
		</section>
	{:else}
		<div class="empty-state">No mapped events match this view. Clear the map filters or add an event with a city and concrete location.</div>
	{/each}
</div>

<style>
	.map-directory {
		display: grid;
		gap: 24px;
	}

	.country-group {
		display: grid;
		gap: 14px;
	}

	.country-heading {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 16px;
		border-bottom: 1px solid var(--line);
		padding-bottom: 8px;
	}

	.country-heading h2,
	.country-heading p {
		margin: 0;
	}

	.city-group {
		display: grid;
		gap: 12px;
	}

	.city-group > h3 {
		margin: 0;
		color: var(--brand-dark);
	}

	.pin-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 16px;
	}

	.pin-card {
		display: grid;
		grid-template-columns: 160px 1fr;
		gap: 14px;
		overflow: hidden;
		scroll-margin-top: 88px;
	}

	.pin-card.highlighted {
		border-color: var(--coral);
		box-shadow: 0 24px 54px rgba(231, 95, 67, 0.2);
	}

	.pin-card.pulse {
		animation: pulse-card 1s ease;
	}

	.location-image {
		min-height: 142px;
		border-radius: 8px;
		overflow: hidden;
		background: linear-gradient(135deg, var(--accent), var(--brand));
		display: grid;
		place-items: center;
		color: white;
		font-weight: 900;
	}

	.location-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.location-content {
		display: grid;
		gap: 10px;
	}

	.location-title {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
	}

	.location-title p,
	.location-title h4 {
		margin: 0;
	}

	.location-title h4 {
		font-size: 1.08rem;
		color: #402a1e;
	}

	.location-title > span {
		flex: 0 0 auto;
		border-radius: 999px;
		padding: 5px 9px;
		background: #fff0dc;
		color: #a94724;
		font-size: 0.78rem;
		font-weight: 900;
	}

	.event-list {
		display: grid;
		gap: 8px;
	}

	.event-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		border: 1px solid var(--line);
		border-radius: 8px;
		padding: 10px;
		background: rgba(255, 247, 236, 0.78);
	}

	.event-row.active {
		border-color: var(--coral);
		background: #fff0dc;
	}

	.event-row strong,
	.event-row small {
		display: block;
	}

	.event-row small {
		margin-top: 3px;
		color: var(--muted);
	}

	.pin {
		font-size: 1.5rem;
	}

	.credit {
		margin: 0;
		color: #9a7356;
		font-size: 0.78rem;
		font-weight: 700;
	}

	@keyframes pulse-card {
		0%,
		100% {
			transform: translateY(0);
		}
		45% {
			transform: translateY(-3px);
		}
	}

	@media (max-width: 980px) {
		.pin-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 620px) {
		.pin-card {
			grid-template-columns: 1fr;
		}

		.location-title,
		.event-row {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>
