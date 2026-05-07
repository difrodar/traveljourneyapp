import { listEvents, listIdeas, listInvitedEvents, listLocations } from "$lib/server/repository.js";

export async function load({ locals }) {
	try {
		const [events, invitedEvents, locations, ideas] = await Promise.all([
			listEvents(locals.user.id, { sort: "updatedDesc" }),
			listInvitedEvents(locals.user.id),
			listLocations(locals.user.id),
			listIdeas(locals.user.id)
		]);
		const plannedEvents = events.filter((event) => event.status === "planned");
		const completedMemories = events.filter((event) => event.status === "completed" && event.journeyEntry);

		return {
			user: locals.user,
			stats: {
				events: events.length,
				invitedEvents: invitedEvents.length,
				plannedEvents: plannedEvents.length,
				completedMemories: completedMemories.length,
				locations: locations.length,
				ideas: ideas.length
			},
			recentActivity: events.slice(0, 3),
			invitedEvents,
			setupError: ""
		};
	} catch (error) {
		return {
			user: locals.user,
			stats: {
				events: 0,
				invitedEvents: 0,
				plannedEvents: 0,
				completedMemories: 0,
				locations: 0,
				ideas: 0
			},
			recentActivity: [],
			invitedEvents: [],
			setupError: error.message
		};
	}
}
