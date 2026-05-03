<script>
	import GoogleMapView from "$lib/components/GoogleMapView.svelte";

	let { data } = $props();
</script>

<main class="page-shell">
	<header class="page-header">
		<div>
			<p class="eyebrow">Map</p>
			<h1>Places behind the plans</h1>
			<p class="lead">Stored locations appear on Google Maps when an API key is configured, otherwise as stable pinpoint cards.</p>
		</div>
	</header>

	{#if data.setupError}
		<div class="message error">{data.setupError}</div>
	{/if}

	<GoogleMapView locations={data.locations} apiKey={data.apiKey} mapId={data.mapId} />
</main>
