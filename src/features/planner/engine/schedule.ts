import { Pace } from "@/domain/types";
import { distanceKm } from "@/domain/geo";
import { DaySchedule, ItineraryDay, ScheduleItem } from "../types";
import {
  DAY_START_MIN,
  DINNER,
  LUNCH,
  PACE_BUDGET_HRS,
  WALK_MIN_PER_KM,
} from "./constants";

/** Round minutes to the nearest 5 for human-friendly times. */
function round5(minutes: number): number {
  return Math.round(minutes / 5) * 5;
}

export function formatClock(minutesSinceMidnight: number): string {
  const clamped = Math.max(0, Math.round(minutesSinceMidnight));
  const hours = Math.floor(clamped / 60) % 24;
  const minutes = clamped % 60;
  const period = hours < 12 ? "AM" : "PM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

/**
 * Turns a day's activities into a realistic timed schedule: visits start at
 * 09:30, walking time separates stops, lunch lands after 12:30, and dinner
 * is appended once the afternoon wraps. Answers "is this day realistic?"
 * with a load rating against the traveler's pace. Pure and deterministic.
 */
export function buildDaySchedule(day: ItineraryDay, pace: Pace): DaySchedule {
  const items: ScheduleItem[] = [];
  let clock = DAY_START_MIN;
  let hadLunch = false;

  day.activities.forEach((activity, index) => {
    const walkMin =
      index === 0
        ? 0
        : round5(
            Math.min(
              40,
              distanceKm(day.activities[index - 1].location, activity.location) *
                WALK_MIN_PER_KM
            )
          );
    clock += walkMin;

    // Slot lunch before the next activity once it's lunchtime.
    if (!hadLunch && clock >= LUNCH.earliestMin) {
      items.push({
        kind: "meal",
        label: "Lunch",
        startMin: clock,
        endMin: clock + LUNCH.durationMin,
      });
      clock += LUNCH.durationMin;
      hadLunch = true;
    }

    const startMin = round5(clock);
    const endMin = round5(startMin + activity.durationHrs * 60);
    items.push({ kind: "activity", activity, startMin, endMin, walkMin });
    clock = endMin;
  });

  // Lunch even on light mornings.
  if (!hadLunch && day.activities.length > 0) {
    const startMin = Math.max(clock, LUNCH.earliestMin);
    items.push({
      kind: "meal",
      label: "Lunch",
      startMin,
      endMin: startMin + LUNCH.durationMin,
    });
    clock = startMin + LUNCH.durationMin;
  }

  // Dinner closes the day.
  if (day.activities.length > 0) {
    const startMin = Math.max(clock + 30, DINNER.earliestMin);
    items.push({
      kind: "meal",
      label: "Dinner",
      startMin,
      endMin: startMin + DINNER.durationMin,
    });
  }

  const busyMin = items.reduce((sum, item) => {
    const span = item.endMin - item.startMin;
    return sum + span + (item.kind === "activity" ? item.walkMin : 0);
  }, 0);
  const busyHrs = Math.round((busyMin / 60) * 10) / 10;

  const budget = PACE_BUDGET_HRS[pace];
  const activityHrs = day.activities.reduce((sum, a) => sum + a.durationHrs, 0);

  let load: DaySchedule["load"];
  let loadNote: string;
  if (activityHrs > budget) {
    load = "packed";
    loadNote = `Packed for a ${pace} pace — consider dropping an optional stop`;
  } else if (activityHrs < budget * 0.55) {
    load = "relaxed";
    loadNote = "Plenty of breathing room — space for a spontaneous find";
  } else {
    load = "balanced";
    loadNote = `Comfortable for a ${pace} pace`;
  }

  return { items, busyHrs, load, loadNote };
}
