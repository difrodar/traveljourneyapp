<script>
	import {
		categories,
		repeatFrequencies,
		UPLOAD_ALLOWED_MIME_TYPES,
		UPLOAD_MAX_BYTES,
		UPLOAD_MAX_IMAGES,
		UPLOAD_MAX_TOTAL_BYTES
	} from "$lib/constants.js";
	import CityCombobox from "./CityCombobox.svelte";
	import FriendPicker from "./FriendPicker.svelte";

	let {
		event = null,
		action = "?/create",
		submitLabel = "Save event",
		form = null,
		inviteableUsers = [],
		trips = [],
		showRecurrence = false
	} = $props();
	const location = $derived(event?.location || {});
	const values = $derived(form?.values || {});
	const fieldErrors = $derived(form?.fieldErrors || {});
	const selectedUserIds = $derived(
		Array.isArray(values.invitedUserIds) && values.invitedUserIds.length
			? values.invitedUserIds
			: event?.friends?.map((friend) => friend.id) || []
	);
	let clientImageError = $state("");

	function fieldValue(name, fallback = "") {
		return Object.hasOwn(values, name) ? values[name] : fallback;
	}

	const existingImages = $derived(event?.images || []);
	let removeIndices = $state(new Set());
	const keptCount = $derived(existingImages.filter((_, idx) => !removeIndices.has(idx)).length);

	function handleImageChange(domEvent) {
		clientImageError = "";
		const files = Array.from(domEvent.currentTarget.files || []);
		if (files.length === 0) return;
		for (const file of files) {
			if (!UPLOAD_ALLOWED_MIME_TYPES.includes(file.type)) {
				clientImageError = "Use a JPG, PNG, WebP or GIF file.";
				domEvent.currentTarget.value = "";
				return;
			}
			if (file.size > UPLOAD_MAX_BYTES) {
				clientImageError = "Each image must be 2 MB or smaller.";
				domEvent.currentTarget.value = "";
				return;
			}
		}
		if (keptCount + files.length > UPLOAD_MAX_IMAGES) {
			clientImageError = `At most ${UPLOAD_MAX_IMAGES} images per event.`;
			domEvent.currentTarget.value = "";
			return;
		}
		const totalNew = files.reduce((sum, f) => sum + f.size, 0);
		if (totalNew > UPLOAD_MAX_TOTAL_BYTES) {
			clientImageError = "Combined images exceed the 9 MB total per event.";
			domEvent.currentTarget.value = "";
		}
	}

	function toggleRemoveImage(idx) {
		const next = new Set(removeIndices);
		if (next.has(idx)) next.delete(idx);
		else next.add(idx);
		removeIndices = next;
	}

	let startDate = $state(fieldValue("date", event?.date || ""));
	let repeatFrequencyValue = $state(fieldValue("repeatFrequency", "none"));
	let repeatMode = $state("count");
	let untilDate = $state("");

	const computedCount = $derived(computeOccurrenceCount(startDate, untilDate, repeatFrequencyValue));
	const computedHidden = $derived(Math.max(1, computedCount));
	const untilError = $derived(
		repeatMode === "until" && untilDate && computedCount === 0
			? "Until date must be on or after the start date."
			: ""
	);

	function parseDate(value) {
		const parts = String(value || "").split("-").map(Number);
		if (parts.length !== 3) return null;
		const [y, m, d] = parts;
		if (!y || !m || !d) return null;
		return new Date(y, m - 1, d);
	}

	function nextOccurrence(start, frequency, index) {
		if (index === 0 || frequency === "none") return start;
		if (frequency === "daily") return new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
		if (frequency === "weekly") return new Date(start.getFullYear(), start.getMonth(), start.getDate() + index * 7);
		const target = start.getMonth() + index;
		const year = start.getFullYear() + Math.floor(target / 12);
		const month = ((target % 12) + 12) % 12;
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const day = Math.min(start.getDate(), daysInMonth);
		return new Date(year, month, day);
	}

	function computeOccurrenceCount(start, until, frequency) {
		if (frequency === "none") return 1;
		const s = parseDate(start);
		const u = parseDate(until);
		if (!s || !u || u < s) return 0;
		let count = 0;
		for (let i = 0; i < 52; i++) {
			if (nextOccurrence(s, frequency, i) > u) break;
			count++;
		}
		return count;
	}
</script>

