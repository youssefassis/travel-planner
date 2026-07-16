import { CITIES } from "@/domain/cities";
import { City } from "@/domain/types";
import { DiscoverFilters } from "../types";

/**
 * The cities that satisfy the (light) filters. Region is an exact match;
 * interests match on any overlap, so a multi-vibe pick stays forgiving.
 * Pure — the randomness lives in pickDestination.
 */
export function filterCities(filters: DiscoverFilters, cities: City[] = CITIES): City[] {
  return cities.filter((city) => {
    if (filters.region !== "any" && city.region !== filters.region) return false;
    if (
      filters.interests.length > 0 &&
      !filters.interests.some((i) => city.interests.includes(i))
    ) {
      return false;
    }
    return true;
  });
}

/**
 * Pick one city from a pool at random. The random source is injectable so the
 * choice is testable; the UI passes Math.random.
 */
export function pickDestination(
  pool: City[],
  rng: () => number = Math.random
): City | null {
  if (pool.length === 0) return null;
  const index = Math.floor(rng() * pool.length);
  // Guard the rng() === 1 edge so the index stays in range.
  return pool[Math.min(index, pool.length - 1)];
}
