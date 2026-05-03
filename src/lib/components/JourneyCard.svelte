<script>
	let { event } = $props();
	const entry = $derived(event.journeyEntry || {});
	const media = $derived(entry.imageUrl ? { imageUrl: entry.imageUrl, imageAlt: event.title } : event.media);
</script>

<article class="card journey-card">
	<div class="media {event.category?.toLowerCase().replaceAll(' ', '-') || 'default'}">
		{#if media?.imageUrl}
			<img src={media.imageUrl} alt={media.imageAlt || event.title} />
		{:else}
			<span>{event.category}</span>
		{/if}
	</div>
	<div>
		<div class="meta-row">
			<span class="category">{event.category}</span>
			<span>{event.date}</span>
			<span>{event.location?.city || event.location?.name}, {event.location?.country || "World"}</span>
		</div>
		<p class="trail">Journey stop · {event.location?.name}</p>
		<h3><a href="/events/{event.id}">{event.title}</a></h3>
		<p>{entry.memoryText}</p>
		<strong class="rating">{"*".repeat(entry.rating || 0)}{"-".repeat(5 - (entry.rating || 0))}</strong>
		{#if event.media?.imageCredit}
			<p class="credit">{event.media.imageCredit} · {event.media.imageLicense}</p>
		{/if}
	</div>
</article>

<style>
	.journey-card {
		display: grid;
		grid-template-columns: 180px 1fr;
		gap: 18px;
		position: relative;
		overflow: hidden;
	}

	.journey-card::after {
		content: "memory";
		position: absolute;
		right: 16px;
		top: 16px;
		color: rgba(122, 63, 29, 0.26);
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-size: 0.7rem;
	}

	.media {
		min-height: 150px;
		border-radius: 8px;
		overflow: hidden;
		display: grid;
		place-items: center;
		color: white;
		font-weight: 900;
		background:
			linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0 18%, transparent 18% 100%),
			linear-gradient(135deg, var(--brand), var(--sky));
	}

	.media.food {
		background:
			linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0 18%, transparent 18% 100%),
			linear-gradient(135deg, var(--accent), #f97316);
	}

	.media.party {
		background:
			linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0 18%, transparent 18% 100%),
			linear-gradient(135deg, var(--rose), #7c3aed);
	}

	.media.beach {
		background:
			linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0 18%, transparent 18% 100%),
			linear-gradient(135deg, var(--sky), #60a5fa);
	}

	.media.culture {
		background:
			linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0 18%, transparent 18% 100%),
			linear-gradient(135deg, #8b5cf6, #c084fc);
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.rating {
		color: var(--accent);
		letter-spacing: 0.08em;
	}

	.trail {
		margin: 10px 0 6px;
		color: var(--brand);
		font-weight: 900;
		font-size: 0.82rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.credit {
		margin-top: 10px;
		margin-bottom: 0;
		color: #9a7356;
		font-size: 0.78rem;
		font-weight: 700;
	}

	@media (max-width: 720px) {
		.journey-card {
			grid-template-columns: 1fr;
		}
	}
</style>
