import { Activity, ItineraryDay } from "../types";

export function buildItinerary(activities: Activity[], days: number): ItineraryDay[] {
  const perDay = Math.ceil(activities.length / days);

  return Array.from({ length: days }).map((_, i) => {
    const start = i * perDay;
    const end = start + perDay;

    return {
      id: `day-${i + 1}`,
      label: `Day ${i + 1}`,
      city: activities[0]?.city || "Unknown",
      activities: activities.slice(start, end),
    };
  });
}
