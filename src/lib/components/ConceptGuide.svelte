<script>
	// In-product explainer of how the core concepts relate (usability issue #39 / U9).
	// Native <details> — collapsible, accessible, no client state.
	let { open = false } = $props();
</script>

<details class="concept-guide" {open}>
	<summary>New here? How Ideas, Events, Memories &amp; Trips fit together</summary>
	<ul>
		<li><strong>Idea</strong> — a place or plan you'd like to do, with no date yet.</li>
		<li><strong>Event</strong> — an idea with a date and time; it shows in Events and on the Map.</li>
		<li><strong>Memory</strong> — once an event is done, add a note and photos to turn it into a memory.</li>
		<li><strong>Journey</strong> — your timeline of all memories.</li>
		<li><strong>Trip</strong> — groups related events together, e.g. one holiday.</li>
	</ul>
	<p class="concept-tip"><strong>Tip:</strong> planned events group into <strong>Trips</strong>; completed events become <strong>Memories</strong> in your <strong>Journey</strong>.</p>
</details>

<style>
	.concept-guide {
		margin: 0 0 20px;
		padding: 12px 14px;
		border: 1px solid var(--notice-border);
		background: var(--notice-bg);
		border-radius: 8px;
		color: var(--notice-fg);
	}

	.concept-guide summary {
		cursor: pointer;
		font-weight: 800;
	}

	.concept-guide ul {
		margin: 12px 0 0;
		padding-left: 20px;
		display: grid;
		gap: 6px;
		font-size: 0.92rem;
		line-height: 1.55;
	}

	.concept-tip {
		margin: 10px 0 0;
		font-size: 0.92rem;
		line-height: 1.55;
	}
</style>
