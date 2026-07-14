import { City } from "@/domain/types";
import { distanceKm } from "@/domain/geo";

/**
 * Orders cities into a nearest-neighbor route starting from (or nearest to)
 * `origin`. Takes the resolved origin City directly (rather than an id +
 * lookup table) so this module stays pure and testable with fixture data.
 */
export function orderRoute(cities: City[], origin: City): City[] {
  if (cities.length === 0) return [];

  const remaining = cities.slice();

  const originIdx = remaining.findIndex((c) => c.id === origin.id);
  let startIdx: number;
  if (originIdx !== -1) {
    startIdx = originIdx;
  } else {
    startIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = distanceKm(origin.coords, remaining[i].coords);
      if (d < bestDist) {
        bestDist = d;
        startIdx = i;
      }
    }
  }

  const ordered: City[] = [remaining[startIdx]];
  remaining.splice(startIdx, 1);

  while (remaining.length > 0) {
    const current = ordered[ordered.length - 1];
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = distanceKm(current.coords, remaining[i].coords);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    ordered.push(remaining[bestIdx]);
    remaining.splice(bestIdx, 1);
  }

  return ordered;
}
