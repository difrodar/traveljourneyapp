<script>
	import { cityLabel, searchCities } from "$lib/cities.js";

	let {
		cityValue = "",
		countryValue = "USA",
		latValue = "",
		lngValue = "",
		label = "City",
		help = "Start typing to pick a city with reliable coordinates."
	} = $props();

	// svelte-ignore state_referenced_locally
	let city = $state(cityValue || "");
	// svelte-ignore state_referenced_locally
	let country = $state(countryValue || "USA");
	// svelte-ignore state_referenced_locally
	let lat = $state(latValue || "");
	// svelte-ignore state_referenced_locally
	let lng = $state(lngValue || "");
	let open = $state(false);
	let selectedLabel = $state("");
	// svelte-ignore state_referenced_locally
	let coordinateCity = $state(cityValue || "");
	const results = $derived(searchCities(city, 8));
	const hasCoordinates = $derived(lat !== "" && lng !== "");

	function chooseCity(option) {
		city = option.name;
		country = option.country;
		lat = String(option.lat);
		lng = String(option.lng);
		selectedLabel = cityLabel(option);
		coordinateCity = option.name;
		open = false;
	}

	function updateCity(event) {
		city = event.currentTarget.value;
		open = true;
		if (coordinateCity && city !== coordinateCity) {
			lat = "";
			lng = "";
			selectedLabel = "";
			coordinateCity = "";
		}
	}
</script>

<div class="city-combobox">
	<div class="field">
		<label for="city">{label}</label>
		<div class="combo-shell">
			<input
				id="city"
				name="city"
				value={city}
				autocomplete="off"
				placeholder="Search city, e.g. Honolulu"
				oninput={updateCity}
				onfocus={() => (open = true)}
				onblur={() => setTimeout(() => (open = false), 140)}
			/>
			{#if open && results.length > 0}
				<div class="city-menu">
					{#each results as option}
						<button type="button" onclick={() => chooseCity(option)}>
							<strong>{option.name}</strong>
							<span>{option.admin}, {option.country}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>
		<p class="muted">{help}</p>
	</div>
	<div class="field">
		<label for="country">Country</label>
		<input id="country" name="country" bind:value={country} placeholder="Country" />
	</div>
	<input type="hidden" name="lat" value={lat} />
	<input type="hidden" name="lng" value={lng} />
	<div class="field full coordinate-note">
		{#if hasCoordinates}
			<span>Mapped at {lat} / {lng}</span>
		{:else}
			<span>No coordinates selected yet. TripTales will try to match the city; otherwise no fake pin is created.</span>
		{/if}
	</div>
</div>

<style>
	.city-combobox {
		display: contents;
	}

	.combo-shell {
		position: relative;
	}

	.city-menu {
		position: absolute;
		z-index: 20;
		inset: calc(100% + 6px) 0 auto 0;
		display: grid;
		gap: 4px;
		max-height: 260px;
		overflow-y: auto;
		border: 1px solid rgba(36, 61, 72, 0.16);
		border-radius: 14px;
		background: #fffaf1;
		box-shadow: 0 18px 40px rgba(64, 47, 31, 0.16);
		padding: 8px;
	}

	.city-menu button {
		display: grid;
		gap: 2px;
		width: 100%;
		border: 0;
		border-radius: 10px;
		background: transparent;
		color: #253044;
		text-align: left;
		padding: 10px 12px;
		cursor: pointer;
	}

	.city-menu button:hover,
	.city-menu button:focus-visible {
		background: rgba(248, 161, 126, 0.2);
		outline: none;
	}

	.city-menu span {
		color: #6b7280;
		font-size: 0.9rem;
	}

	.coordinate-note {
		border: 1px dashed rgba(11, 111, 112, 0.28);
		border-radius: 12px;
		background: rgba(255, 250, 241, 0.72);
		color: #567;
		font-size: 0.92rem;
		padding: 10px 12px;
	}
</style>
