<script>
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import Navigation from '$lib/components/Navigation.svelte';
	import { page } from '$app/state';

	let { children } = $props();
	const hideNavigation = $derived(/^\/events\/(?!new(?:\/|$))[^/]+$/.test(page.url.pathname));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if !hideNavigation}
	<Navigation />
{/if}
{@render children()}
