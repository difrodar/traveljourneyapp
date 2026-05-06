import { getDashboardData } from "$lib/server/repository.js";

export async function load({ locals, url }) {
	const month = url.searchParams.get("month") || "";
	try {
		return { ...(await getDashboardData(locals.user.id, { month })), setupError: "" };
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
			journeyHighlights: []
		};
	}
}
