<script>
	import { onMount } from "svelte";
	import "leaflet/dist/leaflet.css";
	import "leaflet.markercluster/dist/MarkerCluster.css";
	import "leaflet.markercluster/dist/MarkerCluster.Default.css";
	import LocationPinGrid from "./LocationPinGrid.svelte";
	import { MAP_TILE_URL, MAP_TILE_MAX_ZOOM, MAP_TILE_ATTRIBUTION } from "$lib/constants.js";

	let { locations = [], highlightedEventId = "", defaultWorldView = false } = $props();
	let mapEl = $state();
	let failed = $state(false);
	const highlightedLocationId = $derived(
		locations.find((location) => location.events?.some((event) => event.id === highlightedEventId))?.id || ""
	);

	function escapeHtml(value) {
		return String(value || "")
			.replaceAll("&", "&amp;")
			.replaceAll("<", "&lt;")
			.replaceAll(">", "&gt;")
			.replaceAll('"', "&quot;");
	}

	function categoryClass(location) {
		const category = location.events?.[0]?.category || location.backgroundType || "default";
		return String(category).toLowerCase().replaceAll(" ", "-");
	}

	function focusLocation(location) {
		const target = document.querySelector(`[data-location-id="${location.id}"]`);
		if (!target) return;
		target.scrollIntoView({ behavior: "smooth", block: "center" });
		target.classList.add("pulse");
		window.setTimeout(() => target.classList.remove("pulse"), 1100);
	}

	function popupHtml(location) {
		const events = (location.events || [])
			.map(
				(event) => `
					<a href="/events/${event.id}">
						<strong>${escapeHtml(event.title)}</strong>
						<small>${escapeHtml(event.status)}</small>
						<span>${escapeHtml(event.date)} · ${escapeHtml(event.category)}</span>
					</a>
				`
			)
			.join("");
		const count = location.events?.length || 0;

		return `
			<div class="leaflet-popup-card">
				<strong>${escapeHtml(location.name)}</strong>
				<span>${escapeHtml(location.city)}, ${escapeHtml(location.country)}</span>
				<em>${count} event${count === 1 ? "" : "s"} at this place</em>
				<div>${events}</div>
			</div>
		`;
	}

	onMount(() => {
		if (locations.length === 0) return;

		let map;
		Promise.all([import("leaflet"), import("leaflet.markercluster")])
			.then(([{ default: L }]) => {
				const highlightedLocation = locations.find((location) => location.id === highlightedLocationId && location.coordinates);
				const mappedLocations = locations.filter((location) => location.coordinates);
				if (mappedLocations.length === 0) {
					failed = true;
					return;
				}
				const bounds = mappedLocations.map((location) => [location.coordinates.lat, location.coordinates.lng]);

				map = L.map(mapEl, { scrollWheelZoom: false, worldCopyJump: true });

				if (highlightedLocation) {
					map.setView([highlightedLocation.coordinates.lat, highlightedLocation.coordinates.lng], 12);
				} else if (defaultWorldView) {
					map.setView([20, 0], 2);
				} else if (bounds.length > 1) {
					map.fitBounds(bounds, { padding: [36, 36] });
				} else {
					map.setView(bounds[0], 12);
				}

				L.tileLayer(MAP_TILE_URL, {
					maxZoom: MAP_TILE_MAX_ZOOM,
					attribution: MAP_TILE_ATTRIBUTION
				}).addTo(map);

				const clusters = L.markerClusterGroup({
					showCoverageOnHover: false,
					spiderfyOnMaxZoom: true,
					zoomToBoundsOnClick: true,
					iconCreateFunction: (cluster) => {
						const count = cluster.getChildCount();
						return L.divIcon({
							html: `<span>${count}</span>`,
							className: "triptales-cluster",
							iconSize: [44, 44],
							iconAnchor: [22, 22]
						});
					}
				});

				for (const location of mappedLocations) {
					const active = location.id === highlightedLocationId;
					const icon = L.divIcon({
						html: `<span>${location.events.length || 1}</span>`,
						className: `triptales-pin ${categoryClass(location)} ${active ? "active" : ""}`,
						iconSize: [38, 38],
						iconAnchor: [19, 19],
						popupAnchor: [0, -18]
					});
					const marker = L.marker([location.coordinates.lat, location.coordinates.lng], {
						icon,
						title: `${location.name}, ${location.city}`
					});
					marker.bindPopup(popupHtml(location), { maxWidth: 280 });
					marker.on("click", () => focusLocation(location));
					clusters.addLayer(marker);
				}
				map.addLayer(clusters);
			})
			.catch(() => {
				failed = true;
			});

		return () => map?.remove();
	});
</script>

{#if failed}
	<div class="message">The interactive map could not load, so TripTales shows the stable pinpoint fallback.</div>
{:else if locations.length > 0}
	<div class="map" bind:this={mapEl}></div>
{/if}

<LocationPinGrid {locations} {highlightedEventId} highlightedLocationId={highlightedLocationId} />

<style>
	.map {
		width: 100%;
		height: min(58vh, 560px);
		min-height: 380px;
		margin-bottom: 22px;
		border-radius: 8px;
		border: 1px solid var(--line);
		box-shadow: var(--shadow);
		overflow: hidden;
		background: #dceee9;
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

	:global(.triptales-pin.food) {
		background: var(--accent);
	}

	:global(.triptales-pin.party) {
		background: var(--rose);
	}

	:global(.triptales-pin.beach) {
		background: var(--sky);
	}

	:global(.triptales-pin.travel),
	:global(.triptales-pin.flight),
	:global(.triptales-pin.weekend-trip) {
		background: var(--coral);
	}

	:global(.triptales-pin.culture) {
		background: #8b5cf6;
	}

	:global(.triptales-pin.education),
	:global(.triptales-pin.study) {
		background: #2563eb;
	}

	:global(.triptales-pin.outdoor) {
		background: var(--palm);
	}

	:global(.triptales-pin.active) {
		transform: scale(1.14);
		box-shadow: 0 12px 30px rgba(231, 95, 67, 0.38);
	}

	:global(.triptales-cluster) {
		width: 44px !important;
		height: 44px !important;
		margin-left: 0 !important;
		margin-top: 0 !important;
		border-radius: 999px;
		background: var(--accent);
		color: white;
		display: grid;
		place-items: center;
		font-weight: 900;
		font-size: 0.95rem;
		border: 3px solid white;
		box-shadow: 0 10px 26px rgba(231, 95, 67, 0.36);
	}

	:global(.triptales-cluster span) {
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
	}

	:global(.leaflet-popup-card) {
		display: grid;
		gap: 7px;
		min-width: 220px;
		color: #33251d;
	}

	:global(.leaflet-popup-card > span) {
		color: #7b6253;
		font-weight: 700;
	}

	:global(.leaflet-popup-card em) {
		color: #a94724;
		font-size: 0.8rem;
		font-style: normal;
		font-weight: 800;
	}

	:global(.leaflet-popup-card div) {
		display: grid;
		gap: 6px;
	}

	:global(.leaflet-popup-card a) {
		display: grid;
		gap: 2px;
		border-radius: 8px;
		padding: 7px;
		background: #fff7ec;
	}

	:global(.leaflet-popup-card a span) {
		color: #7b6253;
		font-size: 0.8rem;
	}

	:global(.leaflet-popup-card a small) {
		color: var(--brand-dark);
		font-size: 0.76rem;
		font-weight: 900;
		text-transform: uppercase;
	}
</style>
