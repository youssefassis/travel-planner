import { Pace } from "@/domain/types";
import { addDays, toICSDate } from "@/domain/dates";
import { buildDaySchedule } from "../engine";
import { ScheduleItem, TripPlan } from "../types";
import { dateOfDay } from "./tripDates";

/**
 * The itinerary as an iCalendar file, one event per scheduled stop or meal.
 *
 * Times are written as floating local times (no timezone, no Z), which is
 * what a travel itinerary wants: dinner at 19:00 means 19:00 where the
 * traveler is standing, not 19:00 back home.
 *
 * Pure and deterministic like the rest of the planner — the timestamp is
 * derived from the trip's own start date, never the clock.
 */

const CRLF = "\r\n";

/** Escape RFC 5545 TEXT: backslash, semicolon, comma, and newlines. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Fold to the spec's 75-octet limit; continuation lines start with a space. */
function fold(line: string): string {
  if (line.length <= 75) return line;
  const parts = [line.slice(0, 75)];
  for (let i = 75; i < line.length; i += 74) {
    parts.push(` ${line.slice(i, i + 74)}`);
  }
  return parts.join(CRLF);
}

/**
 * A `YYYYMMDDTHHMMSS` stamp for `minutes` past midnight on `date`. Minutes
 * past 24h roll into the following day — a nightlife stop can end at 01:00.
 */
function stamp(date: string, minutes: number): string {
  const dayOffset = Math.floor(minutes / 1440);
  const inDay = minutes % 1440;
  const hours = String(Math.floor(inDay / 60)).padStart(2, "0");
  const mins = String(inDay % 60).padStart(2, "0");
  return `${toICSDate(addDays(date, dayOffset))}T${hours}${mins}00`;
}

function itemTitle(item: ScheduleItem): string {
  if (item.kind === "activity") return item.activity.name;
  if (item.kind === "travel") {
    const verb = item.direction === "arrive" ? "Travel to" : "Home to";
    return `${verb} ${item.travel.to}`;
  }
  return item.activity ? `${item.label} — ${item.activity.name}` : item.label;
}

function itemUid(item: ScheduleItem, date: string): string {
  let key: string;
  if (item.kind === "activity") key = item.activity.id;
  else if (item.kind === "travel") key = `${item.direction}-${item.travel.legId}`;
  else key = `${item.label.toLowerCase()}-${item.startMin}`;
  return `${key}-${toICSDate(date)}@wanderly`;
}

function itemDescription(item: ScheduleItem): string | null {
  if (item.kind === "travel") {
    return `${item.travel.durationHrs}h ${item.travel.mode} from ${item.travel.from}`;
  }
  if (item.kind !== "activity") return null;
  const parts = [
    item.activity.why,
    item.activity.price > 0 ? `≈ €${item.activity.price} per person` : null,
    item.activity.bookAhead ? "Book ahead" : null,
  ].filter(Boolean) as string[];
  return parts.length > 0 ? parts.join(" · ") : null;
}

/**
 * The plan as an `.ics` document, or null when the trip has no dates —
 * there is nothing to put on a calendar without them.
 */
export function planToICS(
  plan: TripPlan,
  pace: Pace,
  startDate: string | undefined,
): string | null {
  if (!dateOfDay(startDate, 1)) return null;

  const dtstamp = `${toICSDate(startDate as string)}T000000Z`;
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wanderly//Trip Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  plan.itinerary.forEach((day, index) => {
    const date = dateOfDay(startDate, index + 1);
    if (!date) return;

    for (const item of buildDaySchedule(day, pace).items) {
      const description = itemDescription(item);
      lines.push(
        "BEGIN:VEVENT",
        `UID:${itemUid(item, date)}`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${stamp(date, item.startMin)}`,
        `DTEND:${stamp(date, item.endMin)}`,
        `SUMMARY:${escapeText(itemTitle(item))}`,
        `LOCATION:${escapeText(item.kind === "travel" ? item.travel.to : day.city)}`,
      );
      if (description) lines.push(`DESCRIPTION:${escapeText(description)}`);
      lines.push("END:VEVENT");
    }
  });

  lines.push("END:VCALENDAR");
  return lines.map(fold).join(CRLF) + CRLF;
}

/** A filename a traveler will recognise in their downloads folder. */
export function icsFilename(plan: TripPlan): string {
  const route = plan.stops
    .map((stop) => stop.city.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
    .join("-");
  return `wanderly-${route || "trip"}.ics`;
}
