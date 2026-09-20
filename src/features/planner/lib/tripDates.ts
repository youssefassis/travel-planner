import { addDays, isISODate, monthOfISODate } from "@/domain/dates";
import { TripIntent, TripPlan } from "../types";

/**
 * The trip's calendar. `startDate` is optional — a plan works without it —
 * but when it is set it pins `travelMonth` too, so the two can never
 * disagree. Every write to either goes through here.
 *
 * The engine stays date-free: it plans in Day 1..N and these helpers map
 * those onto the calendar, which is what keeps a share link reproducible.
 */

/** Patch for choosing an exact start date; an invalid date clears both. */
export function withStartDate(
  iso: string,
): Pick<TripIntent, "startDate" | "travelMonth"> {
  if (!isISODate(iso)) return { startDate: undefined, travelMonth: undefined };
  return { startDate: iso, travelMonth: monthOfISODate(iso) ?? undefined };
}

/** Patch for choosing a loose month: the exact date no longer holds. */
export function withTravelMonth(
  month: number | undefined,
): Pick<TripIntent, "startDate" | "travelMonth"> {
  return { startDate: undefined, travelMonth: month };
}

/** The calendar date of day `dayNumber` (1-based), or null when undated. */
export function dateOfDay(
  startDate: string | undefined,
  dayNumber: number,
): string | null {
  if (!isISODate(startDate) || dayNumber < 1) return null;
  return addDays(startDate, dayNumber - 1);
}

/** The trip's last day, or null when undated. */
export function endDate(
  startDate: string | undefined,
  totalDays: number,
): string | null {
  return dateOfDay(startDate, totalDays);
}

/**
 * When the traveler leaves for each leg, keyed by leg id. The outbound goes
 * on day 1, an inter-city leg on the day its destination's stay begins, and
 * the homebound on the trip's last day. Empty when the trip has no dates.
 */
export function legDepartureDates(
  plan: TripPlan,
  startDate: string | undefined,
): Map<string, string> {
  const dates = new Map<string, string>();
  if (!isISODate(startDate)) return dates;

  if (plan.outbound) dates.set(plan.outbound.id, startDate);

  let day = 1;
  plan.stops.forEach((stop, i) => {
    day += stop.days;
    const leg = plan.legs[i];
    if (leg) dates.set(leg.id, addDays(startDate, day - 1));
  });

  const lastDay = plan.itinerary.length;
  if (plan.homebound && lastDay > 0) {
    dates.set(plan.homebound.id, addDays(startDate, lastDay - 1));
  }

  return dates;
}
