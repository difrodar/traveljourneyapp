<script>
	import { onMount } from "svelte";
	import "leaflet/dist/leaflet.css";
	import PlaceholderIcon from "$lib/components/PlaceholderIcon.svelte";
	import { MAP_TILE_URL, MAP_TILE_MAX_ZOOM, MAP_TILE_ATTRIBUTION } from "$lib/constants.js";

	let { event } = $props();
	let mapEl = $state();
	let failed = $state(false);
	const location = $derived(event?.location || {});
	const coordinates = $derived(location.coordinates);
	const mapHref = $derived(`/map?event=${event.id}#location-${location.id}`);

	onMount(() => {
		if (!coordinates) return;

		let map;
		import("leaflet")
			.then(({ default: L }) => {
				map = L.map(mapEl, {
					scrollWheelZoom: false,
					zoomControl: true
				}).setView([coordinates.lat, coordinates.lng], 13);

				L.tileLayer(MAP_TILE_URL, {
					maxZoom: MAP_TILE_MAX_ZOOM,
					attribution: MAP_TILE_ATTRIBUTION
				}).addTo(map);

				const icon = L.divIcon({
					html: "<span>1</span>",
					className: "triptales-pin active",
					iconSize: [38, 38],
					iconAnchor: [19, 19],
					popupAnchor: [0, -18]
				});
				L.marker([coordinates.lat, coordinates.lng], { icon, title: location.name })
					.addTo(map)
					.bindPopup(`<strong>${location.name}</strong><br>${location.city}, ${location.country}`);
			})
			.catch(() => {
				failed = true;
			});

		return () => map?.remove();
	});
</script>

<section class="panel event-map-panel">
	<div class="map-heading">
		<div>
			<p class="eyebrow">Location</p>
			<h2>{location.name}</h2>
			<p class="muted">{location.address || "Address not added yet"} · {location.city}, {location.country}</p>
		</div>
		<a class="ghost-button" href={mapHref}>View on map</a>
	</div>

	{#if !failed && coordinates}
		<div class="mini-map" bind:this={mapEl}></div>
	{:else}
		<div class="map-fallback">
			{#if location.media?.images?.[0]?.url}
				<img src={location.media.images[0].url} alt={location.media.images[0].alt || location.name} />
			{:else}
				<div class="map-fallback-icon" aria-hidden="true">
					<PlaceholderIcon size={56} />
				</div>
			{/if}
			<div>
				<strong>{location.name}</strong>
				<span>{location.coordinates?.lat || "No latitude"} / {location.coordinates?.lng || "No longitude"}</span>
			</div>
		</div>
	{/if}
</section>

<style>
	.event-map-panel {
		display: grid;
		gap: 14px;
		margin-bottom: 24px;
	}

	.map-heading {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 14px;
	}

	.map-heading h2,
	.map-heading p {
		margin-bottom: 6px;
	}

	.mini-map,
	.map-fallback {
		min-height: 260px;
		border-radius: 8px;
		overflow: hidden;
		border: 1px solid var(--line);
		background: linear-gradient(135deg, var(--accent), var(--brand));
	}

	.mini-map {
		/* Contain Leaflet's high-z panes/controls so the map stays under the sticky nav on scroll. */
		position: relative;
		z-index: 0;
	}

	.map-fallback {
		position: relative;
		display: grid;
		align-items: end;
		color: white;
	}

	.map-fallback-icon {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		color: rgba(255, 255, 255, 0.65);
		pointer-events: none;
	}

	.map-fallback img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.map-fallback::after {
		content: "";
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(56, 34, 22, 0.05), rgba(56, 34, 22, 0.68));
	}

	.map-fallback > div {
		position: relative;
		z-index: 1;
		display: grid;
		gap: 5px;
		padding: 16px;
	}

	.map-fallback span {
		font-weight: 700;
	}

	:global(.triptales-pin) {
		width: 38px !important;
		height: 38px !important;
		margin-left: 0 !important;
		margin-top: 0 !important;
		border-radius: 999px;
		background: var(--brand);
		color: white;
		display: grid;
		place-items: center;
		font-weight: 900;
		border: 3px solid white;
		box-shadow: 0 9px 24px rgba(15, 118, 110, 0.32);
	}

	:global(.triptales-pin span) {
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
	}

	:global(.triptales-pin.active) {
		background: var(--coral);
		box-shadow: 0 12px 30px rgba(231, 95, 67, 0.38);
	}

	@media (max-width: 620px) {
		.map-heading {
			display: grid;
		}
	}
</style>
