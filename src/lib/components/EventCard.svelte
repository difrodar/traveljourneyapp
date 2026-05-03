<script>
	import { statusLabels } from "$lib/constants.js";

	let { event, compact = false } = $props();
</script>

<article class="card event-card {event.category?.toLowerCase().replaceAll(' ', '-') || 'default'}">
	<div class="topline">
		<span class="category">{event.category}</span>
		<span class="status {event.status}">{statusLabels[event.status]}</span>
	</div>
	<h3><a href="/events/{event.id}">{event.title}</a></h3>
	<p class="muted">{event.description}</p>
	<div class="meta-row">
		<span>{event.date} at {event.time}</span>
		<span>{event.location?.name || "No location"}</span>
	</div>
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
	}

	.event-card::before {
		content: "";
		position: absolute;
		inset: 0 auto 0 0;
		width: 5px;
		background: var(--brand);
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

	.friends span {
		border-radius: 999px;
		padding: 5px 9px;
		background: #f1f5f9;
		font-weight: 800;
		font-size: 0.8rem;
	}
</style>
