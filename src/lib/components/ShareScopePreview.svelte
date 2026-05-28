<script>
	// Live scope + expiry summary shown BEFORE the user clicks "Create share link"
	// (issue #47 / U17). Reactive — recomputes when scope or expiresIn changes.
	let { scope = "journey", tripName = "", expiresIn = "7d" } = $props();

	const expiryDays = {
		"1d": 1,
		"7d": 7,
		"14d": 14,
		"30d": 30
	};

	const scopeLine = $derived(
		scope === "trip" && tripName
			? `Just trip "${tripName}" (events + memories in this trip).`
			: scope === "trip"
				? "Just this trip (events + memories in this trip)."
				: "All your journey memories (every completed event with a memory)."
	);

	const expiryLine = $derived.by(() => {
		if (expiresIn === "never") {
			return "Never expires — you can revoke it any time from your profile.";
		}
		const days = expiryDays[expiresIn];
		if (!days) return "";
		const expiry = new Date(Date.now() + days * 86_400_000);
		const formatted = new Intl.DateTimeFormat("en", {
			year: "numeric",
			month: "long",
			day: "numeric"
		}).format(expiry);
		return `${days} day${days === 1 ? "" : "s"} — expires on ${formatted}.`;
	});
</script>

<div class="share-scope-preview" role="note" aria-label="What this share link will expose">
	<p><strong>This link will share:</strong> {scopeLine}</p>
	<p><strong>Visible to:</strong> anyone with the link (no login required).</p>
	<p><strong>Valid for:</strong> {expiryLine}</p>
</div>

<style>
	.share-scope-preview {
		margin: 12px 0;
		padding: 10px 12px;
		border: 1px solid var(--notice-border);
		background: var(--notice-bg);
		color: var(--notice-fg);
		border-radius: 8px;
		display: grid;
		gap: 4px;
		font-size: 0.9rem;
	}

	.share-scope-preview p {
		margin: 0;
	}
</style>
