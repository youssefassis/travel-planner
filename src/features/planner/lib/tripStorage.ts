import { formatDateRange } from "@/domain/dates";
import { Bookings, TripIntent, TripPlan } from "../types";
import { endDate } from "./tripDates";

/**
 * Trips kept in the browser. A plan is the product of editing, so the plan
 * itself is stored rather than just the intent — replanning edits (a swapped
 * stop, an added city) can't be reconstructed from the wizard's answers.
 *
 * Nothing here throws: storage is unavailable in private windows and can be
 * full or disabled, and none of that should cost the traveler their session.
 * The pure functions carry the logic so they can be tested without a DOM.
 */

/** Bump when the stored shape changes — old entries are then simply ignored. */
const DRAFT_KEY = "wanderly.v1.draft";
const TRIPS_KEY = "wanderly.v1.trips";

/** Keeps localStorage bounded; the oldest saved trip falls off the end. */
export const MAX_SAVED_TRIPS = 12;

export type StoredTrip = {
  id: string;
  name: string;
  /** Epoch millis, newest first in the list. */
  savedAt: number;
  intent: TripIntent;
  plan: TripPlan;
  bookings: Bookings;
};

/** The trip the traveller was last looking at, exactly as they left it. */
export type Draft = {
  intent: TripIntent;
  plan: TripPlan;
  bookings: Bookings;
};

/* ─── Pure ──────────────────────────────────────────────────────── */

/** "Rome → Florence · 4 – 12 May 2026", or the day count when undated. */
export function tripName(plan: TripPlan, intent: TripIntent): string {
  const route = plan.stops.map((stop) => stop.city).join(" → ") || "Trip";
  const days = plan.itinerary.length;
  const last = endDate(intent.startDate, days);
  const when =
    intent.startDate && last
      ? formatDateRange(intent.startDate, last)
      : `${days} ${days === 1 ? "day" : "days"}`;
  return `${route} · ${when}`;
}

/** A trip's identity: the same route on the same dates is the same trip. */
export function tripId(plan: TripPlan, intent: TripIntent): string {
  return `${plan.id}@${intent.startDate ?? "undated"}`;
}

/** Newest first, re-saving a trip in place, capped at `MAX_SAVED_TRIPS`. */
export function upsertTrip(trips: StoredTrip[], entry: StoredTrip): StoredTrip[] {
  return [entry, ...trips.filter((t) => t.id !== entry.id)].slice(
    0,
    MAX_SAVED_TRIPS,
  );
}

export function removeTrip(trips: StoredTrip[], id: string): StoredTrip[] {
  return trips.filter((trip) => trip.id !== id);
}

/** True when the value has the shape the app can actually render. */
function isTripLike(value: unknown): value is { intent: TripIntent; plan: TripPlan } {
  if (typeof value !== "object" || value === null) return false;
  const { intent, plan } = value as { intent?: unknown; plan?: unknown };
  if (typeof intent !== "object" || intent === null) return false;
  if (typeof plan !== "object" || plan === null) return false;
  const p = plan as Partial<TripPlan>;
  return (
    Array.isArray(p.stops) &&
    Array.isArray(p.itinerary) &&
    Array.isArray(p.legs) &&
    typeof p.budget === "object" &&
    p.budget !== null
  );
}

/** Bookings arrived after the first stored trips — absent means none. */
function readBookings(value: unknown): Bookings {
  const bookings = (value as { bookings?: unknown }).bookings;
  return typeof bookings === "object" && bookings !== null
    ? (bookings as Bookings)
    : {};
}

/** Parses stored JSON, dropping anything that no longer fits the app. */
export function parseTrips(raw: string | null): StoredTrip[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (entry): entry is StoredTrip =>
          isTripLike(entry) &&
          typeof (entry as StoredTrip).id === "string" &&
          typeof (entry as StoredTrip).name === "string",
      )
      .map((entry) => ({ ...entry, bookings: readBookings(entry) }));
  } catch {
    return [];
  }
}

/** Parses a stored draft, or null when there isn't a usable one. */
export function parseDraft(raw: string | null): Draft | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isTripLike(parsed)) return null;
    return {
      intent: parsed.intent,
      plan: parsed.plan,
      bookings: readBookings(parsed),
    };
  } catch {
    return null;
  }
}

/* ─── Browser storage ───────────────────────────────────────────── */

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private mode, quota, or storage disabled — the trip lives on in memory.
  }
}

function clear(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Nothing to do; the caller has already dropped it from state.
  }
}

/** The trip the traveler was last looking at, restored after a refresh. */
export function loadDraft(): Draft | null {
  return parseDraft(read(DRAFT_KEY));
}

export function saveDraft(draft: Draft): void {
  write(DRAFT_KEY, JSON.stringify(draft));
}

export function clearDraft(): void {
  clear(DRAFT_KEY);
}

export function loadTrips(): StoredTrip[] {
  return parseTrips(read(TRIPS_KEY));
}

export function saveTrips(trips: StoredTrip[]): void {
  write(TRIPS_KEY, JSON.stringify(trips));
}
