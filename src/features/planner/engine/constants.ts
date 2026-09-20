import { BudgetTier, Interest, Pace, PoiCategory } from "@/domain/types";

export const ACTIVITIES_PER_DAY: Record<Pace, number> = {
  chill: 2,
  balanced: 3,
  intense: 4,
};

export const AVG_STAY_DAYS: Record<Pace, number> = {
  chill: 3.5,
  balanced: 3,
  intense: 2,
};

export const MAX_CITIES = 8;

export const TIER_TRANSPORT_MULT: Record<BudgetTier, number> = {
  backpacker: 0.85,
  comfort: 1,
  luxury: 1.6,
};

export const STAY_SHARE: Record<"solo" | "couple" | "group", number> = {
  solo: 1,
  couple: 0.65,
  group: 0.55,
};

/** How many people a trip is priced and booked for. */
export const PARTY_SIZE: Record<"solo" | "couple" | "group", number> = {
  solo: 1,
  couple: 2,
  group: 4,
};

export const CATEGORY_TO_INTERESTS: Record<PoiCategory, Interest[]> = {
  sight: ["culture", "history"],
  museum: ["culture", "art", "history"],
  food: ["food"],
  nature: ["nature", "adventure"],
  nightlife: ["nightlife"],
  activity: ["adventure", "culture"],
};

/* ─── Day scheduling ────────────────────────────────────────────── */

/** Typical visit length per POI category, in hours. */
export const DURATION_BY_CATEGORY: Record<PoiCategory, number> = {
  sight: 1.5,
  museum: 2,
  food: 1.5,
  nature: 2,
  nightlife: 2,
  activity: 2,
};

/** The day starts here (minutes since midnight). */
export const DAY_START_MIN = 9.5 * 60; // 09:30

export const LUNCH = { earliestMin: 12.5 * 60, durationMin: 60 }; // ~12:30, 1h
export const DINNER = { earliestMin: 19 * 60, durationMin: 90 }; // ~19:00, 1.5h

/** Average walking pace between stops, minutes per km. */
export const WALK_MIN_PER_KM = 12;

/** How many planned activity-hours per day each pace comfortably absorbs. */
export const PACE_BUDGET_HRS: Record<Pace, number> = {
  chill: 5,
  balanced: 6.5,
  intense: 8,
};

/** Activities at or above this price usually need booking ahead. */
export const BOOK_AHEAD_PRICE = 15;

/** Categories that suffer in the rain (swapped out by rain-friendly replanning). */
export const OUTDOOR_CATEGORIES: PoiCategory[] = ["sight", "nature"];
