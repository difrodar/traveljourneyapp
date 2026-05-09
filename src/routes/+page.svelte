<script>
	import JourneyCard from "$lib/components/JourneyCard.svelte";

	let { data } = $props();
	const calendar = $derived(data.calendar);
</script>

<main class="page-shell dashboard-page">
	<header class="planner-header">
		<div>
			<p class="eyebrow">Dashboard planner</p>
			<h1>{calendar.monthLabel || "Your travel calendar"}</h1>
			<p class="lead">Plan the month, spot busy days and jump straight into the event details that matter next.</p>
		</div>
		<div class="planner-actions">
			<a class="ghost-button" href="/events">All events</a>
			<a class="button" href="/events/new">Create event</a>
		</div>
	</header>

	{#if data.setupError}
		<div class="message error">{data.setupError}</div>
	{/if}

	{#if data.pendingInvitationCount > 0}
		<a class="invite-strip" href={data.pendingInvitationLink}>
			You have {data.pendingInvitationCount} pending invitation{data.pendingInvitationCount === 1 ? "" : "s"} →
		</a>
	{/if}

	<section class="panel calendar-panel" aria-label="Monthly event calendar">
		<div class="calendar-toolbar">
			<a class="month-button" href="/?month={calendar.previousMonthParam}" aria-label="Previous month">Prev</a>
			<div>
				<p class="eyebrow">Calendar</p>
				<h2>{calendar.monthLabel}</h2>
				{#if !calendar.isSelectedCurrentMonth}
					<a class="current-month-button" href="/?month={calendar.currentMonthParam}">Current month</a>
				{/if}
			</div>
			<a class="month-button" href="/?month={calendar.nextMonthParam}" aria-label="Next month">Next</a>
		</div>

		<div class="weekday-row" aria-hidden="true">
			{#each calendar.weekdayLabels as weekday}
				<span>{weekday}</span>
			{/each}
		</div>

		<div class="month-grid">
			{#each calendar.weeks as week}
				{#each week as day}
					<article class="calendar-day" class:outside={!day.isCurrentMonth} class:today={day.isToday}>
						<div class="day-heading">
							<span class="weekday-name">{day.weekdayLabel}</span>
							<strong>{day.dayNumber}</strong>
						</div>
						<div class="day-events">
							{#each day.events as event}
								<a class="calendar-event {event.status}" href="/events/{event.id}">
									<span class="event-time">{event.time || "All day"}</span>
									<strong>{event.title}</strong>
									<span class="event-meta">
										{event.invitationStatus || event.status}
										{#if event.location?.name}
											- {event.location.name}
										{/if}
									</span>
								</a>
							{:else}
								{#if day.isCurrentMonth}
									<span class="quiet-slot">No events</span>
								{/if}
							{/each}
						</div>
					</article>
				{/each}
			{/each}
		</div>

		{#if !calendar.hasMonthEvents}
			<div class="empty-state calendar-empty">
				No events are scheduled for {calendar.monthLabel}. Create a plan or browse another month.
			</div>
		{/if}
	</section>

	{#if data.eventsAwaitingMemory.length > 0}
		<section class="memory-prompts">
			<div class="page-header slim">
				<div>
					<p class="eyebrow">Close the loop</p>
					<h2>Add memories</h2>
					<p class="muted">Past events still waiting for a memory — pick one to write a quick reflection.</p>
				</div>
			</div>
			<div class="grid three">
				{#each data.eventsAwaitingMemory as event}
					<a class="card memory-prompt-card" href="/events/{event.id}#after-event-panel">
						<span class="category">{event.category}</span>
						<strong>{event.title}</strong>
						<span class="prompt-meta">
							{event.date}{event.location?.city ? ` · ${event.location.city}` : ""}
						</span>
						{#if event.status !== "completed"}
							<span class="status-badge">Not marked attended</span>
						{/if}
						<small class="prompt-cta">Add memory →</small>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	<section class="grid two dashboard-sections">
		<div>
			<div class="page-header slim">
				<div>
					<p class="eyebrow">Reminder</p>
					<h2>Upcoming soon</h2>
				</div>
				<a class="ghost-button" href="/events">View all</a>
			</div>
			<div class="reminder-list">
				{#each data.upcomingSoonEvents as event}
					<a class="reminder-row" href="/events/{event.id}">
						<span class="reminder-date">{event.reminder.label}</span>
						<span class="reminder-content">
							<strong>{event.title}</strong>
							<small>
								{event.date} at {event.time}
								{#if event.location?.name}
									- {event.location.name}
								{/if}
							</small>
						</span>
						<span class="reminder-badge">{event.reminder.badge}</span>
					</a>
				{:else}
					<div class="empty-state">No planned events need attention in the next 7 days.</div>
				{/each}
			</div>
		</div>
		<div>
			<div class="page-header slim">
				<div>
					<p class="eyebrow">Memory lane</p>
					<h2>Journey highlights</h2>
				</div>
				<a class="ghost-button" href="/journey">Timeline</a>
			</div>
			<div class="grid">
				{#each data.journeyHighlights as event}
					<JourneyCard {event} />
				{:else}
					<div class="empty-state">Completed events with saved memories will appear here after your first adventure.</div>
				{/each}
			</div>
		</div>
	</section>
</main>

<style>
	.dashboard-page {
		display: grid;
		gap: 22px;
	}

	.invite-strip {
		display: block;
		padding: 12px 16px;
		border-radius: 8px;
		background: linear-gradient(135deg, var(--coral), var(--accent));
		color: white;
		font-weight: 800;
		text-decoration: none;
		box-shadow: var(--shadow);
	}

	.invite-strip:hover,
	.invite-strip:focus-visible {
		filter: brightness(1.05);
	}

	.planner-header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 18px;
		border-bottom: 1px solid var(--line);
		padding-bottom: 18px;
	}

	.planner-header h1 {
		margin-bottom: 10px;
	}

	.planner-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 10px;
	}

	.calendar-panel {
		display: grid;
		gap: 14px;
	}

	.calendar-toolbar {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 14px;
	}

	.calendar-toolbar div {
		text-align: center;
	}

	.calendar-toolbar h2,
	.calendar-toolbar p {
		margin-bottom: 0;
	}

	.current-month-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 34px;
		margin-top: 10px;
		border: 1px solid #b7dff0;
		border-radius: 8px;
		background: #eaf6fb;
		color: #176b91;
		font-size: 0.86rem;
		font-weight: 900;
		padding: 0 12px;
	}

	.current-month-button:hover {
		border-color: #8ec8e0;
		background: #dff1f8;
	}

	.month-button {
		min-height: 42px;
		border: 1px solid var(--line);
		border-radius: 8px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: #fff7ec;
		color: var(--ink);
		font-weight: 900;
		padding: 0 14px;
	}

	.month-button:hover {
		border-color: #e9b77e;
		background: #fff1dc;
	}

	.weekday-row,
	.month-grid {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 8px;
	}

	.weekday-row span {
		color: var(--muted);
		font-size: 0.78rem;
		font-weight: 900;
		text-align: center;
		text-transform: uppercase;
	}

	.month-grid {
		align-items: stretch;
	}

	.calendar-day {
		min-height: 154px;
		border: 1px solid var(--line);
		border-radius: 8px;
		background: #fffdf8;
		display: grid;
		align-content: start;
		gap: 8px;
		padding: 10px;
		overflow: hidden;
	}

	.calendar-day.outside {
		background: rgba(255, 247, 236, 0.52);
		color: #aa927e;
	}

	.calendar-day.today {
		border-color: var(--coral);
		box-shadow: inset 0 0 0 2px rgba(231, 95, 67, 0.16);
	}

	.day-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.weekday-name {
		display: none;
		color: var(--muted);
		font-size: 0.82rem;
		font-weight: 900;
		text-transform: uppercase;
	}

	.day-heading strong {
		display: grid;
		place-items: center;
		min-width: 30px;
		height: 30px;
		border-radius: 999px;
		background: #fff0dc;
		color: #8a4a12;
	}

	.today .day-heading strong {
		background: var(--coral);
		color: white;
	}

	.day-events {
		display: grid;
		gap: 6px;
		min-width: 0;
	}

	.calendar-event {
		display: grid;
		gap: 2px;
		border-left: 4px solid var(--sky);
		border-radius: 8px;
		background: #eaf6fb;
		padding: 7px;
		min-width: 0;
	}

	.calendar-event.completed {
		border-left-color: var(--palm);
		background: #edf8e9;
	}

	.calendar-event strong,
	.calendar-event span {
		overflow-wrap: anywhere;
	}

	.calendar-event strong {
		color: #253044;
		font-size: 0.88rem;
		line-height: 1.2;
	}

	.event-time,
	.event-meta,
	.quiet-slot {
		color: var(--muted);
		font-size: 0.75rem;
		font-weight: 800;
	}

	.event-meta {
		text-transform: capitalize;
	}

	.quiet-slot {
		opacity: 0.68;
	}

	.calendar-empty {
		margin-top: 2px;
	}

	.dashboard-sections {
		margin-top: 0;
	}

	.memory-prompt-card {
		display: grid;
		gap: 6px;
		padding: 16px;
		min-height: 130px;
		align-content: start;
		text-decoration: none;
		color: inherit;
	}

	.memory-prompt-card .category {
		display: inline-block;
		width: fit-content;
		border-radius: 999px;
		background: #fff0dc;
		color: #8a4a12;
		font-size: 0.74rem;
		font-weight: 900;
		text-transform: uppercase;
		padding: 3px 10px;
	}

	.memory-prompt-card strong {
		color: #253044;
		font-size: 1.02rem;
		line-height: 1.25;
		overflow-wrap: anywhere;
	}

	.memory-prompt-card .prompt-meta {
		color: var(--muted);
		font-size: 0.84rem;
		font-weight: 700;
	}

	.memory-prompt-card .status-badge {
		width: fit-content;
		border-radius: 999px;
		background: #fde7d6;
		color: #a94724;
		font-size: 0.72rem;
		font-weight: 900;
		text-transform: uppercase;
		padding: 3px 10px;
	}

	.memory-prompt-card .prompt-cta {
		margin-top: auto;
		color: var(--accent);
		font-weight: 900;
	}

	.slim {
		margin-bottom: 12px;
	}

	.reminder-list {
		display: grid;
		gap: 10px;
	}

	.reminder-row {
		display: grid;
		grid-template-columns: minmax(88px, auto) minmax(0, 1fr) auto;
		align-items: center;
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

	.reminder-row:hover {
		transform: translateY(-1px);
		border-color: #e9b77e;
		background: #fff1dc;
	}

	.reminder-date,
	.reminder-badge {
		border-radius: 8px;
		background: #eaf6fb;
		color: #176b91;
		font-size: 0.82rem;
		font-weight: 900;
		padding: 8px 10px;
		text-align: center;
	}

	.reminder-content {
		display: grid;
		gap: 3px;
		min-width: 0;
	}

	.reminder-content strong,
	.reminder-content small {
		overflow-wrap: anywhere;
	}

	.reminder-content strong {
		font-weight: 900;
	}

	.reminder-content small {
		color: var(--muted);
		font-weight: 700;
	}

	.reminder-badge {
		background: #fff0dc;
		color: #a94724;
	}

	@media (max-width: 900px) {
		.planner-header {
			align-items: flex-start;
			flex-direction: column;
		}

		.planner-actions {
			justify-content: flex-start;
		}

		.weekday-row {
			display: none;
		}

		.month-grid {
			grid-template-columns: 1fr;
		}

		.calendar-day {
			min-height: auto;
		}

		.calendar-day.outside {
			display: none;
		}

		.weekday-name {
			display: inline;
		}

		.reminder-row {
			grid-template-columns: 1fr;
			align-items: start;
		}

		.reminder-date,
		.reminder-badge {
			width: fit-content;
			text-align: left;
		}
	}

	@media (max-width: 560px) {
		.calendar-toolbar {
			grid-template-columns: 1fr 1fr;
		}

		.calendar-toolbar div {
			grid-column: 1 / -1;
			grid-row: 1;
		}

		.month-button {
			grid-row: 2;
		}
	}
</style>
