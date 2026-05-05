<script>
	import { categories } from "$lib/constants.js";
	import CityCombobox from "./CityCombobox.svelte";
	import FriendPicker from "./FriendPicker.svelte";

	let { event = null, action = "?/create", submitLabel = "Save event" } = $props();
	const location = $derived(event?.location || {});
</script>

<form class="panel" method="POST" action={action} enctype="multipart/form-data">
	<div class="form-grid">
		<div class="field">
			<label for="title">Title</label>
			<input id="title" name="title" value={event?.title || ""} required />
		</div>
		<div class="field">
			<label for="category">Category</label>
			<select id="category" name="category" required>
				<option value="">Choose category</option>
				{#each categories as category}
					<option value={category} selected={event?.category === category}>{category}</option>
				{/each}
			</select>
		</div>
		<div class="field">
			<label for="date">Date</label>
			<input id="date" name="date" type="date" value={event?.date || ""} required />
		</div>
		<div class="field">
			<label for="time">Time</label>
			<input id="time" name="time" type="time" value={event?.time || ""} required />
		</div>
		<div class="field">
			<label for="status">Status</label>
			<select id="status" name="status">
				<option value="planned" selected={!event || event.status === "planned"}>Planned</option>
				<option value="completed" selected={event?.status === "completed"}>Completed</option>
			</select>
		</div>
		<div class="field">
			<label for="locationName">Location</label>
			<input id="locationName" name="locationName" value={location.name || ""} required />
		</div>
		<div class="field">
			<label for="address">Address</label>
			<input id="address" name="address" value={location.address || ""} />
		</div>
		<CityCombobox
			cityValue={location.city || ""}
			countryValue={location.country || "USA"}
			latValue={location.coordinates?.lat || ""}
			lngValue={location.coordinates?.lng || ""}
			help="Pick the nearest city so the event appears at the right place on the map."
		/>
		<div class="field">
			<label for="backgroundType">Visual type</label>
			<input id="backgroundType" name="backgroundType" value={location.backgroundType || ""} placeholder="beach, culture, nightlife" />
		</div>
		<div class="field full">
			<label for="description">Description</label>
			<textarea id="description" name="description">{event?.description || ""}</textarea>
		</div>
		<div class="field full media-fields">
			<h3>Event image optional</h3>
			<p class="muted">Upload a JPG, PNG, WebP or GIF up to 2 MB.</p>
		</div>
		<div class="field full">
			<label for="eventImageFile">Event image</label>
			<input id="eventImageFile" name="eventImageFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif" />
			{#if event?.imageUrl}
				<label class="checkbox-field">
					<input name="clearEventImage" type="checkbox" value="true" />
					<span>Remove current event image</span>
				</label>
			{/if}
		</div>
		<input type="hidden" name="locationImageUrl" value={location.imageUrl || ""} />
		<input type="hidden" name="locationImageAlt" value={location.imageAlt || ""} />
		<input type="hidden" name="locationImageCredit" value={location.imageCredit || ""} />
		<input type="hidden" name="locationImageLicense" value={location.imageLicense || ""} />
		<input type="hidden" name="locationImageSourceUrl" value={location.imageSourceUrl || ""} />
		<div class="field full">
			<span class="field-label">Invited friends</span>
			<FriendPicker initial={event?.friends || []} />
		</div>
	</div>
	<div class="actions">
		<button class="button" type="submit">{submitLabel}</button>
		<a class="ghost-button" href="/events">Cancel</a>
	</div>
</form>

<style>
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 18px;
	}

	.field-label {
		font-weight: 800;
		color: #253044;
	}

	.media-fields {
		margin-top: 4px;
		border-top: 1px solid var(--line);
		padding-top: 14px;
	}

	.media-fields h3 {
		margin-bottom: 4px;
	}

	.checkbox-field {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 8px;
		color: var(--muted);
		font-weight: 800;
	}

	.checkbox-field input {
		width: auto;
	}
</style>
