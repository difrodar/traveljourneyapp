<script>
	import Avatar from "$lib/components/Avatar.svelte";

	let { data, form } = $props();

	const statItems = $derived([
		{ label: "Events", value: data.stats.events, hint: "all plans and memories" },
		{ label: "Invites", value: data.stats.invitedEvents, hint: "events from other users" },
		{ label: "Planned", value: data.stats.plannedEvents, hint: "upcoming events" },
		{ label: "Memories", value: data.stats.completedMemories, hint: "completed journey entries" },
		{ label: "Places", value: data.stats.locations, hint: "saved locations" },
		{ label: "Ideas", value: data.stats.ideas, hint: "future trip sparks" }
	]);

	const actions = [
		{ href: "/events/new", label: "Create event", hint: "Plan the next activity" },
		{ href: "/journey", label: "Open journey", hint: "Revisit completed memories" },
		{ href: "/map", label: "View map", hint: "See events by place" },
		{ href: "/ideas", label: "Add idea", hint: "Collect future plans" }
	];
</script>

<main class="page-shell">
	<header class="page-header">
		<div>
			<p class="eyebrow">Profile</p>
			<h1>{data.user.username}'s TripTales</h1>
			<p class="lead">
				A calm account overview for your private travel workspace: plans, places, memories and next steps in one place.
			</p>
		</div>
		<form method="POST" action="/logout">
			<button class="ghost-button" type="submit">Logout</button>
		</form>
	</header>

	{#if data.setupError}
		<div class="message error">{data.setupError}</div>
	{/if}

	<section class="profile-grid">
		<article class="panel account-card">
			<p class="eyebrow">Account</p>
			<Avatar username={data.user.username} avatarUrl={data.user.avatarUrl} size={88} ariaHidden={true} />
			<h2>{data.user.username}</h2>
			<p class="muted">
				This prototype keeps events, friends, locations, ideas and memories separated by account. No roles, emails or password settings are part of this page.
			</p>
			<div class="avatar-tools">
				{#if form?.error}
					<p class="message error" role="alert">{form.error}</p>
				{:else if form?.message}
					<p class="message" role="status">{form.message}</p>
				{/if}
				<form method="POST" action="?/uploadAvatar" enctype="multipart/form-data" class="avatar-upload">
					<label class="ghost-button" for="avatarFile">Upload picture</label>
					<input id="avatarFile" name="avatarFile" type="file" accept="image/jpeg,image/png,image/webp" onchange={(domEvent) => domEvent.currentTarget.form?.requestSubmit()} />
				</form>
				{#if data.user.avatarUrl}
					<form method="POST" action="?/removeAvatar">
						<button class="ghost-button" type="submit">Remove picture</button>
					</form>
				{/if}
				<small class="muted avatar-hint">JPG, PNG or WebP — up to 1 MB.</small>
			</div>
		</article>

		<section class="stats-grid" aria-label="Account statistics">
			{#each statItems as item}
				<div class="card stat-card">
					<strong>{item.value}</strong>
					<span>{item.label}</span>
					<small>{item.hint}</small>
				</div>
			{/each}
		</section>
	</section>

	<section class="grid two profile-sections">
		<div class="panel">
			<div class="section-heading">
				<div>
					<p class="eyebrow">Next actions</p>
					<h2>Keep building your trip</h2>
				</div>
			</div>
			<div class="action-grid">
				{#each actions as action}
					<a class="action-card" href={action.href}>
						<strong>{action.label}</strong>
						<span>{action.hint}</span>
					</a>
				{/each}
			</div>
		</div>

		<div class="panel">
			<div class="section-heading">
				<div>
					<p class="eyebrow">Recent activity</p>
					<h2>Recently edited events</h2>
				</div>
				<a class="ghost-button" href="/events">All events</a>
			</div>
			<div class="recent-list">
				{#each data.recentActivity as event}
					<a class="recent-row" href="/events/{event.id}">
						<div>
							<strong>{event.title}</strong>
							<span>{event.location?.name || "No location yet"} · {event.date || "No date"}</span>
						</div>
						<small class:completed={event.status === "completed"}>{event.status}</small>
					</a>
				{:else}
					<div class="empty-state">No account activity yet. Create your first event to start filling this profile.</div>
				{/each}
			</div>
		</div>
	</section>

	<section class="panel invited-panel">
		<div class="section-heading">
			<div>
				<p class="eyebrow">Invitations</p>
				<h2>Events you are invited to</h2>
			</div>
		</div>
		<div class="recent-list">
			{#each data.invitedEvents as event}
				<a class="recent-row invited-row" href="/events/{event.id}">
					<div>
						<strong>{event.title}</strong>
						<span>
							{event.location?.name || "No location yet"} · {event.date || "No date"}
							{#if event.owner?.username}
								· by {event.owner.username}
							{/if}
						</span>
					</div>
					<small class:completed={event.invitationStatus === "accepted"}>{event.invitationStatus || event.status}</small>
				</a>
			{:else}
				<div class="empty-state">No invitations yet. When another TripTales user invites you to an event, it will appear here.</div>
			{/each}
		</div>
	</section>

	<section class="panel shares-panel">
		<div class="section-heading">
			<div>
				<p class="eyebrow">Shares</p>
				<h2>Active share links</h2>
			</div>
		</div>
		<p class="muted shares-hint">
			Anyone with one of these links can view your journey memories. Revoke a link to make it stop working immediately.
		</p>
		<div class="recent-list">
			{#each data.shares as share}
				<div class="share-row">
					<div class="share-info">
						<code>/share/{share.hash}</code>
						<span>
							{#if share.tripName}
								Trip: {share.tripName}
							{:else if share.tripId}
								Trip: (deleted)
							{:else}
								Whole journey
							{/if}
							·
							{#if share.expiresAt}
								Expires {share.expiresAt.slice(0, 10)}
							{:else}
								Never expires
							{/if}
							· created {share.createdAt.slice(0, 10)}
						</span>
					</div>
					<form method="POST" action="?/revoke">
						<input type="hidden" name="hash" value={share.hash} />
						<button class="ghost-button" type="submit">Revoke</button>
					</form>
				</div>
			{:else}
				<div class="empty-state">No active share links yet. Create one from the <a href="/journey">Journey</a> page.</div>
			{/each}
		</div>
	</section>
</main>

<style>
	.profile-grid {
		display: grid;
		grid-template-columns: minmax(260px, 0.85fr) minmax(0, 1.15fr);
		gap: 16px;
		align-items: stretch;
		margin-bottom: 18px;
	}

	.account-card {
		display: grid;
		align-content: start;
		gap: 12px;
	}

	.avatar-tools {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		margin-top: 4px;
	}

	.avatar-tools .message {
		flex-basis: 100%;
		margin: 0 0 4px;
	}

	.avatar-upload {
		display: contents;
	}

	.avatar-upload input[type="file"] {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
	}

	.avatar-upload label {
		cursor: pointer;
	}

	.avatar-hint {
		flex-basis: 100%;
		font-size: 0.78rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 12px;
	}

	.stat-card {
		display: grid;
		gap: 5px;
	}

	.stat-card strong {
		color: var(--coral);
		font-size: 2rem;
		line-height: 1;
	}

	.stat-card span,
	.action-card strong,
	.recent-row strong {
		font-weight: 900;
	}

	.stat-card small,
	.action-card span,
	.recent-row span {
		color: var(--muted);
		font-weight: 700;
	}

	.profile-sections {
		margin-top: 18px;
	}

	.invited-panel,
	.shares-panel {
		margin-top: 18px;
	}

	.shares-hint {
		margin: -6px 0 14px;
		font-size: 0.9rem;
	}

	.share-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		border: 1px solid var(--line);
		border-radius: 8px;
		background: var(--surface-raised);
		padding: 12px 14px;
	}

	.share-info {
		display: grid;
		gap: 4px;
		min-width: 0;
		overflow: hidden;
	}

	.share-info code {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.86rem;
		color: var(--brand-dark);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.share-info span {
		color: var(--muted);
		font-size: 0.82rem;
		font-weight: 700;
	}

	.section-heading {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 14px;
	}

	.action-grid,
	.recent-list {
		display: grid;
		gap: 10px;
	}

	.action-card,
	.recent-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		border: 1px solid var(--line);
		border-radius: 8px;
		background: var(--surface-raised);
		padding: 13px;
		transition:
			transform 0.15s ease,
			border-color 0.15s ease,
			background 0.15s ease;
	}

	.action-card {
		align-items: flex-start;
		flex-direction: column;
	}

	.action-card:hover,
	.recent-row:hover {
		transform: translateY(-1px);
		border-color: var(--ghost-hover-border);
		background: var(--ghost-hover-bg);
	}

	.recent-row small {
		border-radius: 999px;
		border: 1px solid var(--status-planned-border);
		background: var(--status-planned-bg);
		color: var(--status-planned-fg);
		padding: 5px 10px;
		font-weight: 900;
	}

	.recent-row small.completed {
		border-color: var(--status-completed-border);
		background: var(--status-completed-bg);
		color: var(--status-completed-fg);
	}

	@media (max-width: 860px) {
		.profile-grid,
		.stats-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
