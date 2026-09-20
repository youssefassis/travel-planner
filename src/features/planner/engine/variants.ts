import { CITIES } from "@/domain/cities";
import { totalEmissionsKg } from "@/domain/carbon";
import { BudgetTier, City } from "@/domain/types";
import { TripIntent, TripPlan } from "../types";
import { generateTripPlan } from "./generatePlan";
import { removeCity } from "./replan";
import { allLegs } from "./transport";

/**
 * Other ways to take the same trip.
 *
 * A planner that only ever shows one answer makes the traveler wonder what
 * they're missing. Each variant changes exactly one thing — the money, the
 * pace, the number of stops, the flights — so the trade is legible instead
 * of being a second opinion with everything different at once.
 *
 * Pure, and derived on demand: a variant can't go stale because it is
 * rebuilt from whatever the plan is now.
 */

export type VariantDelta = {
  /** € per person, against the current plan. Negative is cheaper. */
  total: number;
  days: number;
  cities: number;
  /** kg CO₂e per person. */
  co2: number;
};

export type PlanVariant = {
  id: string;
  label: string;
  /** What you give up, and what you get, in one line. */
  rationale: string;
  plan: TripPlan;
  /** The intent that produced it — adopting the variant adopts this too. */
  intent: TripIntent;
  delta: VariantDelta;
};

const CHEAPER_TIER: Partial<Record<BudgetTier, BudgetTier>> = {
  luxury: "comfort",
  comfort: "backpacker",
};

/**
 * An intent that pins the plan's current cities and length, so a variant
 * changes only the one thing it means to. Without this, a pace change would
 * also change which cities the engine picks, and nothing would be comparable.
 */
function intentForSameStops(
  plan: TripPlan,
  intent: TripIntent,
  overrides: Omit<Partial<TripIntent>, "vibe"> & {
    vibe?: Partial<TripIntent["vibe"]>;
  },
): TripIntent {
  const { vibe, ...rest } = overrides;
  return {
    ...intent,
    mode: "custom",
    selectedCityIds: plan.stops.map((stop) => stop.cityId),
    duration: plan.itinerary.length,
    ...rest,
    vibe: { ...intent.vibe, ...vibe },
  };
}

function deltaFrom(current: TripPlan, next: TripPlan): VariantDelta {
  return {
    total: next.budget.total - current.budget.total,
    days: next.itinerary.length - current.itinerary.length,
    cities: next.stops.length - current.stops.length,
    co2: Math.round(planEmissionsKg(next) - planEmissionsKg(current)),
  };
}

/** Same cities, same days, one rung down the budget ladder. */
function cheaper(
  plan: TripPlan,
  intent: TripIntent,
  cities: City[],
): PlanVariant | null {
  const tier = CHEAPER_TIER[intent.vibe.budget];
  if (!tier) return null;

  const variantIntent = intentForSameStops(plan, intent, { vibe: { budget: tier } });
  const next = generateTripPlan(variantIntent, cities);
  const delta = deltaFrom(plan, next);
  if (delta.total >= 0) return null;

  return {
    id: "cheaper",
    label: `The ${tier} version`,
    rationale: `Same route, same days — simpler stays and cheaper food save €${Math.abs(
      delta.total,
    )} per person.`,
    plan: next,
    intent: variantIntent,
    delta,
  };
}

/** Same cities and days, fewer stops crammed into each one. */
function slower(
  plan: TripPlan,
  intent: TripIntent,
  cities: City[],
): PlanVariant | null {
  if (intent.vibe.pace === "chill") return null;

  const variantIntent = intentForSameStops(plan, intent, { vibe: { pace: "chill" } });
  const next = generateTripPlan(variantIntent, cities);

  const before = plan.itinerary.reduce((n, day) => n + day.activities.length, 0);
  const after = next.itinerary.reduce((n, day) => n + day.activities.length, 0);
  if (after >= before) return null;

  const delta = deltaFrom(plan, next);
  return {
    id: "slower",
    label: "Take it slower",
    rationale: `${before - after} fewer stops across the trip — room to sit still, and €${Math.abs(
      delta.total,
    )} less in tickets.`,
    plan: next,
    intent: variantIntent,
    delta,
  };
}

