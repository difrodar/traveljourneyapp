<script>
	let { idea } = $props();
</script>

<article class="card idea">
	<div class="topline">
		<span class="category">{idea.category}</span>
		<strong>{idea.priority}</strong>
	</div>
	<h3>{idea.title}</h3>
	<p class="muted">{idea.location}</p>
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
		display: grid;
		gap: 10px;
	}

	.topline {
		display: flex;
		justify-content: space-between;
		gap: 10px;
	}

	.delete {
		margin-top: 4px;
	}
</style>
