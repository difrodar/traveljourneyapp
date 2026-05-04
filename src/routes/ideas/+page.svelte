<script>
	import TravelIdeaCard from "$lib/components/TravelIdeaCard.svelte";

	let { data, form } = $props();
</script>

<main class="page-shell">
	<header class="page-header">
		<div>
			<p class="eyebrow">Travel ideas</p>
			<h1>Catch ideas before they disappear</h1>
			<p class="lead">Collect trip ideas, rank them and turn them into planned events when they become concrete.</p>
		</div>
	</header>

	{#if data.setupError}
		<div class="message error">{data.setupError}</div>
	{:else if form?.error}
		<div class="message error">{form.error}</div>
	{:else if form?.message}
		<div class="message">{form.message}</div>
	{/if}

	<section class="grid two">
		<form class="panel" method="POST" action="?/create">
			<div class="form-grid">
				<div class="field">
					<label for="title">Title</label>
					<input id="title" name="title" required />
				</div>
				<div class="field">
					<label for="location">Location</label>
					<input id="location" name="location" required />
				</div>
				<div class="field">
					<label for="city">City</label>
					<input id="city" name="city" placeholder="e.g. Tokyo" />
				</div>
				<div class="field">
					<label for="country">Country</label>
					<input id="country" name="country" value="USA" />
				</div>
				<div class="field">
					<label for="category">Category</label>
					<select id="category" name="category">
						{#each data.categories as category}
							<option value={category}>{category}</option>
						{/each}
					</select>
				</div>
				<div class="field">
					<label for="priority">Priority</label>
					<select id="priority" name="priority">
						{#each data.priorities as priority}
							<option value={priority}>{priority}</option>
						{/each}
					</select>
				</div>
				<div class="field full">
					<label for="notes">Notes</label>
					<textarea id="notes" name="notes"></textarea>
				</div>
			</div>
			<div class="actions">
				<button class="button" type="submit">Save idea</button>
			</div>
		</form>
		<div class="grid">
			{#each data.ideas as idea}
				<TravelIdeaCard {idea} />
			{:else}
				<div class="empty-state">No travel ideas yet.</div>
			{/each}
		</div>
	</section>
</main>

<style>
	.actions {
		margin-top: 18px;
	}
</style>
