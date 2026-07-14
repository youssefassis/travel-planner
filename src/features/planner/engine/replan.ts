import { City, Poi } from "@/domain/types";
import { CITIES } from "@/domain/cities";
import { distanceKm } from "@/domain/geo";
import { Activity, CityStay, ItineraryDay, TripIntent, TripPlan } from "../types";
import { OUTDOOR_CATEGORIES, STAY_SHARE } from "./constants";
import { buildCityDayPlans, orderDayActivities, toActivity } from "./dayPlans";
import { pickTransportLeg } from "./transport";
import { computeBudget } from "./budget";

const MAX_TRIP_DAYS = 30;

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

/* ─── Editing: activities ───────────────────────────────────────── */

/** The city's POIs not yet used anywhere in the plan — what "Add a stop" offers. */
export function unusedPoisForCity(
  plan: TripPlan,
  cityId: string,
  cities: City[] = CITIES
): Poi[] {
  const city = findCity(cities, cityId);
  if (!city) return [];
  const used = usedPoiIds(plan);
  return city.pois.filter((p) => !used.has(p.id));
}

/** Removes one activity from a day. Returns null when it isn't there. */
export function removeActivity(
  plan: TripPlan,
  intent: TripIntent,
  dayId: string,
  activityId: string,
  cities: City[] = CITIES
): TripPlan | null {
  const next = replaceDay(
    plan,
    dayId,
    (day) => {
      if (!day.activities.some((a) => a.id === activityId)) return null;
      return {
        ...day,
        activities: day.activities.filter((a) => a.id !== activityId),
      };
    },
    cities
  );

  return next ? rebuildPlan(next, intent, cities) : null;
}

/**
 * Adds a specific POI to a day (chosen from `unusedPoisForCity`).
 * Returns null when the POI is unknown, already used, or in another city.
 */
export function addActivity(
  plan: TripPlan,
  intent: TripIntent,
  dayId: string,
  poiId: string,
  cities: City[] = CITIES
): TripPlan | null {
  const used = usedPoiIds(plan);
  if (used.has(poiId)) return null;

  const next = replaceDay(
    plan,
    dayId,
    (day, city) => {
      const poi = city.pois.find((p) => p.id === poiId);
      if (!poi) return null;
      const activities = [...day.activities, toActivity(poi, city, intent, false)];
      return { ...day, activities: orderDayActivities(activities, city) };
    },
    cities
  );

  return next ? rebuildPlan(next, intent, cities) : null;
}

/* ─── Editing: cities ───────────────────────────────────────────── */

/** Re-labels every day sequentially (Day 1..N) after stops change. */
function renumberDays(stops: CityStay[]): CityStay[] {
  let dayIndex = 1;
  return stops.map((stop) => ({
    ...stop,
    dayPlans: stop.dayPlans.map((day) => ({
      ...day,
      id: `day-${dayIndex}-${stop.cityId}`,
      label: `Day ${dayIndex++}`,
    })),
  }));
}

function rebuildLegs(stops: CityStay[], intent: TripIntent, cities: City[]) {
  const legs = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const from = findCity(cities, stops[i].cityId);
    const to = findCity(cities, stops[i + 1].cityId);
    if (from && to) legs.push(pickTransportLeg(from, to, intent));
  }
  return legs;
}

/**
 * Adds a city to the trip at the position that detours the route least,
 * with the city's typical minimum stay. The trip gets longer — that's
 * called out in a note. Returns null when the city is unknown, already in
 * the trip, or the trip is at the 30-day cap.
 */
export function addCity(
  plan: TripPlan,
  intent: TripIntent,
  cityId: string,
  cities: City[] = CITIES
): TripPlan | null {
  const city = findCity(cities, cityId);
  if (!city) return null;
  if (plan.stops.some((s) => s.cityId === cityId)) return null;

  const currentDays = plan.stops.reduce((sum, s) => sum + s.days, 0);
  const days = Math.min(Math.max(1, city.minDays), MAX_TRIP_DAYS - currentDays);
  if (days < 1) return null;

  // Cheapest-insertion: the position that adds the least route distance.
  let bestIndex = 0;
  let bestExtra = Infinity;
  for (let i = 0; i <= plan.stops.length; i++) {
    const prev = plan.stops[i - 1];
    const next = plan.stops[i];
    const extra =
      (prev ? distanceKm(prev.coords, city.coords) : 0) +
      (next ? distanceKm(city.coords, next.coords) : 0) -
      (prev && next ? distanceKm(prev.coords, next.coords) : 0);
    if (extra < bestExtra) {
      bestExtra = extra;
      bestIndex = i;
    }
  }

  // Filler ids embed the start index — use a fresh one to stay unique,
  // then renumber all labels sequentially.
  const maxDayIndex = plan.itinerary.length;
  const stayPerNight = city.stayPerNight[intent.vibe.budget] * STAY_SHARE[intent.companions];
  const newStop: CityStay = {
    cityId: city.id,
    city: city.name,
    country: city.country,
    coords: city.coords,
    days,
    dayPlans: buildCityDayPlans(city, days, intent, maxDayIndex + 1),
    stayPerNight,
    stayTotal: Math.round(stayPerNight * days),
  };

  const stops = renumberDays([
    ...plan.stops.slice(0, bestIndex),
    newStop,
    ...plan.stops.slice(bestIndex),
  ]);

  return rebuildPlan(
    { ...plan, stops, legs: rebuildLegs(stops, intent, cities) },
    intent,
    cities,
    `Added ${city.name} (${days} ${days === 1 ? "day" : "days"}) — the trip is now ${
      currentDays + days
    } days`
  );
}

/**
 * Removes a city (and its days) from the trip, reconnecting the route.
 * Returns null when it's the last remaining stop or not in the trip.
 */
export function removeCity(
  plan: TripPlan,
  intent: TripIntent,
  cityId: string,
  cities: City[] = CITIES
): TripPlan | null {
  if (plan.stops.length <= 1) return null;
  const stop = plan.stops.find((s) => s.cityId === cityId);
  if (!stop) return null;

  const stops = renumberDays(plan.stops.filter((s) => s.cityId !== cityId));
  const remainingDays = stops.reduce((sum, s) => sum + s.days, 0);

  return rebuildPlan(
    { ...plan, stops, legs: rebuildLegs(stops, intent, cities) },
    intent,
    cities,
    `Removed ${stop.city} — the trip is now ${remainingDays} ${
      remainingDays === 1 ? "day" : "days"
    }`
  );
}
