<script>
	let { event } = $props();
	const entry = $derived(event?.journeyEntry || {});
</script>

<aside class="preview">
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
		<span>{entry.rating ? `${entry.rating}/5` : "planned"}</span>
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
		background: linear-gradient(145deg, #0f766e, #1d74b7 55%, #d97706);
		box-shadow: var(--shadow);
	}

	.preview-head,
	.preview-foot {
		display: flex;
		justify-content: space-between;
		gap: 10px;
		font-weight: 900;
	}

	.preview-body h3 {
		color: white;
		font-size: 1.8rem;
	}
</style>
