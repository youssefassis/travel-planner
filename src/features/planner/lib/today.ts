import { daysBetween, isISODate } from "@/domain/dates";
import { DaySchedule, ItineraryDay, ScheduleItem, TripPlan } from "../types";

/**
 * Where the traveler is in their own trip, right now. This is the one place
 * in the planner that cares what day it is — everything else works in
 * Day 1..N — so the clock is always passed in rather than read, which keeps
 * these functions pure and testable against any moment.
 */

export type TripProgress =
  | { phase: "undated" }
  | { phase: "before"; daysUntil: number; firstDay: ItineraryDay }
  | { phase: "during"; dayNumber: number; dayCount: number; day: ItineraryDay }
  | { phase: "after"; daysSince: number };

/** Which day of the trip `todayISO` is, if any. */
export function tripProgress(
  plan: TripPlan,
  startDate: string | undefined,
  todayISO: string,
): TripProgress {
  if (!isISODate(startDate) || !isISODate(todayISO) || plan.itinerary.length === 0) {
    return { phase: "undated" };
  }

  const offset = daysBetween(startDate, todayISO);
  const dayCount = plan.itinerary.length;

  if (offset < 0) {
    return { phase: "before", daysUntil: -offset, firstDay: plan.itinerary[0] };
  }
  if (offset >= dayCount) {
    return { phase: "after", daysSince: offset - dayCount + 1 };
  }
  return {
    phase: "during",
    dayNumber: offset + 1,
    dayCount,
    day: plan.itinerary[offset],
  };
}

export type NowNext = {
  /** What's happening at this minute, if anything. */
  current: ScheduleItem | null;
  /** The next thing to head to. */
  next: ScheduleItem | null;
  /** Already finished, oldest first. */
  done: ScheduleItem[];
  /** Still to come, `next` included. */
  upcoming: ScheduleItem[];
};

/**
 * Splits a day's schedule around the current minute. An item counts as
 * current while the traveler is in it, so "now" survives a long dinner.
 */
export function nowAndNext(
  schedule: DaySchedule,
  minutesSinceMidnight: number,
): NowNext {
  const done: ScheduleItem[] = [];
  const upcoming: ScheduleItem[] = [];
  let current: ScheduleItem | null = null;

  for (const item of schedule.items) {
    if (item.endMin <= minutesSinceMidnight) {
      done.push(item);
    } else if (item.startMin <= minutesSinceMidnight) {
      current = item;
    } else {
      upcoming.push(item);
    }
  }

  return { current, next: upcoming[0] ?? null, done, upcoming };
}

/** Local calendar date as `YYYY-MM-DD` — the traveler's today, not UTC's. */
export function localISODate(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Minutes since local midnight. */
export function localMinutes(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}
