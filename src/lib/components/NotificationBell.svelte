<script>
	import { tick } from "svelte";

	let { notifications } = $props();

	let open = $state(false);
	let panelRef = $state();
	let triggerRef = $state();

	const totalCount = $derived(notifications?.totalCount || 0);
	const badgeText = $derived(totalCount > 9 ? "9+" : String(totalCount));
	const ariaLabel = $derived(
		totalCount === 0 ? "Notifications, none unread" : `Notifications, ${totalCount} unread`
	);

	const items = $derived([
		...(notifications?.invitations || []).map((event) => ({
			href: "/events?status=invited",
			kind: "invitation",
			...event
		})),
		...(notifications?.memoryPrompts || []).map((event) => ({
			href: `/events/${event.id}#after-event-panel`,
			kind: "memory",
			...event
		}))
	]);

	async function toggle() {
		open = !open;
		if (open) {
			await tick();
			const first = panelRef?.querySelector('[role="menuitem"]');
			first?.focus();
		}
	}

	function close() {
		open = false;
		triggerRef?.focus();
	}

	function focusItem(delta) {
		if (!panelRef) return;
		const list = Array.from(panelRef.querySelectorAll('[role="menuitem"]'));
		if (list.length === 0) return;
		const current = document.activeElement;
		const index = list.indexOf(current);
		const next = index === -1 ? 0 : (index + delta + list.length) % list.length;
		list[next].focus();
	}

	$effect(() => {
		if (!open) return;
		function onPointerDown(domEvent) {
			if (panelRef?.contains(domEvent.target)) return;
			if (triggerRef?.contains(domEvent.target)) return;
			open = false;
		}
		function onKeyDown(domEvent) {
			if (domEvent.key === "Escape") {
				domEvent.preventDefault();
				close();
			} else if (domEvent.key === "ArrowDown") {
				domEvent.preventDefault();
				focusItem(1);
			} else if (domEvent.key === "ArrowUp") {
				domEvent.preventDefault();
				focusItem(-1);
			}
		}
		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	});
</script>

<div class="bell-wrap">
	<button
		bind:this={triggerRef}
		type="button"
		class="bell-button"
		class:has-unread={totalCount > 0}
		aria-haspopup="menu"
		aria-expanded={open}
		aria-label={ariaLabel}
		data-notification-bell
		onclick={toggle}
	>
		<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
			<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
		</svg>
		{#if totalCount > 0}
			<span class="badge" aria-hidden="true">{badgeText}</span>
		{/if}
	</button>

	{#if open}
		<div bind:this={panelRef} class="panel" role="menu" aria-label="Notifications">
			{#if totalCount === 0}
				<p class="empty">All caught up.</p>
			{:else}
				{#if notifications.invitationsCount > 0}
					<p class="section-head">Invitations ({notifications.invitationsCount})</p>
					{#each items.filter((item) => item.kind === "invitation") as item}
						<a
							class="row"
							role="menuitem"
							tabindex="-1"
							href={item.href}
							onclick={() => (open = false)}
						>
							<span class="row-title">{item.title}</span>
							<span class="row-meta">
								{item.date}{item.ownerName ? ` · from ${item.ownerName}` : ""}
							</span>
						</a>
					{/each}
				{/if}
				{#if notifications.memoryPromptsCount > 0}
					<p class="section-head">Add memories ({notifications.memoryPromptsCount})</p>
					{#each items.filter((item) => item.kind === "memory") as item}
						<a
							class="row"
							role="menuitem"
							tabindex="-1"
							href={item.href}
							onclick={() => (open = false)}
						>
							<span class="row-title">{item.title}</span>
							<span class="row-meta">
								{item.date}{item.city ? ` · ${item.city}` : ""}
							</span>
						</a>
					{/each}
				{/if}
			{/if}
		</div>
	{/if}
</div>

<style>
	.bell-wrap {
		position: relative;
	}

	.bell-button {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 38px;
		height: 38px;
		padding: 0 10px;
		border-radius: 999px;
		background: #fff7ec;
		border: 1px solid var(--line);
		color: var(--muted);
		cursor: pointer;
	}

	.bell-button:hover,
	.bell-button[aria-expanded="true"] {
		border-color: #e9b77e;
		background: #fff1dc;
		color: var(--ink);
	}

	.bell-button.has-unread {
		color: var(--coral);
	}

	.badge {
		position: absolute;
		top: -4px;
		right: -4px;
		min-width: 18px;
		height: 18px;
		padding: 0 5px;
		border-radius: 999px;
		background: var(--coral);
		color: white;
		font-size: 0.7rem;
		font-weight: 900;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 0 0 2px rgba(255, 247, 236, 0.92);
	}

	.panel {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		width: min(320px, calc(100vw - 32px));
		max-height: 70vh;
		overflow-y: auto;
		background: #fffaf4;
		border: 1px solid var(--line);
		border-radius: 12px;
		box-shadow: 0 12px 32px rgba(126, 75, 38, 0.18);
		padding: 8px;
		z-index: 30;
	}

	.empty {
		margin: 0;
		padding: 16px;
		color: var(--muted);
		font-weight: 700;
		text-align: center;
	}

	.section-head {
		margin: 0;
		padding: 8px 10px 4px;
		color: var(--muted);
		font-size: 0.74rem;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.row {
		display: grid;
		gap: 2px;
		padding: 9px 10px;
		border-radius: 8px;
		text-decoration: none;
		color: inherit;
	}

	.row:hover,
	.row:focus-visible {
		background: #fff1dc;
		outline: none;
	}

	.row-title {
		font-weight: 800;
		color: var(--ink);
		overflow-wrap: anywhere;
	}

	.row-meta {
		color: var(--muted);
		font-size: 0.82rem;
		font-weight: 700;
	}

	@media (max-width: 760px) {
		.panel {
			position: fixed;
			top: auto;
			right: 16px;
			left: 16px;
			width: auto;
		}
	}
</style>
