<script>
	import EventForm from "$lib/components/EventForm.svelte";
	import EventMapPanel from "$lib/components/EventMapPanel.svelte";
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

	<section class="event-cover">
		{#if event.media?.imageUrl}
			<img src={event.media.imageUrl} alt={event.media.imageAlt || event.title} />
		{:else}
			<div class="cover-fallback">{event.category}</div>
		{/if}
		<div class="cover-caption">
			<strong>{event.location?.name}</strong>
			{#if event.media?.imageCredit}
				<span>{event.media.imageCredit} · {event.media.imageLicense}</span>
			{/if}
		</div>
	</section>

	<EventMapPanel event={event} />

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
					<label for="memoryImageUrl">Memory image URL optional</label>
					<input id="memoryImageUrl" name="imageUrl" value={event.journeyEntry?.imageUrl || ""} />
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

	.event-cover {
		position: relative;
		min-height: 340px;
		margin-bottom: 24px;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: var(--shadow);
		background: linear-gradient(135deg, var(--accent), var(--brand));
	}

	.event-cover img,
	.cover-fallback {
		width: 100%;
		height: 100%;
		min-height: 340px;
		object-fit: cover;
		display: grid;
		place-items: center;
		color: white;
		font-weight: 900;
	}

	.cover-caption {
		position: absolute;
		left: 18px;
		right: 18px;
		bottom: 18px;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 10px;
		border-radius: 8px;
		padding: 12px 14px;
		background: rgba(56, 34, 22, 0.72);
		color: white;
		backdrop-filter: blur(8px);
	}

	.cover-caption span {
		font-size: 0.85rem;
	}
</style>
