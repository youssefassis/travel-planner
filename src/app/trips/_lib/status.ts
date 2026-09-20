import { tripProgress } from "@/features/planner/lib/today";
import { TripIntent, TripPlan } from "@/features/planner/types";

export type TripStatus = {
  label: string;
  tone: "brand" | "success" | "neutral";
};

/**
 * The one-glance state of a stored trip: how far away it is, which day it's
 * on, or that it's already a memory. Pure — the clock is passed in.
 */
export function tripStatus(
  plan: TripPlan,
  intent: TripIntent,
  todayISO: string,
): TripStatus {
  const progress = tripProgress(plan, intent.startDate, todayISO);
  switch (progress.phase) {
    case "undated":
      return { label: "No dates yet", tone: "neutral" };
    case "before":
      return {
        label:
          progress.daysUntil === 1
            ? "Starts tomorrow"
            : `Starts in ${progress.daysUntil} days`,
        tone: "brand",
      };
    case "during":
      return {
        label: `Day ${progress.dayNumber} of ${progress.dayCount}`,
        tone: "success",
      };
    case "after":
      return { label: "Past trip", tone: "neutral" };
  }
}
