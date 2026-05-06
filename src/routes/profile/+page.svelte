<script>
	let { data } = $props();

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
			<div class="avatar" aria-hidden="true">{data.user.username.slice(0, 1).toUpperCase()}</div>
			<h2>{data.user.username}</h2>
			<p class="muted">
				This prototype keeps events, friends, locations, ideas and memories separated by account. No roles, emails or password settings are part of this page.
			</p>
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

	.avatar {
		display: grid;
		place-items: center;
		width: 74px;
		height: 74px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--coral), var(--accent));
		color: white;
		font-size: 2rem;
		font-weight: 900;
		box-shadow: var(--shadow-soft);
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

	.invited-panel {
		margin-top: 18px;
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
		background: #fff7ec;
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
		border-color: #e9b77e;
		background: #fff1dc;
	}

	.recent-row small {
		border-radius: 999px;
		border: 1px solid #b7dff0;
		background: #eaf6fb;
		color: #176b91;
		padding: 5px 10px;
		font-weight: 900;
	}

	.recent-row small.completed {
		border-color: #b8dfad;
		background: #edf8e9;
		color: #2f6f35;
	}

	@media (max-width: 860px) {
		.profile-grid,
		.stats-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
