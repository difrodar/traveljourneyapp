<script>
	import PlaceholderIcon from "$lib/components/PlaceholderIcon.svelte";

	let { event } = $props();
	const entry = $derived(event.journeyEntry || {});
	const isBundle = $derived(Boolean(event.isRecurrenceBundle));
	const detailHref = $derived(isBundle ? `/events/${event.occurrences?.[0]?.id}` : `/events/${event.id}`);
	const heroImage = $derived.by(() => {
		if (isBundle) {
			const memory = event.occurrences?.find((occurrence) => occurrence.journeyEntry?.images?.length);
			if (memory?.journeyEntry?.images?.[0]) {
				return { url: memory.journeyEntry.images[0].url, alt: memory.journeyEntry.images[0].alt || event.title };
			}
			return event.media?.images?.[0] || null;
		}
		return entry.images?.[0] || event.media?.images?.[0] || null;
	});
	const photoCount = $derived(
		isBundle
			? (event.occurrences || []).reduce(
					(sum, occ) => sum + (occ.journeyEntry?.images?.length || 0),
					event.media?.images?.length || 0
				)
			: (event.media?.images?.length || 0) + (entry.images?.length || 0)
	);
	const cover = $derived(event.media?.images?.[0]);
</script>

<article class="card journey-card">
	<div class="media {event.category?.toLowerCase().replaceAll(' ', '-') || 'default'}">
		{#if heroImage?.url}
			<img src={heroImage.url} alt={heroImage.alt || event.title} />
		{:else}
			<div class="media-placeholder">
				<PlaceholderIcon size={32} />
				<span>{event.category}</span>
			</div>
		{/if}
		{#if photoCount > 1}
			<span class="multi-photo-dot" aria-label="{photoCount} photos">●●●</span>
		{/if}
	</div>
	<div>
		<div class="meta-row">
			<span class="category">{event.category}</span>
			<span>{isBundle ? event.dateRangeLabel : event.date}</span>
			<span>{event.location?.city || event.location?.name}, {event.location?.country || "World"}</span>
		</div>
		<p class="trail">
			{#if isBundle}
				Recurring journey - {event.memoryCount} memor{event.memoryCount === 1 ? "y" : "ies"}
			{:else}
				Journey stop - {event.location?.name}
			{/if}
		</p>
		<h3><a href={detailHref}>{event.title}</a></h3>
		{#if isBundle}
			<div class="memory-list">
				{#each event.occurrences as occurrence}
					<a href="/events/{occurrence.id}">
						<strong>{occurrence.date}</strong>
						<span>{occurrence.journeyEntry?.memoryText}</span>
					</a>
				{/each}
			</div>
			<strong class="memory-date">{event.recurrenceLabel} - {event.occurrenceCount} occurrences</strong>
		{:else}
			<p>{entry.memoryText}</p>
			<strong class="memory-date">{event.date || "Memory saved"}</strong>
		{/if}
		{#if cover?.credit}
			<p class="credit">{cover.credit}{cover.license ? ` - ${cover.license}` : ""}</p>
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
		position: relative;
		color: white;
		font-weight: 900;
		background:
			linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0 18%, transparent 18% 100%),
			linear-gradient(135deg, var(--brand), var(--sky));
	}

	.multi-photo-dot {
		position: absolute;
		top: 8px;
		right: 10px;
		border-radius: 999px;
		background: rgba(0, 0, 0, 0.55);
		color: white;
		font-size: 0.62rem;
		font-weight: 900;
		letter-spacing: 0.16em;
		padding: 4px 9px;
		pointer-events: none;
	}

	.media-placeholder {
		display: grid;
		place-items: center;
		gap: 6px;
		opacity: 0.92;
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

	.media.travel,
	.media.flight,
	.media.weekend-trip {
		background:
			linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0 18%, transparent 18% 100%),
			linear-gradient(135deg, var(--coral), var(--brand));
	}

	.media.culture {
		background:
			linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0 18%, transparent 18% 100%),
			linear-gradient(135deg, #8b5cf6, #c084fc);
	}

	.media.education,
	.media.study {
		background:
			linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0 18%, transparent 18% 100%),
			linear-gradient(135deg, #2563eb, #38bdf8);
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.memory-date {
		display: inline-flex;
		margin-top: 8px;
		color: var(--brand-dark);
	}

	.memory-list {
		display: grid;
		gap: 8px;
		margin: 8px 0;
	}

	.memory-list a {
		display: grid;
		gap: 3px;
		border-radius: 8px;
		background: #fff7ec;
		border: 1px solid #efd5b6;
		padding: 10px;
	}

	.memory-list a:hover {
		border-color: #e9b77e;
	}

	.memory-list strong {
		color: var(--brand-dark);
		font-size: 0.86rem;
	}

	.memory-list span {
		color: #51453d;
		line-height: 1.45;
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
