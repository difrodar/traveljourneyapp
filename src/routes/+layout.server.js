import {
	listDueReminders,
	listEventsAwaitingMemory,
	listInvitedEvents
} from "$lib/server/repository.js";

function trim(events) {
	return events.map((event) => ({
		id: event.id,
		title: event.title,
		date: event.date,
		city: event.location?.city || "",
		ownerName: event.owner?.name || ""
	}));
}

function trimReminders(events) {
	return events.map((event) => ({
		id: event.id,
		title: event.title,
		date: event.date,
		city: event.location?.city || "",
		dueLabel: event.reminderState?.dueLabel || ""
	}));
}

export async function load({ locals }) {
	if (!locals.user) {
		return { user: null, notifications: null };
	}
	let notifications = null;
	try {
		const [invited, memoryEvents, dueReminders] = await Promise.all([
			listInvitedEvents(locals.user.id),
			listEventsAwaitingMemory(locals.user.id, Infinity),
			listDueReminders(locals.user.id, Infinity)
		]);
		const pendingInvitations = invited.filter((event) => event.invitationStatus === "invited");
		notifications = {
			invitations: trim(pendingInvitations.slice(0, 5)),
			memoryPrompts: trim(memoryEvents.slice(0, 5)),
			reminders: trimReminders(dueReminders.slice(0, 5)),
			invitationsCount: pendingInvitations.length,
			memoryPromptsCount: memoryEvents.length,
			remindersCount: dueReminders.length,
			totalCount: pendingInvitations.length + memoryEvents.length + dueReminders.length
		};
	} catch {
		notifications = null;
	}
	return { user: locals.user, notifications };
}
