<script>
	let { initial = [] } = $props();
	// svelte-ignore state_referenced_locally
	let friends = $state(initial.map((friend) => friend.name || friend).filter(Boolean));
	let draft = $state("");

	function addFriend() {
		const name = draft.trim();
		if (!name || friends.includes(name)) return;
		friends = [...friends, name];
		draft = "";
	}

	function removeFriend(name) {
		friends = friends.filter((friend) => friend !== name);
	}
</script>

<div class="picker">
	<input type="hidden" name="friendNames" value={friends.join(", ")} />
	<div class="add-row">
		<input bind:value={draft} placeholder="Add friend, e.g. Mia" onkeydown={(event) => event.key === "Enter" && (event.preventDefault(), addFriend())} />
		<button class="ghost-button" type="button" onclick={addFriend}>Add</button>
	</div>
	<div class="chips">
		{#each friends as friend}
			<button type="button" onclick={() => removeFriend(friend)}>{friend} x</button>
		{/each}
		{#if friends.length === 0}
			<span class="muted">No friends invited yet.</span>
		{/if}
	</div>
</div>

<style>
	.picker {
		display: grid;
		gap: 10px;
	}

	.add-row {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 8px;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.chips button {
		border: 1px solid #cbd5e1;
		background: #f8fafc;
		border-radius: 999px;
		padding: 6px 10px;
		font-weight: 800;
	}
</style>
