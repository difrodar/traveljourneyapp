<script>
	let { current = "light" } = $props();
	let theme = $state(current);
	let busy = $state(false);
	let errorMessage = $state("");

	async function toggle() {
		if (busy) return;
		const next = theme === "dark" ? "light" : "dark";
		const previous = theme;
		theme = next;
		document.documentElement.dataset.theme = next;
		busy = true;
		errorMessage = "";
		try {
			const response = await fetch("/api/theme", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ theme: next })
			});
			if (!response.ok) throw new Error("save failed");
		} catch {
			theme = previous;
			document.documentElement.dataset.theme = previous;
			errorMessage = "Couldn't save theme.";
		} finally {
			busy = false;
		}
	}
</script>

<button
	type="button"
	class="theme-toggle"
	class:dark={theme === "dark"}
	aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
	aria-pressed={theme === "dark"}
	title={errorMessage || (theme === "dark" ? "Switch to light mode" : "Switch to dark mode")}
	onclick={toggle}
	disabled={busy}
>
	{#if theme === "dark"}
		<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
		</svg>
	{:else}
		<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
		</svg>
	{/if}
</button>

<style>
	.theme-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		padding: 0;
		border-radius: 50%;
		background: var(--surface-raised);
		color: var(--ink);
		border: 1px solid var(--line);
		transition:
			transform 0.15s ease,
			background 0.15s ease,
			border-color 0.15s ease;
	}

	.theme-toggle:hover {
		border-color: var(--accent);
		transform: translateY(-1px);
	}

	.theme-toggle:focus-visible {
		outline: 3px solid var(--focus-ring);
		outline-offset: 1px;
	}

	.theme-toggle:disabled {
		opacity: 0.6;
		cursor: progress;
	}
</style>
