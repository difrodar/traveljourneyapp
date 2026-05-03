<script>
	let { locations = [] } = $props();
</script>

<div class="pin-grid">
	{#each locations as location}
		<article class="card pin-card">
			<div class="pin">●</div>
			<div>
				<h3>{location.name}</h3>
				<p class="muted">{location.address}, {location.city}</p>
				<p>{location.events.length} linked event{location.events.length === 1 ? "" : "s"}</p>
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
		grid-template-columns: auto 1fr;
		gap: 13px;
	}

	.pin {
		width: 42px;
		height: 42px;
		display: grid;
		place-items: center;
		border-radius: 999px;
		background: #ecfdf3;
		color: var(--brand);
	}

	@media (max-width: 900px) {
		.pin-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
