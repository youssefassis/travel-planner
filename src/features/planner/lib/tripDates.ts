import { addDays, isISODate, monthOfISODate } from "@/domain/dates";
import { TripIntent } from "../types";

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
