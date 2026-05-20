<script>
	import { tick } from "svelte";

	let { open, event, onClose } = $props();
	let deleteScope = $state("single");
	let dialogRef = $state();
	let previouslyFocused = null;

	function closeOnBackdrop(pointerEvent) {
		if (pointerEvent.target === pointerEvent.currentTarget) onClose();
	}

	$effect(() => {
		if (!open) return;
		previouslyFocused = document.activeElement;
		tick().then(() => {
			const firstRadio = dialogRef?.querySelector('input[type="radio"]');
			firstRadio?.focus();
		});
		function onKeyDown(domEvent) {
			if (domEvent.key === "Escape") {
				domEvent.preventDefault();
				onClose();
			}
		}
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
		};
	});
</script>

{#if open}
	<div class="dialog-backdrop" role="presentation" onclick={closeOnBackdrop}>
		<div bind:this={dialogRef} class="delete-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
			<div>
				<p class="eyebrow">Delete recurring event</p>
				<h2 id="delete-dialog-title">Delete this event or the whole series?</h2>
				<p class="muted">This cannot be undone. Journey memories connected to the deleted event dates will be removed too.</p>
			</div>
			<form method="POST" action="?/delete">
				<div class="delete-options">
					<label>
						<input type="radio" name="deleteScope" value="single" bind:group={deleteScope} />
						<span>
							<strong>Only this event</strong>
							<small>{event.date} at {event.time}</small>
						</span>
					</label>
					<label>
						<input type="radio" name="deleteScope" value="series" bind:group={deleteScope} />
						<span>
							<strong>Entire series</strong>
							<small>{event.recurrenceLabel || "All recurring events in this series"}</small>
						</span>
					</label>
				</div>
				<div class="dialog-actions">
					<button class="ghost-button" type="button" onclick={onClose}>Cancel</button>
					<button class="danger-button" type="submit">Delete selection</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.dialog-backdrop {
		position: fixed;
		inset: 0;
		z-index: 20;
		display: grid;
		place-items: center;
		background: rgba(0, 0, 0, 0.55);
		padding: 18px;
	}

	.delete-dialog {
		width: min(520px, 100%);
		display: grid;
		gap: 18px;
		border-radius: 8px;
		background: var(--panel);
		border: 1px solid var(--line);
		box-shadow: var(--shadow-hover);
		padding: 24px;
	}

	.delete-dialog h2,
	.delete-dialog p {
		margin-bottom: 6px;
	}

	.delete-options {
		display: grid;
		gap: 10px;
	}

	.delete-options label {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 10px;
		align-items: start;
		border: 1px solid var(--line);
		border-radius: 8px;
		background: var(--surface-raised);
		padding: 12px;
		cursor: pointer;
	}

	.delete-options input {
		width: auto;
		margin-top: 3px;
	}

	.delete-options span {
		display: grid;
		gap: 3px;
	}

	.delete-options strong {
		color: var(--ink);
	}

	.delete-options small {
		color: var(--muted);
		font-weight: 800;
	}

	.dialog-actions {
		display: flex;
		justify-content: flex-end;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 16px;
	}
</style>
