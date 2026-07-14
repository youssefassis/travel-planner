import { getCity } from "@/domain/cities";
import { TripIntent } from "../types";

/**
 * Entry points across the site (hero search, trending chips, destination
 * cards) hand off to the planner as
 * `/planner?destination=<cityId>&date=<iso>&travelers=<companions>&budget=<tier>`.
 * This maps those params onto a trip intent to prefill the wizard.
 *
 * `date` is accepted but unused — the engine is date-free.
 */
export function intentFromHeroParams(
  params: URLSearchParams,
  base: TripIntent,
): TripIntent | null {
  if (params.get("plan") === "1") return null; // share links win

  const destination = params.get("destination");
  const travelers = params.get("travelers");
  const budget = params.get("budget");
  if (destination === null && travelers === null && budget === null) return null;

  const intent: TripIntent = { ...base, vibe: { ...base.vibe } };

  if (destination && getCity(destination)) {
    intent.mode = "custom";
    intent.selectedCityIds = [destination];
  }
  if (travelers === "solo" || travelers === "couple" || travelers === "group") {
    intent.companions = travelers;
  }
  if (budget === "backpacker" || budget === "comfort" || budget === "luxury") {
    intent.vibe.budget = budget;
  }
  return intent;
}
