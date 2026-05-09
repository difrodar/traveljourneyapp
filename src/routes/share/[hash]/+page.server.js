import { error } from "@sveltejs/kit";
import { findActiveShareByHash, getPublicJourneyForShare } from "$lib/server/repository.js";

export async function load({ params, setHeaders }) {
	const share = await findActiveShareByHash(params.hash);
	if (!share) throw error(404, "Share not found or expired.");
	const journey = await getPublicJourneyForShare(share);
	setHeaders({
		"cache-control": "private, no-store",
		"referrer-policy": "no-referrer",
		"x-robots-tag": "noindex"
	});
	return { journey };
}
