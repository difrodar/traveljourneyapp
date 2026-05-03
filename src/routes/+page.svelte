<script>
	import DashboardStats from "$lib/components/DashboardStats.svelte";
	import EventCard from "$lib/components/EventCard.svelte";
	import JourneyCard from "$lib/components/JourneyCard.svelte";

	let { data } = $props();
</script>

<main class="page-shell">
	<section class="hero">
		<div class="panel">
			<p class="eyebrow">TripTales</p>
			<h1>Plan the semester. Keep the memories.</h1>
			<p class="lead">
				A travel event planner and journey memory app for exchange students in San Diego.
				Plan events, invite friends, save places and turn experiences into a personal timeline.
			</p>
			<div class="toolbar">
				<a class="button" href="/events/new">Create event</a>
				<a class="ghost-button" href="/journey">Open journey</a>
			</div>
		</div>
		<div class="hero-visual">
			<div>
				<p class="eyebrow">San Diego</p>
				<h2>Beach days, tacos, road trips and the stories after.</h2>
			</div>
		</div>
	</section>

	{#if data.setupError}
		<div class="message error">{data.setupError}</div>
	{/if}

	<DashboardStats stats={data.stats} />

	<section class="grid two dashboard-sections">
		<div>
			<div class="page-header slim">
				<div>
					<p class="eyebrow">Next up</p>
					<h2>Upcoming events</h2>
				</div>
				<a class="ghost-button" href="/events">View all</a>
			</div>
			<div class="grid">
				{#each data.upcomingEvents as event}
					<EventCard {event} compact />
				{:else}
					<div class="empty-state">No upcoming events yet. Create the first plan for San Diego.</div>
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
					<div class="empty-state">Completed events with memories will appear here.</div>
				{/each}
			</div>
		</div>
	</section>
</main>

<style>
	.dashboard-sections {
		margin-top: 22px;
	}

	.slim {
		margin-bottom: 12px;
	}
</style>
