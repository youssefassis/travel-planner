import { City, Poi, PoiCategory } from "@/domain/types";
import { distanceKm } from "@/domain/geo";
import { Activity, DayTravelSlots, ItineraryDay, TripIntent } from "../types";
import {
  ACTIVITIES_PER_DAY,
  BOOK_AHEAD_PRICE,
  CATEGORY_TO_INTERESTS,
  DURATION_BY_CATEGORY,
  PACE_BUDGET_HRS,
} from "./constants";

function matchesInterests(category: PoiCategory, intent: TripIntent): boolean {
  return CATEGORY_TO_INTERESTS[category].some((i) => intent.interests.includes(i));
}

function rankPois(pois: Poi[], intent: TripIntent): Poi[] {
  const budget = intent.vibe.budget;

  return pois.slice().sort((a, b) => {
    const aMatches = matchesInterests(a.category, intent);
    const bMatches = matchesInterests(b.category, intent);
    if (aMatches !== bMatches) return aMatches ? -1 : 1;

    if (budget === "backpacker" && a.price !== b.price) return a.price - b.price;
    if (budget === "luxury" && a.price !== b.price) return b.price - a.price;

    return a.id.localeCompare(b.id);
  });
}

function buildWhy(poi: Poi, intent: TripIntent, mustSee: boolean): string {
  const matched = CATEGORY_TO_INTERESTS[poi.category].filter((i) =>
    intent.interests.includes(i)
  );
  if (matched.length > 0) {
    return `Matches your ${matched.join(" and ")} interest${matched.length > 1 ? "s" : ""}`;
  }
  return mustSee ? "A city highlight most visitors rate" : "Rounds out the day nearby";
}

export function toActivity(
  poi: Poi,
  city: City,
  intent: TripIntent,
  mustSee: boolean
): Activity {
  return {
    id: poi.id,
    name: poi.name,
    category: poi.category,
    price: poi.price,
    location: poi.coords,
    cityId: city.id,
    city: city.name,
    durationHrs: DURATION_BY_CATEGORY[poi.category],
    mustSee,
    bookAhead: poi.price >= BOOK_AHEAD_PRICE || poi.category === "museum",
    why: buildWhy(poi, intent, mustSee),
  };
}

function fillerActivity(city: City, dayIndex: number, slot: number): Activity {
  return {
    id: `${city.id}-explore-${dayIndex}-${slot}`,
    name: `Explore ${city.name} at your own pace`,
    category: "activity",
    price: 0,
    location: city.coords,
    cityId: city.id,
    city: city.name,
    durationHrs: 1.5,
    mustSee: false,
    bookAhead: false,
    why: "Free time to wander wherever looks inviting",
  };
}

/** Picks the next unused POI, preferring one whose category hasn't been used
 * yet today; falls back to the top-ranked unused POI if that would leave no
 * options (i.e. every remaining POI repeats a category already scheduled today). */
function pickNextPoi(ranked: Poi[], used: Set<string>, usedCategoriesToday: Set<PoiCategory>): Poi | undefined {
  const unused = ranked.filter((p) => !used.has(p.id));
  if (unused.length === 0) return undefined;
  return unused.find((p) => !usedCategoriesToday.has(p.category)) ?? unused[0];
}

/**
 * Orders a day's activities geographically (nearest-neighbor from the city
 * center) so the traveler never backtracks across town.
 */
export function orderDayActivities(activities: Activity[], city: City): Activity[] {
  if (activities.length <= 2) return activities;
  const remaining = [...activities];
  const ordered: Activity[] = [];
  let cursor = city.coords;

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = distanceKm(cursor, remaining[i].location);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    const next = remaining.splice(bestIdx, 1)[0];
    ordered.push(next);
    cursor = next.location;
  }

  return ordered;
}

/**
 * How many stops a day can hold once its travel is paid for. A day that
 * loses three hours to a flight can't absorb what a free day can — always
 * at least one, so no day in a city is empty.
 */
function activitiesForDay(
  perDay: number,
  budgetHrs: number,
  slot: DayTravelSlots,
): number {
  const travelHrs =
    (slot.arrival?.durationHrs ?? 0) + (slot.departure?.durationHrs ?? 0);
  if (travelHrs <= 0) return perDay;

  const available = Math.max(0, budgetHrs - travelHrs);
  const scaled = Math.round((perDay * available) / budgetHrs);
  return Math.min(perDay, Math.max(1, scaled));
}

export function buildCityDayPlans(
  city: City,
  days: number,
  intent: TripIntent,
  startDayIndex: number,
  /** What travel brackets each day of this stay; defaults to none. */
  travel: DayTravelSlots[] = []
): ItineraryDay[] {
  const perDay = ACTIVITIES_PER_DAY[intent.vibe.pace];
  const budgetHrs = PACE_BUDGET_HRS[intent.vibe.pace];
  const slotFor = (d: number): DayTravelSlots => travel[d] ?? {};
  const capacity = Array.from({ length: days }, (_, d) =>
    activitiesForDay(perDay, budgetHrs, slotFor(d)),
  );
  const ranked = rankPois(city.pois, intent);
  // The top interest-matched POIs across the stay are the must-sees —
  // roughly one per day. With no stated interests, the city's top-ranked
  // highlights take that role instead.
  const interestMatched = ranked.filter((p) => matchesInterests(p.category, intent));
  const mustSeePool = interestMatched.length > 0 ? interestMatched : ranked;
  const mustSeeIds = new Set(mustSeePool.slice(0, days).map((p) => p.id));
  const used = new Set<string>();

  const dayActivities: Activity[][] = Array.from({ length: days }, () => []);
  const dayCategories: Set<PoiCategory>[] = Array.from({ length: days }, () => new Set());

  for (let slot = 0; slot < perDay; slot++) {
    for (let d = 0; d < days; d++) {
      if (slot >= capacity[d]) continue;
      const poi = pickNextPoi(ranked, used, dayCategories[d]);
      if (poi) {
        used.add(poi.id);
        dayCategories[d].add(poi.category);
        dayActivities[d].push(toActivity(poi, city, intent, mustSeeIds.has(poi.id)));
      } else {
        dayActivities[d].push(fillerActivity(city, startDayIndex + d, slot));
      }
    }
  }

  return dayActivities.map((activities, i) => {
    const dayIndex = startDayIndex + i;
    const { arrival, departure } = slotFor(i);
    return {
      id: `day-${dayIndex}-${city.id}`,
      label: `Day ${dayIndex}`,
      cityId: city.id,
      city: city.name,
      activities: orderDayActivities(activities, city),
      arrival,
      departure,
    };
  });
}
