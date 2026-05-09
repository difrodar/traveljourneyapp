import { getDashboardData, listInvitedEvents } from "$lib/server/repository.js";

export async function load({ locals, url }) {
	const month = url.searchParams.get("month") || "";
	try {
		const [dashboard, invited] = await Promise.all([
			getDashboardData(locals.user.id, { month }),
			listInvitedEvents(locals.user.id)
		]);
		const pendingInvitationCount = invited.filter((event) => event.invitationStatus === "invited").length;
		return {
			...dashboard,
			pendingInvitationCount,
			pendingInvitationLink: "/events?status=invited",
			setupError: ""
		};
	} catch (error) {
		return {
			setupError: error.message,
			calendar: {
				monthLabel: "",
				monthParam: "",
				currentMonthParam: "",
				isSelectedCurrentMonth: true,
				previousMonthParam: "",
				nextMonthParam: "",
				weekdayLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
				hasMonthEvents: false,
				weeks: []
			},
			upcomingSoonEvents: [],
			journeyHighlights: [],
			pendingInvitationCount: 0,
			pendingInvitationLink: "/events?status=invited"
		};
	}
}
