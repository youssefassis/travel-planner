/**
 * Calendar dates as `YYYY-MM-DD` strings. Every helper is pure and works in
 * UTC, so a date never shifts across a timezone boundary and the same input
 * always formats the same way — which is what keeps share links reproducible.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** True for a real calendar date written as `YYYY-MM-DD` (2026-02-30 is not). */
export function isISODate(value: string | null | undefined): value is string {
  if (!value || !ISO_DATE.test(value)) return false;
  const date = toUTC(value);
  return date !== null && toISODate(date) === value;
}

function toUTC(iso: string): Date | null {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(date.getTime()) ? null : date;
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** The calendar month of an ISO date, 0-11; null when it isn't a date. */
export function monthOfISODate(value: string | null | undefined): number | null {
  return isISODate(value) ? Number(value.slice(5, 7)) - 1 : null;
}

/** `iso` shifted by `days` (negative goes backwards). */
export function addDays(iso: string, days: number): string {
  const date = toUTC(iso);
  if (!date) return iso;
  date.setUTCDate(date.getUTCDate() + days);
  return toISODate(date);
}

/** "Wed 6 May" — the weekday and day a traveler reads on an itinerary. */
export function formatDayDate(iso: string): string {
  const date = toUTC(iso);
  if (!date) return "";
  return `${WEEKDAYS[date.getUTCDay()]} ${date.getUTCDate()} ${MONTHS_SHORT[date.getUTCMonth()]}`;
}

/** "4 – 12 May 2026", collapsing the month and year when they're shared. */
export function formatDateRange(startISO: string, endISO: string): string {
  const start = toUTC(startISO);
  const end = toUTC(endISO);
  if (!start || !end) return "";

  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();
  const startMonth = MONTHS_SHORT[start.getUTCMonth()];
  const endMonth = MONTHS_SHORT[end.getUTCMonth()];
  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();

  if (startYear !== endYear) {
    return `${startDay} ${startMonth} ${startYear} – ${endDay} ${endMonth} ${endYear}`;
  }
  if (startMonth !== endMonth) {
    return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${startYear}`;
  }
  return `${startDay} – ${endDay} ${startMonth} ${startYear}`;
}

/** Whole days from `fromISO` to `toISO`; negative when `toISO` is earlier. */
export function daysBetween(fromISO: string, toISO: string): number {
  const from = toUTC(fromISO);
  const to = toUTC(toISO);
  if (!from || !to) return 0;
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

/** `YYYYMMDD`, the date form the iCalendar spec wants. */
export function toICSDate(iso: string): string {
  return iso.replace(/-/g, "");
}
