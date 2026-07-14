import { City } from "@/domain/types";

export type CityAllocation = { city: City; days: number };

/**
 * Distributes `duration` days across `ordered` cities.
 * Guarantees: sum(allocations.days) === duration, every allocation.days >= 1.
 */
export function allocateDays(
  ordered: City[],
  duration: number
): { allocations: CityAllocation[]; notes: string[] } {
  const notes: string[] = [];

  if (ordered.length === 0) {
    return { allocations: [], notes };
  }

  if (duration < ordered.length) {
    const trimmed = ordered.slice(0, duration);
    notes.push(`Trimmed to ${duration} cities to fit ${duration} days`);
    return { allocations: trimmed.map((city) => ({ city, days: 1 })), notes };
  }

  const days = ordered.map((city) => city.minDays);
  let remaining = duration - days.reduce((sum, d) => sum + d, 0);

  // Grow: give extra days to whichever city is furthest from its maxDays,
  // ties broken by earliest position in route order. Once every city has
  // reached maxDays, keep going round-robin so long trips don't stall.
  let warnedExtra = false;
  while (remaining > 0) {
    let bestIdx = 0;
    let bestValue = -Infinity;
    for (let i = 0; i < ordered.length; i++) {
      const value = ordered[i].maxDays - days[i];
      if (value > bestValue) {
        bestValue = value;
        bestIdx = i;
      }
    }
    if (bestValue <= 0 && !warnedExtra) {
      notes.push("Long trip — added extra leisure days beyond typical stay length");
      warnedExtra = true;
    }
    days[bestIdx] += 1;
    remaining -= 1;
  }

  // Shrink: if minDays totals exceed duration (possible when duration is
  // just barely >= ordered.length), pull days back down from whichever city
  // currently holds the most, never going below 1.
  while (remaining < 0) {
    let bestIdx = -1;
    let bestValue = -Infinity;
    for (let i = 0; i < ordered.length; i++) {
      if (days[i] <= 1) continue;
      if (days[i] > bestValue) {
        bestValue = days[i];
        bestIdx = i;
      }
    }
    if (bestIdx === -1) break; // cannot reduce further without violating days >= 1
    days[bestIdx] -= 1;
    remaining += 1;
  }

  const allocations = ordered.map((city, i) => ({ city, days: days[i] }));
  return { allocations, notes };
}
