import { City } from "@/domain/types";
import { BudgetBreakdown, CityStay, TransportLeg, TripIntent } from "../types";

/**
 * `cities` supplies each stop's `foodPerDay` table (CityStay itself only
 * carries the already-computed stay figures, not the raw city data), keyed
 * by id. Any array containing at least the stopped-at cities works.
 */
export function computeBudget(
  stops: CityStay[],
  legs: TransportLeg[],
  intent: TripIntent,
  cities: City[]
): BudgetBreakdown {
  const foodPerDayById = new Map(cities.map((c) => [c.id, c.foodPerDay]));

  const stays = Math.round(stops.reduce((sum, s) => sum + s.stayTotal, 0));

  const food = Math.round(
    stops.reduce((sum, s) => {
      const foodPerDay = foodPerDayById.get(s.cityId)?.[intent.vibe.budget] ?? 0;
      return sum + s.days * foodPerDay;
    }, 0)
  );

  const activities = Math.round(
    stops
      .flatMap((s) => s.dayPlans)
      .flatMap((d) => d.activities)
      .reduce((sum, a) => sum + a.price, 0)
  );

  const transport = Math.round(legs.reduce((sum, l) => sum + l.cost, 0));

  const total = stays + food + activities + transport;
  // Actual trip length, not intent.duration — plan edits (adding or
  // removing a city) can change how many days the trip really has.
  const days = stops.reduce((sum, s) => sum + s.days, 0);
  const perDay = days > 0 ? Math.round(total / days) : 0;

  return { transport, stays, activities, food, total, perDay };
}
