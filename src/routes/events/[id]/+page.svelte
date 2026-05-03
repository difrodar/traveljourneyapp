<script>
	import EventForm from "$lib/components/EventForm.svelte";
	import RatingInput from "$lib/components/RatingInput.svelte";
	import SharePreview from "$lib/components/SharePreview.svelte";

	let { data, form } = $props();
	const event = $derived(data.event);
</script>

<main class="page-shell">
	<header class="page-header">
		<div>
			<p class="eyebrow">Event detail</p>
			<h1>{event.title}</h1>
			<div class="meta-row">
				<span class="status {event.status}">{event.status}</span>
				<span class="category">{event.category}</span>
				<span>{event.date} at {event.time}</span>
				<span>{event.location?.name}</span>
			</div>
		</div>
		<form method="POST" action="?/delete">
			<button class="danger-button" type="submit">Delete event</button>
		</form>
	</header>

	{#if form?.error}
		<div class="message error">{form.error}</div>
	{:else if form?.message}
		<div class="message">{form.message}</div>
	{/if}

	<section class="grid two">
		<div>
			<h2>Edit plan</h2>
			<EventForm event={event} action="?/update" submitLabel="Save changes" />
		</div>
		<div class="side">
			<h2>Complete as journey memory</h2>
			<form class="panel memory-form" method="POST" action="?/complete">
				<div class="field">
					<span class="field-label">Rating</span>
					<RatingInput value={event.journeyEntry?.rating || 4} />
				</div>
				<div class="field">
					<label for="memoryText">Memory text</label>
					<textarea id="memoryText" name="memoryText" required>{event.journeyEntry?.memoryText || ""}</textarea>
				</div>
				<div class="field">
					<label for="imageUrl">Image URL optional</label>
					<input id="imageUrl" name="imageUrl" value={event.journeyEntry?.imageUrl || ""} />
				</div>
				<button class="button" type="submit">Save memory</button>
			</form>

			<h2>Share preview</h2>
			<SharePreview {event} />
		</div>
	</section>
</main>

<style>
	.side {
		display: grid;
		gap: 16px;
		align-content: start;
	}

	.memory-form {
		display: grid;
		gap: 14px;
	}

	.field-label {
		font-weight: 800;
		color: #253044;
	}
</style>
