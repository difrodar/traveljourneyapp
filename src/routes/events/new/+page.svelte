<script>
	import EventForm from "$lib/components/EventForm.svelte";

	let { data, form } = $props();
	const fromIdea = $derived(Boolean(data.fromIdeaId));
</script>

<main class="page-shell">
	<header class="page-header">
		<div>
			<p class="eyebrow">{fromIdea ? "Convert idea" : "Create event"}</p>
			<h1>{fromIdea ? "Convert your idea into an event" : "Plan something worth remembering"}</h1>
			<p class="lead">
				{#if fromIdea}
					Review the pre-filled fields below — pick a date and time, then click <strong>Create event</strong>. The idea stays in your list until the event is saved; <a href="/ideas">cancel and go back</a> if you change your mind.
				{:else}
					Add the plan, location and friends in one workflow. Use any city or country for global journeys.
				{/if}
			</p>
		</div>
	</header>

	{#if form?.error}
		<div class="message error">{form.error}</div>
	{/if}

	<EventForm
		action="?/create"
		submitLabel="Create event"
		{form}
		event={data.initialEvent}
		inviteableUsers={data.inviteableUsers}
		trips={data.trips}
		initialDate={data.initialDate}
		fromIdeaId={data.fromIdeaId}
		showRecurrence
		showSaveAsIdea
	/>
</main>
