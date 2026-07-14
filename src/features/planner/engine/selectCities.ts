import { City } from "@/domain/types";
import { distanceKm } from "@/domain/geo";
import { TripIntent } from "../types";
import { AVG_STAY_DAYS, MAX_CITIES } from "./constants";
import { scoreCity } from "./score";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function findCity(cities: City[], id: string): City | undefined {
  return cities.find((c) => c.id === id);
}

function filterPool(cities: City[], intent: TripIntent, useRegion: boolean, useClimate: boolean): City[] {
  return cities.filter((c) => {
    if (useRegion && intent.region && intent.region !== "any" && c.region !== intent.region) {
      return false;
    }
    if (useClimate && intent.vibe.climate && intent.vibe.climate !== "any" && c.climate !== intent.vibe.climate) {
      return false;
    }
    return true;
  });
}

function maxPairwiseDistance(cities: City[]): number {
  if (cities.length < 2) return 3000;
  let max = 0;
  for (let i = 0; i < cities.length; i++) {
    for (let j = i + 1; j < cities.length; j++) {
      const d = distanceKm(cities[i].coords, cities[j].coords);
      if (d > max) max = d;
    }
  }
  return max || 3000;
}

export function selectCities(intent: TripIntent, cities: City[]): { cities: City[]; notes: string[] } {
  const notes: string[] = [];
  const n = clamp(Math.round(intent.duration / AVG_STAY_DAYS[intent.vibe.pace]), 1, MAX_CITIES);

  let pool = filterPool(cities, intent, true, true);

  if (pool.length < n) {
    pool = filterPool(cities, intent, true, false);
    const climateLabel = intent.vibe.climate && intent.vibe.climate !== "any" ? intent.vibe.climate : "matching";
    const regionLabel = intent.region && intent.region !== "any" ? intent.region : "the selected region";
    notes.push(`No ${climateLabel} cities found in ${regionLabel} — included other climates`);
  }

  if (pool.length < n) {
    pool = filterPool(cities, intent, false, false);
    notes.push("Not enough cities matched your region — expanded the search to all regions");
  }

  if (pool.length < n) {
    pool = cities.slice();
  }

  const origin = findCity(cities, intent.originCityId);
  const picked: City[] = [];
  const remaining = pool.slice();

  if (origin && remaining.some((c) => c.id === origin.id)) {
    picked.push(origin);
    const idx = remaining.findIndex((c) => c.id === origin.id);
    remaining.splice(idx, 1);
  }

  const maxDist = maxPairwiseDistance(pool);

  while (picked.length < n && remaining.length > 0) {
    let bestIdx = 0;
    let bestValue = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      const nearestDist =
        picked.length === 0
          ? 0
          : Math.min(...picked.map((p) => distanceKm(candidate.coords, p.coords)));
      const normalizedDist = nearestDist / maxDist;
      const value = scoreCity(candidate, intent, pool) - 0.35 * normalizedDist;

      if (value > bestValue) {
        bestValue = value;
        bestIdx = i;
      }
    }

    picked.push(remaining[bestIdx]);
    remaining.splice(bestIdx, 1);
  }

  return { cities: picked, notes };
}
