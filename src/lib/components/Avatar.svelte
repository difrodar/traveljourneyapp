<script>
	let { username = "", avatarUrl = "", size = 36, ariaHidden = false } = $props();

	function hueFromUsername(name) {
		const value = String(name || "");
		let hash = 0;
		for (let i = 0; i < value.length; i += 1) {
			hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
		}
		return hash % 360;
	}

	const initial = $derived(String(username || "?").trim().slice(0, 1).toUpperCase() || "?");
	const hue = $derived(hueFromUsername(username));
	const fontSize = $derived(Math.round(size * 0.45));
	const styleVars = $derived(
		`--avatar-size: ${size}px; --avatar-hue: ${hue}; --avatar-font-size: ${fontSize}px;`
	);
</script>

{#if avatarUrl}
	<span class="avatar avatar-image" style={styleVars} aria-hidden={ariaHidden}>
		<img src={avatarUrl} alt={ariaHidden ? "" : `${username} avatar`} />
	</span>
{:else}
	<span class="avatar avatar-letter" style={styleVars} aria-hidden={ariaHidden}>
		<span aria-hidden="true">{initial}</span>
	</span>
{/if}

<style>
	.avatar {
		display: inline-grid;
		place-items: center;
		width: var(--avatar-size);
		height: var(--avatar-size);
		border-radius: 50%;
		overflow: hidden;
		flex: 0 0 auto;
	}

	.avatar-letter {
		background: linear-gradient(
			135deg,
			hsl(var(--avatar-hue) 70% 55%),
			hsl(calc(var(--avatar-hue) + 30) 70% 45%)
		);
		color: white;
		font-weight: 900;
		font-size: var(--avatar-font-size);
		line-height: 1;
		letter-spacing: 0;
	}

	.avatar-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
