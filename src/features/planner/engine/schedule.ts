import { Coordinates, Pace } from "@/domain/types";
import { distanceKm } from "@/domain/geo";
import { Activity, DaySchedule, ItineraryDay, ScheduleItem } from "../types";
import {
  DAY_START_MIN,
  DINNER,
  LUNCH,
  PACE_BUDGET_HRS,
  WALK_MIN_PER_KM,
} from "./constants";

/** Above this price a restaurant reads as a dinner venue, not a lunch spot. */
const DINNER_PRICE_THRESHOLD = 30;

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
 * Turns a day's activities into a realistic timed schedule:
 * - daytime stops start at 09:30 with walking time between them,
 * - the plan's restaurants BECOME lunch/dinner (cheaper → lunch, pricier →
 *   dinner) instead of being visited mid-afternoon; generic "somewhere
 *   local" slots only appear when no restaurant is planned,
 * - nightlife lands after dinner, not at 11 AM,
 * - the whole day gets a relaxed/balanced/packed realism rating per pace.
 * Pure and deterministic.
 */
export function buildDaySchedule(day: ItineraryDay, pace: Pace): DaySchedule {
  const food = day.activities.filter((a) => a.category === "food");
  const nightlife = day.activities.filter((a) => a.category === "nightlife");
  const daytime = day.activities.filter(
    (a) => a.category !== "food" && a.category !== "nightlife"
  );

  // Assign restaurants to meal slots.
  let lunchVenue: Activity | undefined;
  let dinnerVenue: Activity | undefined;
  if (food.length >= 2) {
    const byPrice = [...food].sort((a, b) => a.price - b.price);
    lunchVenue = byPrice[0];
    dinnerVenue = byPrice[byPrice.length - 1];
    daytime.push(...byPrice.slice(1, -1)); // extra cafés stay daytime stops
  } else if (food.length === 1) {
    if (food[0].price >= DINNER_PRICE_THRESHOLD) dinnerVenue = food[0];
    else lunchVenue = food[0];
  }

  const items: ScheduleItem[] = [];
  let clock = DAY_START_MIN;
  let hadLunch = false;
  let prevLocation: Coordinates | null = null;

  const walkFrom = (to: Coordinates): number =>
    prevLocation === null
      ? 0
      : round5(Math.min(40, distanceKm(prevLocation, to) * WALK_MIN_PER_KM));

  const scheduleLunch = () => {
    const startMin = round5(Math.max(clock, LUNCH.earliestMin));
    const durationMin = lunchVenue ? lunchVenue.durationHrs * 60 : LUNCH.durationMin;
    items.push({
      kind: "meal",
      label: "Lunch",
      startMin,
      endMin: round5(startMin + durationMin),
      activity: lunchVenue,
    });
    clock = round5(startMin + durationMin);
    if (lunchVenue) prevLocation = lunchVenue.location;
    hadLunch = true;
  };

  for (const activity of daytime) {
    const walkMin = walkFrom(activity.location);
    clock += walkMin;

    if (!hadLunch && clock >= LUNCH.earliestMin) scheduleLunch();

    const startMin = round5(clock);
    const endMin = round5(startMin + activity.durationHrs * 60);
    items.push({ kind: "activity", activity, startMin, endMin, walkMin });
    clock = endMin;
    prevLocation = activity.location;
  }

  if (!hadLunch && day.activities.length > 0) scheduleLunch();

  // Dinner closes the daytime — at the planned restaurant when there is one.
  if (day.activities.length > 0) {
    const startMin = round5(Math.max(clock + 30, DINNER.earliestMin));
    const durationMin = dinnerVenue ? dinnerVenue.durationHrs * 60 : DINNER.durationMin;
    items.push({
      kind: "meal",
      label: "Dinner",
      startMin,
      endMin: round5(startMin + durationMin),
      activity: dinnerVenue,
    });
    clock = round5(startMin + durationMin);
    if (dinnerVenue) prevLocation = dinnerVenue.location;
  }

  // Nightlife belongs after dinner.
  for (const activity of nightlife) {
    const walkMin = walkFrom(activity.location);
    const startMin = round5(clock + Math.max(walkMin, 15));
    const endMin = round5(startMin + activity.durationHrs * 60);
    items.push({ kind: "activity", activity, startMin, endMin, walkMin });
    clock = endMin;
    prevLocation = activity.location;
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
