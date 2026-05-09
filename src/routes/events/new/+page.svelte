<script>
	import EventForm from "$lib/components/EventForm.svelte";

	let { data, form } = $props();
</script>

<main class="page-shell">
	<header class="page-header">
		<div>
			<p class="eyebrow">Create event</p>
			<h1>Plan something worth remembering</h1>
			<p class="lead">Add the plan, location and friends in one workflow. Use any city or country for global journeys.</p>
		</div>
	</header>

	{#if form?.error}
		<div class="message error">{form.error}</div>
	{/if}

	<EventForm
		action="?/create"
		submitLabel="Create event"
		{form}
		inviteableUsers={data.inviteableUsers}
		trips={data.trips}
		showRecurrence
	/>
</main>
