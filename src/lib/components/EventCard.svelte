<script>
	import { statusLabels } from "$lib/constants.js";
	import PlaceholderIcon from "$lib/components/PlaceholderIcon.svelte";

	let { event, compact = false } = $props();
	const displayStatus = $derived(event.invitationStatus || event.status);
	const displayStatusLabel = $derived(event.invitationStatus ? event.invitationStatus : statusLabels[event.status]);
	const photoCount = $derived((event.media?.images?.length || 0) + (event.journeyEntry?.images?.length || 0));
</script>

<article class="card event-card {event.category?.toLowerCase().replaceAll(' ', '-') || 'default'}">
	<a class="cover" href="/events/{event.id}" aria-label="Open {event.title}">
		{#if event.media?.images?.[0]?.url}
			<img src={event.media.images[0].url} alt={event.media.images[0].alt || event.title} />
		{:else}
			<div class="cover-placeholder">
				<PlaceholderIcon size={36} />
				<span>{event.category}</span>
			</div>
		{/if}
		{#if photoCount > 1}
			<span class="multi-photo-dot" aria-label="{photoCount} photos">●●●</span>
		{/if}
	</a>
	<div class="topline">
		<span class="category">{event.category}</span>
		<span class="status {displayStatus}">{displayStatusLabel}</span>
	</div>
	<h3><a href="/events/{event.id}">{event.title}</a></h3>
	<p class="muted">{event.description}</p>
	<div class="meta-row">
		<span>{event.date} at {event.time}</span>
		<span>{event.location?.name || "No location"}</span>
	</div>
	{#if event.recurrenceLabel}
		<span class="series-badge">{event.recurrenceLabel}</span>
	{/if}
	{#if event.location?.id}
		<a class="map-link" href="/map?event={event.id}#location-{event.location.id}">View on map</a>
	{/if}
	{#if !compact}
		<div class="friends">
			{#each event.friends || [] as friend}
				<span>{friend.name}</span>
			{/each}
		</div>
	{/if}
</article>

<style>
	.event-card {
		position: relative;
		overflow: hidden;
		min-height: 210px;
		padding-top: 0;
	}

	.event-card::before {
		content: "";
		position: absolute;
		inset: 0 auto 0 0;
		width: 7px;
		background: var(--palm);
	}

	.event-card.beach::before {
		background: var(--sky);
	}

	.event-card.food::before {
		background: var(--accent);
	}

	.event-card.party::before {
		background: var(--rose);
	}

	.event-card.travel::before,
	.event-card.flight::before,
	.event-card.weekend-trip::before {
		background: var(--coral);
	}

	.status.invited {
		background: var(--category-bg);
		border-color: var(--category-border);
		color: var(--category-fg);
	}

	.status.accepted {
		background: var(--status-completed-bg);
		border-color: var(--status-completed-border);
		color: var(--status-completed-fg);
	}

	.event-card.culture::before {
		background: var(--cat-culture);
	}

	.event-card.education::before,
	.event-card.study::before {
		background: var(--cat-education);
	}

	.event-card.outdoor::before {
		background: var(--palm);
	}

	.cover {
		display: grid;
		place-items: center;
		position: relative;
		height: 150px;
		margin: -18px -18px 16px;
		background:
			linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0 18%, transparent 18% 100%),
			linear-gradient(135deg, var(--accent), var(--brand));
		color: white;
		font-weight: 900;
		overflow: hidden;
	}

	.cover-placeholder {
		display: grid;
		place-items: center;
		gap: 6px;
		opacity: 0.92;
	}

	.cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.22s ease;
	}

	.multi-photo-dot {
		position: absolute;
		top: 10px;
		right: 12px;
		border-radius: 999px;
		background: rgba(0, 0, 0, 0.55);
		color: white;
		font-size: 0.62rem;
		font-weight: 900;
		letter-spacing: 0.16em;
		padding: 4px 9px;
		pointer-events: none;
	}

	.event-card:hover .cover img {
		transform: scale(1.04);
	}

	.topline {
		display: flex;
		justify-content: space-between;
		gap: 8px;
		margin-bottom: 12px;
	}

	h3 a:hover {
		color: var(--brand);
	}

	.friends {
		display: flex;
		flex-wrap: wrap;
		gap: 7px;
		margin-top: 14px;
	}

	.map-link {
		display: inline-flex;
		margin-top: 12px;
		color: var(--brand);
		font-weight: 900;
		font-size: 0.88rem;
	}

	.map-link:hover {
		color: var(--coral);
	}

	.series-badge {
		display: inline-flex;
		width: fit-content;
		margin-top: 10px;
		border-radius: 999px;
		background: var(--status-completed-bg);
		color: var(--status-completed-fg);
		font-size: 0.8rem;
		font-weight: 900;
		padding: 6px 10px;
	}

	.friends span {
		border-radius: 999px;
		padding: 5px 9px;
		background: var(--category-bg);
		color: var(--category-fg);
		font-weight: 800;
		font-size: 0.8rem;
	}
</style>
