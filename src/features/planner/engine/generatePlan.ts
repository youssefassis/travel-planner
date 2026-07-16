import { City } from "@/domain/types";
import { CITIES } from "@/domain/cities";
import { CityStay, TripIntent, TripPlan } from "../types";
import { STAY_SHARE } from "./constants";
import { selectCities } from "./selectCities";
import { orderRoute } from "./orderRoute";
import { allocateDays } from "./allocateDays";
import { buildCityDayPlans } from "./dayPlans";
import { pickTransportLeg } from "./transport";
import { computeBudget } from "./budget";
import { weatherWarnings } from "./weatherNotes";

function findCity(cities: City[], id: string): City | undefined {
  return cities.find((c) => c.id === id);
}

export function generateTripPlan(intent: TripIntent, cities: City[] = CITIES): TripPlan {
  const notes: string[] = [];

  let origin = findCity(cities, intent.originCityId);
  if (!origin) {
    origin = cities[0];
    notes.push(`Unknown origin — defaulted to ${origin.name}`);
  }

  let picked: City[];
  if (intent.mode === "custom") {
    const resolved: City[] = [];
    for (const id of intent.selectedCityIds) {
      const match = findCity(cities, id);
      if (match) {
        resolved.push(match);
      } else {
        notes.push(`Skipped unknown city: ${id}`);
      }
    }

    if (resolved.length === 0) {
      const surprise = selectCities(intent, cities);
      picked = surprise.cities;
      notes.push("No valid cities selected — generated a suggested route instead");
      notes.push(...surprise.notes);
    } else {
      picked = resolved;
    }
  } else {
    const surprise = selectCities(intent, cities);
    picked = surprise.cities;
    notes.push(...surprise.notes);
  }

  const ordered = orderRoute(picked, origin);

  const { allocations, notes: allocNotes } = allocateDays(ordered, intent.duration);
  notes.push(...allocNotes);

  const stops: CityStay[] = [];
  let dayIndex = 1;

  for (const { city, days } of allocations) {
    const dayPlans = buildCityDayPlans(city, days, intent, dayIndex);
    const stayPerNight = city.stayPerNight[intent.vibe.budget] * STAY_SHARE[intent.companions];
    const stayTotal = Math.round(stayPerNight * days);

    stops.push({
      cityId: city.id,
      city: city.name,
      country: city.country,
      coords: city.coords,
      days,
      dayPlans,
      stayPerNight,
      stayTotal,
    });

    dayIndex += days;
  }

  const legs = stops.slice(1).map((_, i) => pickTransportLeg(allocations[i].city, allocations[i + 1].city, intent));

  if (intent.travelMonth != null) {
    notes.push(...weatherWarnings(stops, intent.travelMonth));
  }

  const itinerary = stops.flatMap((s) => s.dayPlans);
  const budget = computeBudget(
    stops,
    legs,
    intent,
    allocations.map((a) => a.city)
  );

  const id = `plan-${stops.map((s) => s.cityId).join("-")}-${intent.duration}`;

  return { id, stops, legs, itinerary, budget, notes };
}
