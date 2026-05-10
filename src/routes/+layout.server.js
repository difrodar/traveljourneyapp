import { listEventsAwaitingMemory, listInvitedEvents } from "$lib/server/repository.js";

function trim(events) {
	return events.map((event) => ({
		id: event.id,
		title: event.title,
		date: event.date,
		city: event.location?.city || "",
		ownerName: event.owner?.name || ""
	}));
}

export async function load({ locals }) {
	if (!locals.user) {
		return { user: null, notifications: null };
	}
	let notifications = null;
	try {
		const [invited, memoryEvents] = await Promise.all([
			listInvitedEvents(locals.user.id),
			listEventsAwaitingMemory(locals.user.id, Infinity)
		]);
		const pendingInvitations = invited.filter((event) => event.invitationStatus === "invited");
		notifications = {
			invitations: trim(pendingInvitations.slice(0, 5)),
			memoryPrompts: trim(memoryEvents.slice(0, 5)),
			invitationsCount: pendingInvitations.length,
			memoryPromptsCount: memoryEvents.length,
			totalCount: pendingInvitations.length + memoryEvents.length
		};
	} catch {
		notifications = null;
	}
	return { user: locals.user, notifications };
}
