<script>
	import LeafletMapView from "$lib/components/LeafletMapView.svelte";

	let { data } = $props();
</script>

<main class="page-shell">
	<header class="page-header">
		<div>
			<p class="eyebrow">Map</p>
			<h1>World map of your plans</h1>
			<p class="lead">Browse the journey on an OpenStreetMap view by country, city and concrete place.</p>
		</div>
	</header>

	{#if data.setupError}
		<div class="message error">{data.setupError}</div>
	{/if}

	<LeafletMapView locations={data.locations} highlightedEventId={data.highlightedEventId} />
</main>
