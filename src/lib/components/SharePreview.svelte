<script>
	import { browser } from "$app/environment";
	import PlaceholderIcon from "$lib/components/PlaceholderIcon.svelte";
	import { buildShareText } from "$lib/utils/event-format.js";

	let { event } = $props();
	const entry = $derived(event?.journeyEntry || {});
	const shareText = $derived(buildShareText(event));

	const formats = [
		{ id: "postcard", label: "Postcard", aria: "Postcard 4 by 5" },
		{ id: "story", label: "Story", aria: "Story 9 by 16" },
		{ id: "square", label: "Square", aria: "Square 1 by 1" }
	];
	let format = $state("postcard");
	let feedback = $state("");
	let feedbackTimer;

	function showFeedback(text) {
		feedback = text;
		if (feedbackTimer) clearTimeout(feedbackTimer);
		feedbackTimer = setTimeout(() => {
			feedback = "";
			feedbackTimer = null;
		}, 2000);
	}

	async function share() {
		if (!browser) return;
		try {
			if (typeof navigator !== "undefined" && navigator.share) {
				await navigator.share({ title: event.title, text: shareText });
				showFeedback("Shared!");
				return;
			}
			if (typeof navigator !== "undefined" && navigator.clipboard) {
				await navigator.clipboard.writeText(shareText);
				showFeedback("Copied!");
				return;
			}
			showFeedback("Sharing not supported on this browser");
		} catch (err) {
			if (err?.name === "AbortError") return;
			showFeedback("Could not share");
		}
	}

	const canShare = $derived(
		browser && typeof navigator !== "undefined" && (Boolean(navigator.share) || Boolean(navigator.clipboard))
	);
</script>

<div class="share-tools">
	<div class="format-toggle" role="group" aria-label="Preview format">
		{#each formats as option}
			<button
				type="button"
				aria-label={option.aria}
				aria-pressed={format === option.id}
				onclick={() => (format = option.id)}
			>
				{option.label}
			</button>
		{/each}
	</div>

	<aside class="preview {format}">
		{#if event.media?.images?.[0]?.url}
			<img src={event.media.images[0].url} alt="" />
		{:else}
			<div class="preview-placeholder" aria-hidden="true">
				<PlaceholderIcon size={64} />
			</div>
		{/if}
		<div class="preview-head">
			<strong>TripTales</strong>
			<span>{event.category}</span>
		</div>
		<div class="preview-body">
			<h3>{event.title}</h3>
			<p>{entry.memoryText || event.description}</p>
		</div>
		<div class="preview-foot">
			<span>{event.location?.name}</span>
			<span>{entry.memoryText ? "memory" : "planned"}</span>
		</div>
	</aside>

	<div class="share-actions">
		<button
			type="button"
			class="share-button"
			onclick={share}
			disabled={!canShare}
			title={canShare ? "" : "Sharing not supported on this browser"}
		>
			Share story
		</button>
		{#if feedback}
			<span class="share-feedback" role="status">{feedback}</span>
		{/if}
	</div>
</div>

<style>
	.share-tools {
		display: grid;
		gap: 12px;
	}

	.format-toggle {
		display: inline-flex;
		gap: 4px;
		padding: 4px;
		background: var(--surface-raised);
		border: 1px solid var(--line);
		border-radius: 999px;
		width: fit-content;
	}

	.format-toggle button {
		padding: 6px 12px;
		border-radius: 999px;
		background: transparent;
		border: none;
		color: var(--muted);
		font-weight: 800;
		font-size: 0.84rem;
		cursor: pointer;
	}

	.format-toggle button[aria-pressed="true"] {
		background: linear-gradient(135deg, var(--coral), var(--accent));
		color: white;
		box-shadow: 0 4px 12px rgba(231, 95, 67, 0.22);
	}

	.preview {
		border-radius: 8px;
		padding: 20px;
		display: grid;
		align-content: space-between;
		color: white;
		background:
			linear-gradient(140deg, rgba(255, 255, 255, 0.18) 0 18%, transparent 18% 100%),
			linear-gradient(145deg, var(--coral), var(--accent) 38%, var(--brand) 100%);
		box-shadow: var(--shadow);
		position: relative;
		overflow: hidden;
	}

	.preview.postcard {
		aspect-ratio: 4 / 5;
	}

	.preview.story {
		aspect-ratio: 9 / 16;
	}

	.preview.square {
		aspect-ratio: 1 / 1;
	}

	.preview img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		z-index: 0;
		filter: saturate(1.05);
	}

	.preview-placeholder {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		color: rgba(255, 255, 255, 0.55);
		z-index: 1;
	}

	.preview::before {
		content: "";
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(56, 34, 22, 0.18), rgba(56, 34, 22, 0.72));
		z-index: 1;
	}

	.preview::after {
		content: "";
		position: absolute;
		right: 18px;
		bottom: 18px;
		width: 72px;
		height: 72px;
		border: 2px solid rgba(255, 255, 255, 0.62);
		border-radius: 999px;
		z-index: 2;
	}

	.preview-head,
	.preview-foot {
		display: flex;
		justify-content: space-between;
		gap: 10px;
		font-weight: 900;
		position: relative;
		z-index: 2;
	}

	.preview-body {
		position: relative;
		z-index: 2;
	}

	.preview-body h3 {
		color: white;
		font-size: 1.8rem;
		text-shadow: 0 2px 16px rgba(56, 34, 22, 0.24);
	}

	.preview.story .preview-body h3 {
		font-size: 2.1rem;
	}

	.share-actions {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
	}

	.share-button {
		padding: 10px 18px;
		border-radius: 999px;
		border: none;
		background: linear-gradient(135deg, var(--coral), var(--accent));
		color: white;
		font-weight: 900;
		cursor: pointer;
		box-shadow: 0 8px 20px rgba(231, 95, 67, 0.22);
	}

	.share-button:hover:not(:disabled) {
		filter: brightness(1.05);
	}

	.share-button:disabled {
		opacity: 0.55;
		cursor: not-allowed;
		box-shadow: none;
	}

	.share-feedback {
		color: var(--palm);
		font-weight: 800;
	}
</style>
