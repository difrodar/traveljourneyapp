<script>
	import {
		UPLOAD_ALLOWED_MIME_TYPES,
		UPLOAD_MAX_BYTES,
		UPLOAD_MAX_IMAGES,
		UPLOAD_MAX_TOTAL_BYTES
	} from "$lib/constants.js";

	let { event, form } = $props();
	let clientImageError = $state("");
	const hasMemory = $derived(Boolean(event.journeyEntry?.memoryText));
	const existingImages = $derived(event.journeyEntry?.images || []);
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
			clientImageError = `At most ${UPLOAD_MAX_IMAGES} images per memory.`;
			domEvent.currentTarget.value = "";
			return;
		}
		const totalNew = files.reduce((sum, f) => sum + f.size, 0);
		if (totalNew > UPLOAD_MAX_TOTAL_BYTES) {
			clientImageError = "Combined images exceed the 9 MB total per memory.";
			domEvent.currentTarget.value = "";
		}
	}

	function toggleRemoveImage(idx) {
		const next = new Set(removeIndices);
		if (next.has(idx)) next.delete(idx);
		else next.add(idx);
		removeIndices = next;
	}
</script>

<section id="after-event-panel" class="after-panel">
	<p class="eyebrow">After the event</p>
	<h2>Journey memory</h2>
	<p class="muted">Add your personal memory once the event has happened.</p>
	<form class="memory-form" method="POST" action="?/complete" enctype="multipart/form-data">
		<div class="field">
			<label for="memoryText">Memory text</label>
			<textarea id="memoryText" name="memoryText" aria-invalid={Boolean(form?.memoryFieldErrors?.memoryText)} required>{form?.memoryValues?.memoryText ?? event.journeyEntry?.memoryText ?? ""}</textarea>
			{#if form?.memoryFieldErrors?.memoryText}
				<p class="field-error">{form.memoryFieldErrors.memoryText}</p>
			{/if}
		</div>
		<div class="field">
			<label for="memoryImageFiles">Memory images optional (up to 5)</label>
			<input
				id="memoryImageFiles"
				name="memoryImageFiles"
				type="file"
				accept="image/jpeg,image/png,image/webp,image/gif"
				multiple
				aria-invalid={Boolean(form?.memoryFieldErrors?.memoryImageFiles || clientImageError)}
				onchange={handleImageChange}
			/>
			{#if clientImageError}
				<p class="field-error">{clientImageError}</p>
			{/if}
			{#if form?.memoryFieldErrors?.memoryImageFiles}
				<p class="field-error">{form.memoryFieldErrors.memoryImageFiles}</p>
			{/if}
			{#if existingImages.length > 0}
				<div class="existing-images">
					{#each existingImages as img, idx}
						<label class="existing-image" class:marked-removed={removeIndices.has(idx)}>
							<img src={img.url} alt={img.alt || ""} />
							<span class="remove-control">
								<input
									type="checkbox"
									name="removeMemoryImageIndex"
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
		<button class="button" type="submit">Save memory</button>
	</form>

	{#if hasMemory}
		<article class="memory-card">
			<span>Saved journey memory</span>
			<p>{event.journeyEntry.memoryText}</p>
		</article>
	{/if}
</section>

<style>
	.after-panel {
		border: 1px solid #e5d7c8;
		border-radius: 8px;
		background: #fffdf9;
		padding: 22px;
	}

	.memory-form {
		display: grid;
		gap: 14px;
		margin-top: 16px;
	}

	.field-error {
		margin: 0;
		color: #b42318;
		font-size: 0.88rem;
		font-weight: 800;
	}

	input[aria-invalid="true"],
	textarea[aria-invalid="true"] {
		border-color: #ef4444;
		background: #fff7f7;
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
		background: #fffdf8;
		cursor: pointer;
	}

	.existing-image img {
		width: 100%;
		aspect-ratio: 1 / 1;
		object-fit: cover;
		border-radius: 6px;
	}

	.existing-image.marked-removed {
		border-color: #ef4444;
		background: #fff5f5;
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

	.memory-card {
		margin-top: 16px;
		border-radius: 8px;
		background: #fff5e7;
		border: 1px solid #efd5b6;
		padding: 15px;
	}

	.memory-card span {
		color: #a94724;
		font-weight: 900;
	}

	.memory-card p {
		margin: 8px 0 0;
		color: #51453d;
		line-height: 1.55;
	}
</style>
