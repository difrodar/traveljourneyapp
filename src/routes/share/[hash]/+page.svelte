<script>
	import PlaceholderIcon from "$lib/components/PlaceholderIcon.svelte";

	let { data } = $props();
	const journey = $derived(data.journey);
</script>

<svelte:head>
	<title>{journey.tripName ? `Shared trip — ${journey.tripName}` : "Shared TripTales journey"}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="page-shell share-shell">
	<header class="page-header">
		<div>
			<p class="eyebrow">
				{#if journey.scope === "trip"}
					Shared TripTales trip
				{:else}
					Shared TripTales journey
				{/if}
			</p>
			<h1>{journey.tripName || "A read-only travel diary"}</h1>
			<p class="lead">
				Someone shared their TripTales {journey.scope === "trip" ? "trip" : "memories"} with you. Photos, places and notes
				are visible to anyone with this link. Want your own diary? <a href="/login">Open TripTales</a>.
			</p>
		</div>
	</header>

	<section class="share-stats" aria-label="Journey statistics">
		<div>
			<span>Total memories</span>
			<strong>{journey.stats.totalMemories}</strong>
		</div>
		<div>
			<span>Favorite category</span>
			<strong>{journey.stats.favoriteCategory}</strong>
		</div>
		<div>
			<span>Most visited city</span>
			<strong>{journey.stats.mostVisitedCity}</strong>
		</div>
		<div>
			<span>Countries visited</span>
			<strong>{journey.stats.countriesVisited}</strong>
		</div>
	</section>

	<section class="share-timeline">
		{#each journey.groups as group}
			<section class="month-group">
				<div class="month-heading">
					<p>{group.label}</p>
					<span>{group.memoryCount} memor{group.memoryCount === 1 ? "y" : "ies"}</span>
				</div>
				<div class="month-entries">
					{#each group.entries as event}
						{@const heroImage = event.journeyEntry?.images?.[0] || event.media?.images?.[0] || null}
						{@const galleryImages = [...(event.journeyEntry?.images || []), ...(event.media?.images || [])]}
						<article class="share-card">
							<div class="cover">
								{#if heroImage?.url}
									<img src={heroImage.url} alt={heroImage.alt || event.title} loading="lazy" />
								{:else}
									<div class="cover-placeholder">
										<PlaceholderIcon size={32} />
										<span>{event.category}</span>
									</div>
								{/if}
							</div>
							<div class="body">
								<div class="meta-row">
									<span class="category">{event.category}</span>
									<span>{event.date}</span>
									{#if event.location?.city || event.location?.name}
										<span>{event.location?.city || event.location?.name}{event.location?.country ? `, ${event.location.country}` : ""}</span>
									{/if}
								</div>
								<h3>{event.title}</h3>
								{#if event.journeyEntry?.memoryText}
									<p class="memory">{event.journeyEntry.memoryText}</p>
								{/if}
								{#if galleryImages.length > 1}
									<div class="gallery">
										{#each galleryImages.slice(1) as img}
											<figure>
												<img src={img.url} alt={img.alt || event.title} loading="lazy" />
											</figure>
										{/each}
									</div>
								{/if}
								{#if event.media?.images?.[0]?.credit}
									<p class="credit">
										{event.media.images[0].credit}{event.media.images[0].license ? ` — ${event.media.images[0].license}` : ""}
									</p>
								{/if}
							</div>
						</article>
					{/each}
				</div>
			</section>
		{:else}
			<div class="empty-state">This journey doesn't have any memories yet.</div>
		{/each}
	</section>

	<footer class="share-footer">
		<small>This is a public, read-only TripTales link. The owner can revoke it at any time.</small>
	</footer>
</main>

<style>
	.share-shell {
		display: grid;
		gap: 24px;
	}

	.share-stats {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 12px;
	}

	.share-stats div {
		border: 1px solid var(--line);
		border-radius: 8px;
		padding: 14px;
		background: var(--empty-bg);
		box-shadow: var(--shadow-soft);
	}

	.share-stats span {
		color: var(--muted);
		font-size: 0.82rem;
		font-weight: 800;
	}

	.share-stats strong {
		display: block;
		margin-top: 6px;
		color: var(--brand-dark);
		font-size: 1.4rem;
		line-height: 1.1;
	}

	.share-timeline {
		display: grid;
		gap: 24px;
	}

	.month-group {
		display: grid;
		gap: 12px;
	}

	.month-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		border-bottom: 1px solid var(--line);
		padding-bottom: 8px;
	}

	.month-heading p {
		margin: 0;
		color: var(--brand-dark);
		font-size: 1.08rem;
		font-weight: 900;
	}

	.month-heading span {
		color: var(--muted);
		font-size: 0.82rem;
		font-weight: 800;
	}

	.month-entries {
		display: grid;
		gap: 16px;
	}

	.share-card {
		display: grid;
		grid-template-columns: 220px 1fr;
		gap: 18px;
		border: 1px solid var(--line);
		border-radius: 10px;
		background: var(--panel);
		padding: 16px;
		box-shadow: var(--shadow-soft);
	}

	.cover {
		min-height: 160px;
		border-radius: 8px;
		overflow: hidden;
		display: grid;
		place-items: center;
		background: linear-gradient(135deg, var(--brand), var(--sky));
		color: white;
	}

	.cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.cover-placeholder {
		display: grid;
		place-items: center;
		gap: 6px;
	}

	.body {
		display: grid;
		gap: 8px;
		align-content: start;
	}

	.meta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		color: var(--muted);
		font-weight: 800;
		font-size: 0.82rem;
	}

	.category {
		background: var(--category-bg);
		color: var(--brand-dark);
		border-radius: 999px;
		padding: 3px 10px;
	}

	.share-card h3 {
		margin: 4px 0 2px;
		color: var(--ink-strong);
	}

	.memory {
		margin: 0;
		line-height: 1.5;
	}

	.gallery {
		display: flex;
		gap: 8px;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		padding-bottom: 4px;
	}

	.gallery figure {
		flex: 0 0 min(60%, 220px);
		scroll-snap-align: start;
		margin: 0;
		border-radius: 6px;
		overflow: hidden;
	}

	.gallery img {
		width: 100%;
		height: 140px;
		object-fit: cover;
		display: block;
	}

	.credit {
		margin: 0;
		color: var(--muted);
		font-size: 0.78rem;
		font-weight: 700;
	}

	.share-footer {
		display: flex;
		justify-content: center;
		padding: 16px 0 24px;
		color: var(--muted);
	}

	@media (max-width: 720px) {
		.share-stats {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.share-card {
			grid-template-columns: 1fr;
		}
	}
</style>
