<script>
	import { UPLOAD_ALLOWED_MIME_TYPES, UPLOAD_MAX_BYTES } from "$lib/constants.js";

	let { event, form } = $props();
	let clientImageError = $state("");
	const hasMemory = $derived(Boolean(event.journeyEntry?.memoryText));

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
			<label for="memoryImageFile">Memory image optional</label>
			<input
				id="memoryImageFile"
				name="memoryImageFile"
				type="file"
				accept="image/jpeg,image/png,image/webp,image/gif"
				aria-invalid={Boolean(form?.memoryFieldErrors?.memoryImageFile || clientImageError)}
				onchange={handleImageChange}
			/>
			{#if clientImageError}
				<p class="field-error">{clientImageError}</p>
			{/if}
			{#if form?.memoryFieldErrors?.memoryImageFile}
				<p class="field-error">{form.memoryFieldErrors.memoryImageFile}</p>
			{/if}
			{#if event.journeyEntry?.imageUrl}
				<label class="checkbox-field">
					<input name="clearMemoryImage" type="checkbox" value="true" />
					<span>Remove current memory image</span>
				</label>
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
