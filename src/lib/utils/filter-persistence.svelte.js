import { browser } from "$app/environment";
import { goto } from "$app/navigation";
import { page } from "$app/state";

const PREFIX = "triptales:filter:";

export function rememberFilters(routeKey) {
	if (!browser) return;
	const storageKey = PREFIX + routeKey;
	let firstRun = true;
	$effect(() => {
		const search = page.url.search;
		if (firstRun) {
			firstRun = false;
			if (search === "") {
				const stored = sessionStorage.getItem(storageKey);
				if (stored) {
					const params = stored.startsWith("?") ? stored : "?" + stored;
					goto(params, { replaceState: true, keepFocus: true, noScroll: true });
					return;
				}
			}
		}
		if (search !== "") {
			sessionStorage.setItem(storageKey, search);
		}
	});
}

export function clearRememberedFilters(routeKey) {
	if (!browser) return;
	sessionStorage.removeItem(PREFIX + routeKey);
}
