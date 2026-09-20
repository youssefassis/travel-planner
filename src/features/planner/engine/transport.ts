import { City } from "@/domain/types";
import { distanceKm } from "@/domain/geo";
import { TransportLeg, TransportMode, TripIntent, TripPlan } from "../types";
import { TIER_TRANSPORT_MULT } from "./constants";

function pickModeAndRates(
  d: number,
  intent: TripIntent
): { mode: TransportMode; durationHrs: number; baseCost: number } {
  if (d < 110) {
    return { mode: "car", durationHrs: 0.4 + d / 80, baseCost: 8 + 0.2 * d };
  }
  if (d < 600) {
    if (intent.vibe.budget === "backpacker") {
      return { mode: "bus", durationHrs: 0.5 + d / 70, baseCost: 5 + 0.07 * d };
    }
    return { mode: "train", durationHrs: 0.75 + d / 110, baseCost: 12 + 0.14 * d };
  }
  return { mode: "flight", durationHrs: 2.5 + d / 750, baseCost: 45 + 0.09 * d };
}

export function pickTransportLeg(from: City, to: City, intent: TripIntent): TransportLeg {
  const d = distanceKm(from.coords, to.coords);
  const { mode, durationHrs, baseCost } = pickModeAndRates(d, intent);

  const cost = Math.round((baseCost * TIER_TRANSPORT_MULT[intent.vibe.budget]) / 5) * 5;
  const roundedDuration = Math.round(durationHrs * 4) / 4;

  return {
    id: `leg-${from.id}-${to.id}`,
    fromCityId: from.id,
    toCityId: to.id,
    from: from.name,
    to: to.name,
    mode,
    distanceKm: Math.round(d),
    durationHrs: roundedDuration,
    cost,
  };
}

/**
 * Every leg of the round trip. `legs[i]` connects `route[i]` to `route[i+1]`;
 * `outbound` and `homebound` are the journeys to and from the traveler's home
 * city, omitted when home is already the first (or last) stop.
 */
export function routeLegs(
  route: City[],
  origin: City,
  intent: TripIntent
): { legs: TransportLeg[]; outbound?: TransportLeg; homebound?: TransportLeg } {
  const legs: TransportLeg[] = [];
  for (let i = 0; i < route.length - 1; i++) {
    legs.push(pickTransportLeg(route[i], route[i + 1], intent));
  }

  const first = route[0];
  const last = route[route.length - 1];

  return {
    legs,
    outbound:
      first && first.id !== origin.id
        ? pickTransportLeg(origin, first, intent)
        : undefined,
    homebound:
      last && last.id !== origin.id
        ? pickTransportLeg(last, origin, intent)
        : undefined,
  };
}

/** Every leg the traveler actually takes, in travel order: out, between, home. */
export function allLegs(
  plan: Pick<TripPlan, "legs" | "outbound" | "homebound">
): TransportLeg[] {
  return [plan.outbound, ...plan.legs, plan.homebound].filter(
    (leg): leg is TransportLeg => leg !== undefined
  );
}
