<script>
	import PlaceholderIcon from "$lib/components/PlaceholderIcon.svelte";

	let { event } = $props();
	const entry = $derived(event?.journeyEntry || {});
</script>

<aside class="preview">
	{#if event.media?.imageUrl}
		<img src={event.media.imageUrl} alt="" />
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

<style>
	.preview {
		aspect-ratio: 4 / 5;
		border-radius: 8px;
		padding: 20px;
		display: grid;
		align-content: space-between;
		color: white;
		background:
			linear-gradient(140deg, rgba(255, 255, 255, 0.18) 0 18%, transparent 18% 100%),
			linear-gradient(145deg, #e75f43, #ef8f38 38%, #0f766e 100%);
		box-shadow: var(--shadow);
		position: relative;
		overflow: hidden;
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
</style>
