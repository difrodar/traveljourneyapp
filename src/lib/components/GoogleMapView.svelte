<script>
	import { onMount } from "svelte";
	import LocationPinGrid from "./LocationPinGrid.svelte";

	let { locations = [], apiKey = "", mapId = "" } = $props();
	let mapEl = $state();
	let failed = $state(false);

	onMount(() => {
		if (!apiKey || locations.length === 0) return;
		const existing = document.querySelector("script[data-triptales-map]");
		const load = existing
			? Promise.resolve()
			: new Promise((resolve, reject) => {
					const script = document.createElement("script");
					script.dataset.triptalesMap = "true";
					script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=marker`;
					script.async = true;
					script.onload = resolve;
					script.onerror = reject;
					document.head.appendChild(script);
				});

		load.then(() => {
			const first = locations[0].coordinates || { lat: 32.7157, lng: -117.1611 };
			const map = new google.maps.Map(mapEl, {
				center: first,
				zoom: 11,
				mapId: mapId || undefined,
				disableDefaultUI: true,
				zoomControl: true
			});
			for (const location of locations) {
				if (!location.coordinates) continue;
				const content = document.createElement("div");
				content.className = "map-marker";
				content.textContent = location.events.length || "•";
				if (google.maps.marker?.AdvancedMarkerElement) {
					new google.maps.marker.AdvancedMarkerElement({
						map,
						position: location.coordinates,
						title: location.name,
						content
					});
				}
			}
		}).catch(() => {
			failed = true;
		});
	});
</script>

{#if !apiKey || failed}
	<div class="message">Google Maps is not configured yet, so TripTales shows the stable pinpoint fallback.</div>
	<LocationPinGrid {locations} />
{:else}
	<div class="map" bind:this={mapEl}></div>
{/if}

<style>
	.map {
		width: 100%;
		height: min(68vh, 620px);
		min-height: 430px;
		border-radius: 8px;
		border: 1px solid var(--line);
		box-shadow: var(--shadow);
		overflow: hidden;
	}

	:global(.map-marker) {
		width: 34px;
		height: 34px;
		border-radius: 999px;
		background: #0f766e;
		color: white;
		display: grid;
		place-items: center;
		font-weight: 900;
		box-shadow: 0 8px 24px rgba(15, 118, 110, 0.35);
	}
</style>
