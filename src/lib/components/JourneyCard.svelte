<script>
	let { event } = $props();
	const entry = $derived(event.journeyEntry || {});
</script>

<article class="card journey-card">
	<div class="media {event.category?.toLowerCase().replaceAll(' ', '-') || 'default'}">
		{#if entry.imageUrl}
			<img src={entry.imageUrl} alt="" />
		{:else}
			<span>{event.category}</span>
		{/if}
	</div>
	<div>
		<div class="meta-row">
			<span class="category">{event.category}</span>
			<span>{event.date}</span>
			<span>{event.location?.name}</span>
		</div>
		<h3><a href="/events/{event.id}">{event.title}</a></h3>
		<p>{entry.memoryText}</p>
		<strong class="rating">{"★".repeat(entry.rating || 0)}{"☆".repeat(5 - (entry.rating || 0))}</strong>
	</div>
</article>

<style>
	.journey-card {
		display: grid;
		grid-template-columns: 180px 1fr;
		gap: 18px;
	}

	.media {
		min-height: 150px;
		border-radius: 8px;
		overflow: hidden;
		display: grid;
		place-items: center;
		color: white;
		font-weight: 900;
		background: linear-gradient(135deg, var(--brand), var(--sky));
	}

	.media.food {
		background: linear-gradient(135deg, var(--accent), #f97316);
	}

	.media.party {
		background: linear-gradient(135deg, var(--rose), #7c3aed);
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.rating {
		color: #d97706;
		letter-spacing: 0.08em;
	}

	@media (max-width: 720px) {
		.journey-card {
			grid-template-columns: 1fr;
		}
	}
</style>
