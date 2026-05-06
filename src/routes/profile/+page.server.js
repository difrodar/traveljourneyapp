import { listEvents, listIdeas, listLocations } from "$lib/server/repository.js";

export async function load({ locals }) {
	try {
		const [events, locations, ideas] = await Promise.all([
			listEvents(locals.user.id, { sort: "updatedDesc" }),
			listLocations(locals.user.id),
			listIdeas(locals.user.id)
		]);
		const plannedEvents = events.filter((event) => event.status === "planned");
		const completedMemories = events.filter((event) => event.status === "completed" && event.journeyEntry);
		const ratings = completedMemories.map((event) => Number(event.journeyEntry?.rating || 0)).filter(Boolean);
		const averageRating = ratings.length
			? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10
			: 0;

		return {
			user: locals.user,
			stats: {
				events: events.length,
				plannedEvents: plannedEvents.length,
				completedMemories: completedMemories.length,
				locations: locations.length,
				ideas: ideas.length,
				averageRating
			},
			recentActivity: events.slice(0, 3),
			setupError: ""
		};
	} catch (error) {
		return {
			user: locals.user,
			stats: {
				events: 0,
				plannedEvents: 0,
				completedMemories: 0,
				locations: 0,
				ideas: 0,
				averageRating: 0
			},
			recentActivity: [],
			setupError: error.message
		};
	}
}
