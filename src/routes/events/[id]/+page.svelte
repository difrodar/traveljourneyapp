<script>
	import DeleteRecurringDialog from "$lib/components/DeleteRecurringDialog.svelte";
	import EventForm from "$lib/components/EventForm.svelte";
	import EventMapPanel from "$lib/components/EventMapPanel.svelte";
	import MemoryForm from "$lib/components/MemoryForm.svelte";
	import SharePreview from "$lib/components/SharePreview.svelte";
	import { buildGallery, formatEventDate } from "$lib/utils/event-format.js";

	let { data, form } = $props();
	let showDeleteDialog = $state(false);
	const event = $derived(data.event);
	const friends = $derived(event.friends || []);
	const isOwner = $derived(Boolean(event.isOwner));
	const isInvitedViewer = $derived(Boolean(event.invitationStatus) && !isOwner);
	const canSaveMemory = $derived(isOwner || (event.invitationStatus === "accepted" && event.status === "completed"));
	const displayDate = $derived(formatEventDate(event.date, event.time));
	const gallery = $derived.by(() => buildGallery(event));
</script>

<main class="event-screen">
	<aside class="event-sidebar" aria-label="Event navigation">
		<a class="side-brand" href="/">
			<span><b>Trip</b>Tales</span>
			<small>event moment</small>
		</a>
		<nav>
			<a href="/">Dashboard</a>
			<a href="/events" class="active">Events</a>
			<a href="/journey">Journey</a>
			<a href="/map?event={event.id}">Map</a>
			<a href="/events/new" class="muted-link">+ Create Event</a>
		</nav>
		{#if isOwner}
			{#if event.recurrenceGroupId}
				<button class="danger-link" type="button" onclick={() => (showDeleteDialog = true)}>Delete event or series</button>
			{:else}
				<form method="POST" action="?/delete">
					<input type="hidden" name="deleteScope" value="single" />
					<button class="danger-link" type="submit">Delete event</button>
				</form>
			{/if}
		{/if}
	</aside>

	<DeleteRecurringDialog open={showDeleteDialog} {event} onClose={() => (showDeleteDialog = false)} />

	<section class="event-detail">
		{#if form?.error}
			<div class="message error">{form.error}</div>
		{:else if form?.message}
			<div class="message">{form.message}</div>
		{/if}

		<section class="photo-hero">
			{#if event.media?.imageUrl}
				<img src={event.media.imageUrl} alt={event.media.imageAlt || event.title} />
			{:else}
				<div class="cover-fallback">{event.category}</div>
			{/if}
			<div class="hero-actions">
				{#if isOwner}
					<a href="#edit-plan">Edit Event</a>
				{/if}
				<a href="#share-preview">Share</a>
			</div>
			<a class="close-button" href="/events" aria-label="Back to events">X</a>
			<div class="hero-copy">
				<div class="hero-tags">
					{#if isInvitedViewer}
						<span class="status invited">{event.invitationStatus}</span>
					{:else}
						<span class="status {event.status}">{event.status}</span>
					{/if}
					<span class="category">{event.category}</span>
					{#if event.recurrenceLabel}
						<span class="series-badge">{event.recurrenceLabel}</span>
					{/if}
					{#if event.upcoming?.active}
						<span class="reminder-badge">{event.upcoming.badge}: {event.upcoming.label}</span>
					{/if}
				</div>
				<h1>{event.title}</h1>
				<p>{displayDate}</p>
				<p>{event.location?.name}, {event.location?.city || event.location?.country}</p>
			</div>
			{#if event.media?.imageCredit}
				<p class="image-credit">{event.media.imageCredit} / {event.media.imageLicense}</p>
			{/if}
		</section>

		<section class="content-shell">
			<div class="primary-column">
				{#if isInvitedViewer}
					<section class="info-panel invitation-panel">
						<div>
							<p class="eyebrow">Invitation</p>
							<h2>You are invited by {event.owner?.username || "another TripTales user"}</h2>
							<p class="lead-text">Accept the invitation to keep it in your profile, or decline to remove yourself from this event.</p>
						</div>
						<div class="invitation-actions">
							{#if event.invitationStatus !== "accepted"}
								<form method="POST" action="?/accept">
									<button class="button" type="submit">Accept invitation</button>
								</form>
							{/if}
							<form method="POST" action="?/decline">
								<button class="ghost-button" type="submit">Decline</button>
							</form>
						</div>
					</section>
				{/if}

				<section class="info-panel">
					<div>
						<p class="eyebrow">Plan</p>
						<h2>Event details</h2>
						<p class="lead-text">{event.description || "No description added yet."}</p>
					</div>
					<div class="detail-grid">
						<div>
							<span>Date</span>
							<strong>{event.date}</strong>
						</div>
						<div>
							<span>Time</span>
							<strong>{event.time}</strong>
						</div>
						<div>
							<span>Location</span>
							<strong>{event.location?.name}</strong>
						</div>
						<div>
							<span>Status</span>
							<strong>{isInvitedViewer ? event.invitationStatus : event.status}</strong>
						</div>
						{#if event.recurrenceLabel}
							<div>
								<span>Series</span>
								<strong>{event.recurrenceLabel}</strong>
							</div>
						{/if}
					</div>
					<div class="friend-strip">
						<span>Invited TripTales users</span>
						<div>
							{#each friends as friend}
								<strong>{friend.name}</strong>
							{:else}
								<p class="muted">No users invited yet.</p>
							{/each}
						</div>
					</div>
				</section>

				<section class="photo-panel">
					<div>
						<p class="eyebrow">Photos</p>
						<h2>Event image collection</h2>
						<p class="muted">Uploaded event and memory images appear here together with automatic location images.</p>
					</div>
					<div class="photo-grid">
						{#each gallery as photo}
							<figure>
								<img src={photo.url} alt={photo.alt} />
								<figcaption>
									<strong>{photo.label}</strong>
									{#if photo.credit}
										<span>{photo.credit}</span>
									{/if}
								</figcaption>
							</figure>
						{:else}
							<div class="empty-state">No images connected to this event yet.</div>
						{/each}
					</div>
				</section>

				<div id="location-map">
					<EventMapPanel event={event} />
				</div>

				{#if isOwner}
					<section id="edit-plan" class="edit-section">
						<div class="section-heading">
							<p class="eyebrow">Organize</p>
							<h2>Edit plan</h2>
						</div>
						<EventForm event={event} action="?/update" submitLabel="Save changes" {form} inviteableUsers={data.inviteableUsers} />
					</section>
				{/if}
			</div>

			<aside class="secondary-column">
				{#if canSaveMemory}
					<MemoryForm {event} {form} />
				{:else if isInvitedViewer}
					<section class="after-panel">
						<p class="eyebrow">After the event</p>
						<h2>Journey memory</h2>
						<p class="muted">
							Accept the invitation and wait until the event is completed before adding your personal journey memory.
						</p>
					</section>
				{/if}

				<section id="share-preview" class="share-section">
					<div class="section-heading">
						<p class="eyebrow">Preview</p>
						<h2>Share story</h2>
					</div>
					<SharePreview {event} />
				</section>
			</aside>
		</section>
	</section>
</main>

<style>
	.event-screen {
		min-height: 100vh;
		display: grid;
		grid-template-columns: 240px minmax(0, 1fr);
		background: #fffaf4;
		color: #262321;
	}

	.event-sidebar {
		position: sticky;
		top: 0;
		height: 100vh;
		display: grid;
		grid-template-rows: auto 1fr auto;
		gap: 28px;
		border-right: 1px solid #e5d7c8;
		background: rgba(255, 255, 255, 0.94);
		padding: 42px 28px;
	}

	.side-brand {
		display: grid;
		gap: 2px;
		font-weight: 900;
		color: #2d2927;
	}

	.side-brand b {
		color: var(--coral);
	}

	.side-brand small {
		color: #8b8279;
		font-size: 0.78rem;
	}

	.event-sidebar nav {
		display: grid;
		align-content: start;
		gap: 12px;
	}

	.event-sidebar nav a,
	.danger-link {
		width: 100%;
		border: 0;
		border-radius: 999px;
		background: transparent;
		color: #514c48;
		font-weight: 850;
		text-align: left;
		padding: 12px 16px;
	}

	.event-sidebar nav a.active {
		background: #eadcf8;
		color: #463460;
	}

	.event-sidebar nav a:hover,
	.danger-link:hover {
		background: #f3eee9;
	}

	.event-sidebar nav a.muted-link {
		color: #a7a09a;
		background: #f0eeee;
	}

	.danger-link {
		color: #b42318;
	}

	.event-detail {
		min-width: 0;
		padding: 28px;
	}

	.photo-hero {
		position: relative;
		min-height: min(52vw, 470px);
		overflow: hidden;
		border-radius: 8px 8px 0 0;
		background: linear-gradient(135deg, var(--accent), var(--brand));
	}

	.photo-hero img,
	.cover-fallback {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: grid;
		place-items: center;
		color: white;
		font-weight: 900;
		font-size: 2rem;
	}

	.photo-hero::after {
		content: "";
		position: absolute;
		inset: 0;
		background:
			linear-gradient(180deg, rgba(28, 21, 17, 0.05) 20%, rgba(28, 21, 17, 0.58) 100%),
			linear-gradient(90deg, rgba(28, 21, 17, 0.38), transparent 56%);
	}

	.hero-actions {
		position: absolute;
		top: 24px;
		left: 28px;
		z-index: 2;
		display: flex;
		gap: 10px;
	}

	.hero-actions a,
	.close-button {
		min-height: 42px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 999px;
		background: rgba(72, 56, 75, 0.7);
		color: white;
		font-weight: 800;
		padding: 0 18px;
		backdrop-filter: blur(10px);
	}

	.close-button {
		position: absolute;
		top: 24px;
		right: 24px;
		z-index: 2;
		width: 46px;
		padding: 0;
		background: rgba(55, 55, 55, 0.72);
	}

	.hero-copy {
		position: absolute;
		left: 28px;
		right: 28px;
		bottom: 28px;
		z-index: 2;
		max-width: 760px;
		color: white;
	}

	.hero-copy h1 {
		margin: 10px 0 8px;
		color: white;
		font-size: clamp(2.1rem, 5vw, 4.2rem);
		text-shadow: 0 3px 22px rgba(0, 0, 0, 0.28);
	}

	.hero-copy p {
		margin: 3px 0;
		font-size: clamp(1.08rem, 2vw, 1.55rem);
		font-weight: 700;
		text-shadow: 0 2px 14px rgba(0, 0, 0, 0.24);
	}

	.hero-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.image-credit {
		position: absolute;
		right: 16px;
		bottom: 12px;
		z-index: 2;
		margin: 0;
		color: rgba(255, 255, 255, 0.78);
		font-size: 0.75rem;
	}

	.content-shell {
		display: grid;
		grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.55fr);
		gap: 24px;
		background: #fff;
		padding: 28px;
		border-radius: 0 0 8px 8px;
		box-shadow: var(--shadow);
	}

	.primary-column,
	.secondary-column {
		display: grid;
		align-content: start;
		gap: 24px;
	}

	.info-panel,
	.invitation-panel,
	.photo-panel,
	.after-panel,
	.share-section,
	.edit-section {
		border: 1px solid #e5d7c8;
		border-radius: 8px;
		background: #fffdf9;
		padding: 22px;
	}

	.lead-text {
		color: #51453d;
		line-height: 1.7;
		font-size: 1.04rem;
	}

	.detail-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 12px;
		margin-top: 18px;
	}

	.detail-grid div {
		border-radius: 8px;
		background: #fff5e7;
		padding: 13px;
	}

	.detail-grid span,
	.friend-strip > span {
		display: block;
		color: var(--muted);
		font-size: 0.82rem;
		font-weight: 850;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.detail-grid strong {
		display: block;
		margin-top: 5px;
		color: #2d2927;
	}

	.friend-strip {
		display: grid;
		gap: 10px;
		margin-top: 18px;
	}

	.friend-strip div {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.friend-strip strong {
		border-radius: 999px;
		background: #eadcf8;
		color: #463460;
		padding: 8px 12px;
	}

	.photo-panel {
		display: grid;
		gap: 16px;
	}

	.photo-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 14px;
	}

	.photo-grid figure {
		position: relative;
		min-height: 190px;
		margin: 0;
		border-radius: 8px;
		overflow: hidden;
		background: #f2e7dc;
	}

	.photo-grid figure:first-child {
		grid-column: span 2;
	}

	.photo-grid figure:first-child:nth-last-child(1) {
		grid-column: 1 / -1;
		min-height: 280px;
	}

	.photo-grid img {
		width: 100%;
		height: 100%;
		min-height: 190px;
		object-fit: cover;
	}

	.photo-grid figcaption {
		position: absolute;
		left: 10px;
		right: 10px;
		bottom: 10px;
		display: grid;
		gap: 2px;
		border-radius: 8px;
		background: rgba(34, 27, 23, 0.66);
		color: white;
		padding: 9px;
		backdrop-filter: blur(8px);
	}

	.photo-grid figcaption span {
		font-size: 0.76rem;
		color: rgba(255, 255, 255, 0.76);
	}

	.status.invited {
		background: #fff0dc;
		border-color: #f4c28e;
		color: #a94724;
	}

	.reminder-badge {
		display: inline-flex;
		align-items: center;
		border: 1px solid #b7dff0;
		border-radius: 999px;
		background: #eaf6fb;
		color: #176b91;
		font-size: 0.8rem;
		font-weight: 900;
		padding: 5px 10px;
	}

	.series-badge {
		display: inline-flex;
		align-items: center;
		border: 1px solid #b8dfad;
		border-radius: 999px;
		background: #eef6e8;
		color: #3c6f35;
		font-size: 0.8rem;
		font-weight: 900;
		padding: 5px 10px;
	}

	.invitation-panel {
		background: #fff7ec;
	}

	.invitation-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 14px;
	}

	.invitation-actions form {
		margin: 0;
	}

	.section-heading h2,
	.section-heading p,
	.after-panel h2,
	.after-panel p {
		margin-bottom: 8px;
	}

	@media (max-width: 1080px) {
		.event-screen {
			grid-template-columns: 1fr;
		}

		.event-sidebar {
			position: relative;
			height: auto;
			grid-template-columns: auto 1fr auto;
			grid-template-rows: auto;
			align-items: center;
			padding: 16px;
		}

		.event-sidebar nav {
			display: flex;
			flex-wrap: wrap;
			gap: 8px;
		}

		.event-sidebar nav a,
		.danger-link {
			width: auto;
			padding: 9px 12px;
		}

		.content-shell {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 760px) {
		.event-detail {
			padding: 12px;
		}

		.event-sidebar {
			display: grid;
			gap: 12px;
		}

		.photo-hero {
			min-height: 420px;
		}

		.hero-actions {
			left: 14px;
			top: 14px;
		}

		.close-button {
			right: 14px;
			top: 14px;
		}

		.hero-copy {
			left: 18px;
			right: 18px;
			bottom: 22px;
		}

		.content-shell {
			padding: 16px;
		}

		.detail-grid,
		.photo-grid {
			grid-template-columns: 1fr;
		}

		.photo-grid figure:first-child {
			grid-column: auto;
		}
	}
</style>
