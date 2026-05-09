<script>
	import { categories, repeatFrequencies, UPLOAD_ALLOWED_MIME_TYPES, UPLOAD_MAX_BYTES } from "$lib/constants.js";
	import CityCombobox from "./CityCombobox.svelte";
	import FriendPicker from "./FriendPicker.svelte";

	let {
		event = null,
		action = "?/create",
		submitLabel = "Save event",
		form = null,
		inviteableUsers = [],
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

	function handleImageChange(domEvent) {
		clientImageError = "";
		const file = domEvent.currentTarget.files?.[0];
		if (!file) return;
		if (!UPLOAD_ALLOWED_MIME_TYPES.includes(file.type)) {
			clientImageError = "Use a JPG, PNG, WebP or GIF file.";
			domEvent.currentTarget.value = "";
			return;
		}
		if (file.size > UPLOAD_MAX_BYTES) {
			clientImageError = "Image must be 5 MB or smaller.";
			domEvent.currentTarget.value = "";
		}
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
						<p class="muted">→ {computedCount} occurrence{computedCount === 1 ? "" : "s"}{computedCount === 52 ? " (max — pick an earlier date for fewer)" : ""}</p>
					{/if}
					{#if fieldErrors.repeatCount}
						<p class="field-error">{fieldErrors.repeatCount}</p>
					{/if}
				{:else}
					<label for="repeatCount">Occurrences</label>
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
			<h3>Event image optional</h3>
			<p class="muted">Upload a JPG, PNG, WebP or GIF up to 5 MB.</p>
		</div>
		<div class="field full">
			<label for="eventImageFile">Event image</label>
			<input
				id="eventImageFile"
				name="eventImageFile"
				type="file"
				accept="image/jpeg,image/png,image/webp,image/gif"
				aria-invalid={Boolean(fieldErrors.eventImageFile || clientImageError)}
				onchange={handleImageChange}
			/>
			{#if clientImageError}
				<p class="field-error">{clientImageError}</p>
			{/if}
			{#if fieldErrors.eventImageFile}
				<p class="field-error">{fieldErrors.eventImageFile}</p>
			{/if}
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
		color: #b42318;
		font-size: 0.88rem;
		font-weight: 800;
	}

	input[aria-invalid="true"],
	select[aria-invalid="true"] {
		border-color: #ef4444;
		background: #fff7f7;
	}
</style>
