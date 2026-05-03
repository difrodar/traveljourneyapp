<script>
	import DashboardStats from "$lib/components/DashboardStats.svelte";
	import EventCard from "$lib/components/EventCard.svelte";
	import JourneyCard from "$lib/components/JourneyCard.svelte";
	import { categoryMedia } from "$lib/media.js";

	let { data } = $props();
	const heroEvent = $derived(data.upcomingEvents[0] || data.journeyHighlights[0]);
	const heroMedia = $derived(heroEvent?.media || categoryMedia.beach);
	const galleryItems = $derived([...data.upcomingEvents, ...data.journeyHighlights].slice(0, 5));
</script>

<main class="page-shell">
	<section class="hero">
		<div class="panel">
			<p class="eyebrow">TripTales</p>
			<h1>Plan the semester. Keep the memories.</h1>
			<p class="lead">
				A travel event planner and journey memory app for exchange students and travelers.
				Start in San Diego, then keep the timeline going wherever the semester takes you.
			</p>
			<div class="toolbar">
				<a class="button" href="/events/new">Create event</a>
				<a class="ghost-button" href="/journey">Open journey</a>
			</div>
			<div class="hero-tags" aria-label="TripTales themes">
				<span>Sunset plans</span>
				<span>Friend groups</span>
				<span>Journey notes</span>
			</div>
		</div>
		<div class="hero-visual">
			{#if heroMedia?.imageUrl}
				<img src={heroMedia.imageUrl} alt={heroMedia.imageAlt || "TripTales travel scene"} />
			{/if}
			<div class="hero-overlay">
				<p class="eyebrow">From San Diego to the world</p>
				<h2>{heroEvent?.title || "Beach days, tacos, road trips and the stories after."}</h2>
				{#if heroEvent?.location}
					<span>{heroEvent.location.name}, {heroEvent.location.country}</span>
				{/if}
			</div>
		</div>
	</section>

	{#if data.setupError}
		<div class="message error">{data.setupError}</div>
	{/if}

	<DashboardStats stats={data.stats} />

	<section class="journey-strip">
		<div class="strip-heading">
			<div>
				<p class="eyebrow">Around the journey</p>
				<h2>Visual moments across places</h2>
			</div>
			<a class="ghost-button" href="/map">Open world view</a>
		</div>
		<div class="strip-grid">
			{#each galleryItems as item}
				<a class="strip-card" href="/events/{item.id}">
					{#if item.media?.imageUrl}
						<img src={item.media.imageUrl} alt={item.media.imageAlt || item.title} />
					{/if}
					<span>{item.location?.city || item.location?.name}</span>
					<strong>{item.title}</strong>
				</a>
			{:else}
				<div class="empty-state">Create events and memories to fill the visual journey strip.</div>
			{/each}
		</div>
	</section>

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

	.hero-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 18px;
	}

	.hero-tags span {
		border: 1px solid #efc291;
		border-radius: 999px;
		padding: 7px 11px;
		background: #fff1dc;
		color: #7a3f1d;
		font-weight: 800;
		font-size: 0.86rem;
	}

	.hero-overlay {
		max-width: 86%;
	}

	.hero-overlay span {
		display: inline-flex;
		margin-top: 12px;
		border-radius: 999px;
		padding: 7px 11px;
		background: rgba(255, 247, 236, 0.92);
		color: #43291a;
		font-weight: 900;
	}

	.journey-strip {
		margin-top: 22px;
	}

	.strip-heading {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 12px;
	}

	.strip-grid {
		display: grid;
		grid-template-columns: 1.25fr repeat(4, minmax(0, 0.75fr));
		gap: 12px;
	}

	.strip-card {
		position: relative;
		min-height: 190px;
		border-radius: 8px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		padding: 14px;
		background: linear-gradient(135deg, var(--accent), var(--brand));
		color: white;
		box-shadow: var(--shadow-soft);
	}

	.strip-card:first-child {
		min-height: 230px;
	}

	.strip-card::after {
		content: "";
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(56, 34, 22, 0.04), rgba(56, 34, 22, 0.72));
		z-index: 1;
	}

	.strip-card img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.22s ease;
	}

	.strip-card:hover img {
		transform: scale(1.04);
	}

	.strip-card span,
	.strip-card strong {
		position: relative;
		z-index: 2;
	}

	.strip-card span {
		font-size: 0.78rem;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		opacity: 0.9;
	}

	.strip-card strong {
		margin-top: 4px;
		font-size: 1rem;
		line-height: 1.15;
	}

	@media (max-width: 900px) {
		.strip-heading {
			align-items: flex-start;
			flex-direction: column;
		}

		.strip-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 560px) {
		.strip-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
