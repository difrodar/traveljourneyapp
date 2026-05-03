<script>
	let { locations = [] } = $props();
</script>

<div class="pin-grid">
	{#each locations as location}
		<article class="card pin-card">
			<div class="location-image">
				{#if location.media?.imageUrl}
					<img src={location.media.imageUrl} alt={location.media.imageAlt || location.name} />
				{:else}
					<span class="pin">•</span>
				{/if}
			</div>
			<div>
				<h3>{location.name}</h3>
				<p class="muted">{location.address}, {location.city}</p>
				<p>{location.events.length} linked event{location.events.length === 1 ? "" : "s"}</p>
				{#if location.media?.imageCredit}
					<p class="credit">{location.media.imageCredit} · {location.media.imageLicense}</p>
				{/if}
				<div class="meta-row">
					<span>{location.coordinates?.lat}</span>
					<span>{location.coordinates?.lng}</span>
				</div>
			</div>
		</article>
	{/each}
</div>

<style>
	.pin-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 16px;
	}

	.pin-card {
		display: grid;
		grid-template-columns: 138px 1fr;
		gap: 13px;
		overflow: hidden;
	}

	.location-image {
		min-height: 120px;
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

	.pin {
		font-size: 1.5rem;
	}

	.credit {
		color: #9a7356;
		font-size: 0.78rem;
		font-weight: 700;
	}

	@media (max-width: 900px) {
		.pin-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 560px) {
		.pin-card {
			grid-template-columns: 1fr;
		}
	}
</style>
