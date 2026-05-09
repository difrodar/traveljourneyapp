<script>
	let { users = [], selectedIds = [], error = "" } = $props();
	const selected = $derived(new Set((selectedIds || []).map(String)));
	let query = $state("");
	const showSearch = $derived(users.length > 5);
	const visibleUsers = $derived(
		query.trim()
			? users.filter((u) => u.username.toLowerCase().includes(query.trim().toLowerCase()))
			: users
	);
	const hiddenSelected = $derived(
		users.filter((u) => selected.has(String(u.id)) && !visibleUsers.some((v) => v.id === u.id))
	);

	function blockEnter(domEvent) {
		if (domEvent.key === "Enter") domEvent.preventDefault();
	}
</script>

<div class="picker">
	{#if users.length}
		{#if showSearch}
			<input
				class="search"
				type="search"
				bind:value={query}
				onkeydown={blockEnter}
				placeholder="Search by username"
				aria-label="Filter users"
			/>
		{/if}
		<div class="user-grid">
			{#each visibleUsers as user}
				<label class="user-option">
					<input type="checkbox" name="invitedUserIds" value={user.id} checked={selected.has(String(user.id))} />
					<span>{user.username}</span>
				</label>
			{/each}
		</div>
		{#if visibleUsers.length === 0}
			<p class="muted">No users match "{query}".</p>
		{/if}
		{#each hiddenSelected as user}
			<input type="hidden" name="invitedUserIds" value={user.id} />
		{/each}
	{:else}
		<p class="muted">No other users available yet. Create another account to invite someone.</p>
	{/if}
	{#if error}
		<p class="field-error">{error}</p>
	{/if}
</div>

<style>
	.picker {
		display: grid;
		gap: 10px;
	}

	.search {
		width: 100%;
		max-width: 320px;
	}

	.user-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.user-option {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		border: 1px solid #d8bfa4;
		border-radius: 999px;
		background: #fff7ec;
		padding: 7px 11px;
		color: #7a3f1d;
		font-weight: 900;
	}

	.user-option:has(input:checked) {
		border-color: #b8dfad;
		background: #edf8e9;
		color: #2f6f35;
	}

	.user-option input {
		width: auto;
	}

	.field-error {
		margin: 0;
		color: #b42318;
		font-size: 0.88rem;
		font-weight: 800;
	}
</style>
