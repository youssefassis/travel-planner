import { City } from "@/domain/types";
import { distanceKm } from "@/domain/geo";
import { TransportLeg, TransportMode, TripIntent } from "../types";
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
