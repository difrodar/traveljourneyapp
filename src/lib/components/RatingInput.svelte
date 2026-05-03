<script>
	let { value = 4 } = $props();
	// svelte-ignore state_referenced_locally
	let rating = $state(Number(value) || 4);
</script>

<div class="rating" role="radiogroup" aria-label="Rating">
	<input type="hidden" name="rating" value={rating} />
	{#each [1, 2, 3, 4, 5] as star}
		<button type="button" class:active={rating >= star} onclick={() => (rating = star)} aria-label="{star} stars">
			★
		</button>
	{/each}
</div>

<style>
	.rating {
		display: flex;
		gap: 6px;
	}

	button {
		width: 42px;
		height: 42px;
		border: 1px solid #fcd34d;
		border-radius: 8px;
		background: #fffbeb;
		color: #b45309;
		font-size: 1.2rem;
	}

	button.active {
		background: #f59e0b;
		color: white;
	}
</style>