<form class="panel" method="POST" action={action} enctype="multipart/form-data">
	<div class="form-grid">
		<div class="field">
			<label for="title">Title</label>
			<input id="title" name="title" value={fieldValue("title", event?.title || "")} aria-invalid={Boolean(fieldErrors.title)} required />
			{#if fieldErrors.title}
				<p class="field-error">{fieldErrors.title}</p>
			{/if}
		</div>
		<div class="field">
			<label for="category">Category</label>
			<select id="category" name="category" aria-invalid={Boolean(fieldErrors.category)} required>
				<option value="">Choose category</option>
				{#each categories as category}
					<option value={category} selected={fieldValue("category", event?.category || "") === category}>{category}</option>
				{/each}
			</select>
			{#if fieldErrors.category}
				<p class="field-error">{fieldErrors.category}</p>
			{/if}
		</div>
		<div class="field">
			<label for="date">Date</label>
			<input id="date" name="date" type="date" bind:value={startDate} aria-invalid={Boolean(fieldErrors.date)} required />
			{#if fieldErrors.date}
				<p class="field-error">{fieldErrors.date}</p>
			{/if}
		</div>
		<div class="field">
			<label for="time">Time</label>
			<input id="time" name="time" type="time" value={fieldValue("time", event?.time || "")} aria-invalid={Boolean(fieldErrors.time)} required />
			{#if fieldErrors.time}
				<p class="field-error">{fieldErrors.time}</p>
			{/if}
		</div>
		<div class="field">
			<label for="status">Status</label>
			<select id="status" name="status">
				<option value="planned" selected={fieldValue("status", event?.status || "planned") === "planned"}>Planned</option>
				<option value="completed" selected={fieldValue("status", event?.status || "planned") === "completed"}>Completed</option>
			</select>
		</div>
		<div class="field">
			<label for="tripId">Trip (optional)</label>
			<select id="tripId" name="tripId">
				<option value="">No trip</option>
				{#each trips as trip}
					<option
						value={trip.id}
						selected={fieldValue("tripId", event?.tripId || "") === trip.id}>{trip.name}</option>
				{/each}
			</select>
		</div>
		{#if showRecurrence}
			<div class="field">
				<label for="repeatFrequency">Repeat</label>
				<select id="repeatFrequency" name="repeatFrequency" bind:value={repeatFrequencyValue} aria-invalid={Boolean(fieldErrors.repeatFrequency)}>
					{#each repeatFrequencies as frequency}
						<option value={frequency.value}>{frequency.label}</option>
					{/each}
				</select>
				{#if fieldErrors.repeatFrequency}
					<p class="field-error">{fieldErrors.repeatFrequency}</p>
				{/if}
			</div>
			{#if repeatFrequencyValue !== "none"}
				<div class="field">
					<span class="field-label">How long?</span>
					<div class="repeat-mode">
						<label class="radio-option">
							<input type="radio" value="count" bind:group={repeatMode} />
							<span>Repeat N times</span>
						</label>
						<label class="radio-option">
							<input type="radio" value="until" bind:group={repeatMode} />
							<span>Repeat until date</span>
						</label>
					</div>
				</div>
			{/if}
			<div class="field">
				{#if repeatMode === "until" && repeatFrequencyValue !== "none"}
					<label for="repeatUntil">Until</label>
					<input
						id="repeatUntil"
						type="date"
						min={startDate || undefined}
						bind:value={untilDate}
						aria-invalid={Boolean(untilError || fieldErrors.repeatCount)}
					/>
					<input type="hidden" name="repeatCount" value={computedHidden} />
					{#if untilError}
						<p class="field-error">{untilError}</p>
					{:else if untilDate && computedCount > 0}
						<p class="muted">→ {computedCount} date{computedCount === 1 ? "" : "s"}{computedCount === 52 ? " (max — pick an earlier date for fewer)" : ""}</p>
					{/if}
					{#if fieldErrors.repeatCount}
						<p class="field-error">{fieldErrors.repeatCount}</p>
					{/if}
				{:else}
					<label for="repeatCount">Number of dates</label>
					<input
						id="repeatCount"
						name="repeatCount"
						type="number"
						min="1"
						max="52"
						value={fieldValue("repeatCount", "1")}
						aria-invalid={Boolean(fieldErrors.repeatCount)}
					/>
					{#if fieldErrors.repeatCount}
						<p class="field-error">{fieldErrors.repeatCount}</p>
					{/if}
				{/if}
			</div>
		{/if}
		<div class="field">
			<label for="locationName">Location</label>
			<input
				id="locationName"
				name="locationName"
				value={fieldValue("locationName", location.name || "")}
				aria-invalid={Boolean(fieldErrors.locationName)}
				required
			/>
			{#if fieldErrors.locationName}
				<p class="field-error">{fieldErrors.locationName}</p>
			{/if}
		</div>
		<div class="field">
			<label for="address">Address</label>
			<input id="address" name="address" value={fieldValue("address", location.address || "")} />
		</div>
		<CityCombobox
			cityValue={fieldValue("city", location.city || "")}
			countryValue={fieldValue("country", location.country || "USA")}
			latValue={fieldValue("lat", location.coordinates?.lat || "")}
			lngValue={fieldValue("lng", location.coordinates?.lng || "")}
			help="Pick the nearest city so the event appears at the right place on the map."
		/>
		<div class="field full">
			<label for="description">Description</label>
			<textarea id="description" name="description">{fieldValue("description", event?.description || "")}</textarea>
		</div>
		<div class="field full media-fields">
			<h3>Event images optional</h3>
			<p class="muted">Up to 5 photos per event, each JPG/PNG/WebP/GIF up to 2 MB.</p>
		</div>
		<div class="field full">
			<label for="eventImageFiles">Event images</label>
			<input
				id="eventImageFiles"
				name="eventImageFiles"
				type="file"
				accept="image/jpeg,image/png,image/webp,image/gif"
				multiple
				aria-invalid={Boolean(fieldErrors.eventImageFiles || clientImageError)}
				onchange={handleImageChange}
			/>
			{#if clientImageError}
				<p class="field-error">{clientImageError}</p>
			{/if}
			{#if fieldErrors.eventImageFiles}
				<p class="field-error">{fieldErrors.eventImageFiles}</p>
			{/if}
			{#if existingImages.length > 0}
				<div class="existing-images">
					{#each existingImages as img, idx}
						<label class="existing-image" class:marked-removed={removeIndices.has(idx)}>
							<img src={img.url} alt={img.alt || ""} />
							<span class="remove-control">
								<input
									type="checkbox"
									name="removeEventImageIndex"
									value={idx}
									checked={removeIndices.has(idx)}
									onchange={() => toggleRemoveImage(idx)}
								/>
								<small>{removeIndices.has(idx) ? "Will be removed" : "Remove"}</small>
							</span>
						</label>
					{/each}
				</div>
			{/if}
		</div>
		<input type="hidden" name="locationImageUrl" value={location.imageUrl || ""} />
		<input type="hidden" name="locationImageAlt" value={location.imageAlt || ""} />
		<input type="hidden" name="locationImageCredit" value={location.imageCredit || ""} />
		<input type="hidden" name="locationImageLicense" value={location.imageLicense || ""} />
		<input type="hidden" name="locationImageSourceUrl" value={location.imageSourceUrl || ""} />
		<div class="field full">
			<span class="field-label">Invited TripTales users</span>
			<FriendPicker users={inviteableUsers} selectedIds={selectedUserIds} error={fieldErrors.invitedUserIds} />
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
		color: var(--ink-strong);
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

	.existing-images {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
		gap: 10px;
		margin-top: 12px;
	}

	.existing-image {
		display: grid;
		gap: 6px;
		border: 1px solid var(--line);
		border-radius: 8px;
		padding: 8px;
		background: var(--surface-input);
		cursor: pointer;
	}

	.existing-image img {
		width: 100%;
		aspect-ratio: 1 / 1;
		object-fit: cover;
		border-radius: 6px;
	}

	.existing-image.marked-removed {
		border-color: var(--danger-fg);
		background: var(--danger-bg);
		opacity: 0.7;
	}

	.remove-control {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: var(--muted);
		font-weight: 700;
	}

	.remove-control input {
		width: auto;
	}

	.repeat-mode {
		display: flex;
		flex-wrap: wrap;
		gap: 14px;
		margin-top: 4px;
	}

	.radio-option {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: var(--muted);
		font-weight: 700;
	}

	.radio-option input {
		width: auto;
	}

	.field-error {
		margin: 0;
		color: var(--danger-fg);
		font-size: 0.88rem;
		font-weight: 800;
	}

	input[aria-invalid="true"],
	select[aria-invalid="true"] {
		border-color: var(--danger-fg);
		background: var(--danger-bg);
	}
</style>
