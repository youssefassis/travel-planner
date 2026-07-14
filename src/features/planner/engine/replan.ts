import { City } from "@/domain/types";
import { CITIES } from "@/domain/cities";
import { Activity, ItineraryDay, TripIntent, TripPlan } from "../types";
import { OUTDOOR_CATEGORIES } from "./constants";
import { orderDayActivities, toActivity } from "./dayPlans";
import { computeBudget } from "./budget";

/**
 * Replanning primitives: pure functions that take the current plan and
 * return a new one — the schedule, day ordering, and budget all update
 * automatically. This is what makes the plan feel alive instead of fixed.
 */

function findCity(cities: City[], id: string): City | undefined {
  return cities.find((c) => c.id === id);
}

/** Every real POI id already used anywhere in the plan. */
function usedPoiIds(plan: TripPlan): Set<string> {
  return new Set(
    plan.itinerary.flatMap((day) => day.activities.map((a) => a.id))
  );
}

function rebuildPlan(plan: TripPlan, intent: TripIntent, cities: City[], note?: string): TripPlan {
  const stopCities = plan.stops
    .map((stop) => findCity(cities, stop.cityId))
    .filter((c): c is City => c !== undefined);

  return {
    ...plan,
    itinerary: plan.stops.flatMap((s) => s.dayPlans),
    budget: computeBudget(plan.stops, plan.legs, intent, stopCities),
    notes: note ? [...plan.notes, note] : plan.notes,
  };
}

function replaceDay(
  plan: TripPlan,
  dayId: string,
  transform: (day: ItineraryDay, city: City) => ItineraryDay | null,
  cities: City[]
): TripPlan | null {
  let changed = false;
  const stops = plan.stops.map((stop) => {
    const dayIndex = stop.dayPlans.findIndex((d) => d.id === dayId);
    if (dayIndex === -1) return stop;
    const city = findCity(cities, stop.cityId);
    if (!city) return stop;
    const nextDay = transform(stop.dayPlans[dayIndex], city);
    if (!nextDay) return stop;
    changed = true;
    const dayPlans = [...stop.dayPlans];
    dayPlans[dayIndex] = nextDay;
    return { ...stop, dayPlans };
  });
  return changed ? { ...plan, stops } : null;
}

/**
 * Swaps one activity for the best unused alternative in the same city.
 * Returns the updated plan, or null when the city has nothing left to offer.
 */
export function swapActivity(
  plan: TripPlan,
  intent: TripIntent,
  dayId: string,
  activityId: string,
  cities: City[] = CITIES
): TripPlan | null {
  const used = usedPoiIds(plan);

  const next = replaceDay(
    plan,
    dayId,
    (day, city) => {
      const target = day.activities.find((a) => a.id === activityId);
      if (!target) return null;
      const alternative = city.pois.find((p) => !used.has(p.id));
      if (!alternative) return null;
      const replacement = toActivity(alternative, city, intent, false);
      const activities = day.activities.map((a) =>
        a.id === activityId ? replacement : a
      );
      return { ...day, activities: orderDayActivities(activities, city) };
    },
    cities
  );

  return next ? rebuildPlan(next, intent, cities) : null;
}

/**
 * Makes one day rain-friendly: outdoor stops (sights, nature) are swapped
 * for unused indoor alternatives (museums, food) where possible.
 * Returns the updated plan, or null when the day is already indoor-proof
 * or the city has no indoor alternatives left.
 */
export function makeRainFriendly(
  plan: TripPlan,
  intent: TripIntent,
  dayId: string,
  cities: City[] = CITIES
): TripPlan | null {
  const used = usedPoiIds(plan);
  let swapped = 0;

  const next = replaceDay(
    plan,
    dayId,
    (day, city) => {
      const indoorPool = city.pois.filter(
        (p) => !used.has(p.id) && !OUTDOOR_CATEGORIES.includes(p.category)
      );
      if (indoorPool.length === 0) return null;

      const activities: Activity[] = day.activities.map((activity) => {
        if (!OUTDOOR_CATEGORIES.includes(activity.category)) return activity;
        const alternative = indoorPool.shift();
        if (!alternative) return activity;
        used.add(alternative.id);
        swapped++;
        return toActivity(alternative, city, intent, false);
      });

      return swapped > 0
        ? { ...day, activities: orderDayActivities(activities, city) }
        : null;
    },
    cities
  );

  if (!next || swapped === 0) return null;
  return rebuildPlan(
    next,
    intent,
    cities,
    `Made ${dayLabel(plan, dayId)} rain-friendly — swapped ${swapped} outdoor ${
      swapped === 1 ? "stop" : "stops"
    } for indoor picks`
  );
}

function dayLabel(plan: TripPlan, dayId: string): string {
  return plan.itinerary.find((d) => d.id === dayId)?.label ?? "the day";
}
