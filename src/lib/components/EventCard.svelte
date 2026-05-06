<script>
	import { statusLabels } from "$lib/constants.js";

	let { event, compact = false } = $props();
	const displayStatus = $derived(event.invitationStatus || event.status);
	const displayStatusLabel = $derived(event.invitationStatus ? event.invitationStatus : statusLabels[event.status]);
</script>

<article class="card event-card {event.category?.toLowerCase().replaceAll(' ', '-') || 'default'}">
	<a class="cover" href="/events/{event.id}" aria-label="Open {event.title}">
		{#if event.media?.imageUrl}
			<img src={event.media.imageUrl} alt={event.media.imageAlt || event.title} />
		{:else}
			<span>{event.category}</span>
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

	.event-card.weekend-trip::before {
		background: var(--coral);
	}

	.status.invited {
		background: #fff0dc;
		border-color: #f4c28e;
		color: #a94724;
	}

	.status.accepted {
		background: #edf8e9;
		border-color: #b8dfad;
		color: #2f6f35;
	}

	.event-card.culture::before {
		background: #8b5cf6;
	}

	.event-card.outdoor::before {
		background: var(--palm);
	}

	.cover {
		display: grid;
		place-items: center;
		height: 150px;
		margin: -18px -18px 16px;
		background:
			linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0 18%, transparent 18% 100%),
			linear-gradient(135deg, var(--accent), var(--brand));
		color: white;
		font-weight: 900;
		overflow: hidden;
	}

	.cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.22s ease;
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

	.friends span {
		border-radius: 999px;
		padding: 5px 9px;
		background: #fff1dc;
		color: #7a3f1d;
		font-weight: 800;
		font-size: 0.8rem;
	}
</style>
