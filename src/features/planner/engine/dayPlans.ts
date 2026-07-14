import { City, Poi, PoiCategory } from "@/domain/types";
import { Activity, ItineraryDay, TripIntent } from "../types";
import { ACTIVITIES_PER_DAY, CATEGORY_TO_INTERESTS } from "./constants";

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

function toActivity(poi: Poi, city: City): Activity {
  return {
    id: poi.id,
    name: poi.name,
    category: poi.category,
    price: poi.price,
    location: poi.coords,
    cityId: city.id,
    city: city.name,
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

export function buildCityDayPlans(
  city: City,
  days: number,
  intent: TripIntent,
  startDayIndex: number
): ItineraryDay[] {
  const perDay = ACTIVITIES_PER_DAY[intent.vibe.pace];
  const ranked = rankPois(city.pois, intent);
  const used = new Set<string>();

  const dayActivities: Activity[][] = Array.from({ length: days }, () => []);
  const dayCategories: Set<PoiCategory>[] = Array.from({ length: days }, () => new Set());

  for (let slot = 0; slot < perDay; slot++) {
    for (let d = 0; d < days; d++) {
      const poi = pickNextPoi(ranked, used, dayCategories[d]);
      if (poi) {
        used.add(poi.id);
        dayCategories[d].add(poi.category);
        dayActivities[d].push(toActivity(poi, city));
      } else {
        dayActivities[d].push(fillerActivity(city, startDayIndex + d, slot));
      }
    }
  }

  return dayActivities.map((activities, i) => {
    const dayIndex = startDayIndex + i;
    return {
      id: `day-${dayIndex}-${city.id}`,
      label: `Day ${dayIndex}`,
      cityId: city.id,
      city: city.name,
      activities,
    };
  });
}
