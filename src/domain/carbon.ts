import { TransportMode } from "./types";

/**
 * The carbon cost of getting there, per traveler.
 *
 * Figures are typical European averages in grams of CO₂-equivalent per
 * passenger-kilometre. They are approximate by design, like the rest of this
 * dataset, but the gap between modes is large enough that the comparison
 * holds however you round it: a short flight is roughly seven times a train.
 *
 * Two assumptions worth stating plainly, because they change the numbers:
 * the car figure assumes two people in it (the budget is per person, so this
 * has to be too), and the flight figure includes the usual uplift for
 * emissions released at altitude.
 */

/** Grams of CO₂e per passenger-kilometre. */
export const GRAMS_PER_PASSENGER_KM: Record<TransportMode, number> = {
  train: 35,
  bus: 27,
  car: 85, // ~170 g per vehicle-km, halved for two occupants
  flight: 250, // short-haul, including high-altitude effects
};

/**
 * Straight-line distance understates the journey. Rails and roads bend
 * around terrain; flight paths barely do.
 */
const CIRCUITY: Record<TransportMode, number> = {
  train: 1.2,
  bus: 1.25,
  car: 1.25,
  flight: 1.05,
};

/** Just enough of a leg to price its carbon. */
export type EmittingLeg = {
  mode: TransportMode;
  /** Straight-line kilometres between the two cities. */
  distanceKm: number;
};

/** Kilograms of CO₂e per traveler for one leg. */
export function legEmissionsKg(leg: EmittingLeg): number {
  const km = leg.distanceKm * CIRCUITY[leg.mode];
  return (km * GRAMS_PER_PASSENGER_KM[leg.mode]) / 1000;
}

/** Kilograms of CO₂e per traveler across every leg. */
export function totalEmissionsKg(legs: EmittingLeg[]): number {
  return legs.reduce((sum, leg) => sum + legEmissionsKg(leg), 0);
}

/** What the same journeys would cost if every one of them were flown. */
export function emissionsIfFlownKg(legs: EmittingLeg[]): number {
  return totalEmissionsKg(legs.map((leg) => ({ ...leg, mode: "flight" })));
}

/**
 * How much of the flown footprint this route avoids, 0–1. Zero when the trip
 * already flies everywhere, so callers can decide whether it's worth saying.
 */
export function savingVsFlying(legs: EmittingLeg[]): number {
  const flown = emissionsIfFlownKg(legs);
  if (flown <= 0) return 0;
  return Math.max(0, 1 - totalEmissionsKg(legs) / flown);
}