/** The stop earning its place least: most travel for the fewest days. */
function weakestStopId(plan: TripPlan): string | null {
  if (plan.stops.length <= 2) return null;

  const legs = allLegs(plan);
  let worstId: string | null = null;
  let worstScore = -Infinity;

  for (const stop of plan.stops) {
    const travelHrs = legs
      .filter((leg) => leg.fromCityId === stop.cityId || leg.toCityId === stop.cityId)
      .reduce((sum, leg) => sum + leg.durationHrs, 0);
    const score = travelHrs / stop.days;
    if (score > worstScore) {
      worstScore = score;
      worstId = stop.cityId;
    }
  }

  return worstId;
}

/** Drop the stop that costs the most travel for the least time on the ground. */
function fewerCities(
  plan: TripPlan,
  intent: TripIntent,
  cities: City[],
): PlanVariant | null {
  const cityId = weakestStopId(plan);
  if (!cityId) return null;

  const dropped = plan.stops.find((stop) => stop.cityId === cityId);
  const next = removeCity(plan, intent, cityId, cities);
  if (!next || !dropped) return null;

  const delta = deltaFrom(plan, next);
  return {
    id: "fewer-cities",
    label: `Without ${dropped.city}`,
    rationale: `${dropped.city} costs the most travel for the least time on the ground. Dropping it frees ${
      Math.abs(delta.days)
    } ${Math.abs(delta.days) === 1 ? "day" : "days"} and €${Math.abs(delta.total)}.`,
    plan: next,
    intent: intentForSameStops(next, intent, {}),
    delta,
  };
}

function flightCount(plan: TripPlan): number {
  return allLegs(plan).filter((leg) => leg.mode === "flight").length;
}

/**
 * The version with a flight taken out of it.
 *
 * Two conditions, because either alone is misleading: the variant must fly
 * less than the plan does, *and* what's left between the cities must still
 * include a journey on the ground. Without the second, dropping a stop from
 * a route that flies everywhere would qualify — but that isn't flying less,
 * it's travelling less.
 */
function greener(
  plan: TripPlan,
  intent: TripIntent,
  cities: City[],
): PlanVariant | null {
  // Only inter-city flights are avoidable; getting to the route and home
  // again usually isn't.
  const flown = plan.legs.filter((leg) => leg.mode === "flight");
  if (flown.length === 0) return null;

  const flightsNow = flightCount(plan);
  let best: { plan: TripPlan; cityId: string } | null = null;
  let bestCo2 = planEmissionsKg(plan);

  const candidates = new Set(flown.flatMap((leg) => [leg.fromCityId, leg.toCityId]));
  for (const cityId of candidates) {
    const next = removeCity(plan, intent, cityId, cities);
    if (!next) continue;
    if (flightCount(next) >= flightsNow) continue;
    if (!next.legs.some((leg) => leg.mode !== "flight")) continue;

    const emissions = planEmissionsKg(next);
    if (emissions < bestCo2) {
      bestCo2 = emissions;
      best = { plan: next, cityId };
    }
  }

  if (!best) return null;

  const dropped = plan.stops.find((stop) => stop.cityId === best.cityId);
  const delta = deltaFrom(plan, best.plan);
  return {
    id: "greener",
    label: "One less flight",
    rationale: `Dropping ${
      dropped?.city ?? "a stop"
    } takes a flight out of the middle of the trip — ${Math.abs(
      delta.co2,
    )} kg less CO₂e per traveller, and €${Math.abs(delta.total)} saved.`,
    plan: best.plan,
    intent: intentForSameStops(best.plan, intent, {}),
    delta,
  };
}

/**
 * Every alternative worth offering for this plan, in the order a traveler
 * tends to care: money, then pace, then shape. A variant that wouldn't
 * actually differ is left out rather than shown as a non-choice.
 */
export function planVariants(
  plan: TripPlan,
  intent: TripIntent,
  cities: City[] = CITIES,
): PlanVariant[] {
  const built = [
    cheaper(plan, intent, cities),
    greener(plan, intent, cities),
    slower(plan, intent, cities),
    fewerCities(plan, intent, cities),
  ].filter((variant): variant is PlanVariant => variant !== null);

  // Two variants that land on the same plan are one choice, not two.
  const seen = new Set<string>();
  return built.filter((variant) => {
    const signature = `${variant.plan.id}:${variant.plan.budget.total}`;
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
}

/** kg CO₂e per traveller for a plan — the figure the variants compare. */
export function planEmissionsKg(plan: TripPlan): number {
  return totalEmissionsKg(allLegs(plan));
}
