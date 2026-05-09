<script>
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import Navigation from '$lib/components/Navigation.svelte';
	import { page } from '$app/state';

	let { children, data } = $props();
	const hideNavigation = $derived(
		page.url.pathname === "/login"
		|| page.url.pathname.startsWith("/share/")
		|| /^\/events\/(?!new(?:\/|$))[^/]+$/.test(page.url.pathname)
	);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if !hideNavigation}
	<Navigation user={data.user} />
{/if}
{@render children()}
