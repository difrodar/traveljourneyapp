<script>
	let { idea } = $props();
</script>

<article class="card idea">
	<div class="ticket-cut" aria-hidden="true"></div>
	<div class="topline">
		<span class="category">{idea.category}</span>
		<strong>{idea.priority}</strong>
	</div>
	<h3>{idea.title}</h3>
	<p class="muted">{idea.location} · {idea.city || idea.location}, {idea.country || "USA"}</p>
	<p>{idea.notes}</p>
	{#if idea.convertedToEvent}
		<a class="ghost-button" href="/events/{idea.convertedToEvent}">Open converted event</a>
	{:else}
		<form method="POST" action="?/convert">
			<input type="hidden" name="id" value={idea.id} />
			<button class="button" type="submit">Convert to event</button>
		</form>
	{/if}
	<form method="POST" action="?/delete" class="delete">
		<input type="hidden" name="id" value={idea.id} />
		<button class="danger-button" type="submit">Delete</button>
	</form>
</article>

<style>
	.idea {
		position: relative;
		display: grid;
		gap: 10px;
		align-content: start;
		align-self: start;
		overflow: hidden;
		border-style: dashed;
	}

	.ticket-cut {
		position: absolute;
		inset: 0 auto 0 0;
		width: 8px;
		background: linear-gradient(180deg, var(--coral), var(--accent), var(--sky));
	}

	.topline {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}

	.topline strong {
		color: var(--category-fg);
		background: var(--category-bg);
		border: 1px solid var(--category-border);
		border-radius: 999px;
		padding: 5px 10px;
	}

	.delete {
		margin-top: 4px;
	}
</style>
