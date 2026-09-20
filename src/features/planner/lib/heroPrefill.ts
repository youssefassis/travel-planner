import { getCity } from "@/domain/cities";
import { isISODate } from "@/domain/dates";
import { TripIntent } from "../types";
import { withStartDate } from "./tripDates";

/** A 0-11 month index, or null when the value isn't one. */
function parseMonth(value: string | null): number | null {
  const parsed = value === null ? NaN : parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 11 ? parsed : null;
}

/**
 * Entry points across the site (hero search, trending chips, destination
 * cards, legacy /flights and /stays redirects) hand off to the planner as
 * `/planner?destination=<cityId>&origin=<cityId>&date=<iso>&travelers=<companions>&budget=<tier>`.
 * This maps those params onto a trip intent to prefill the wizard.
 *
 * `date` (YYYY-MM-DD) becomes the trip's start date, which also pins the
 * travel month.
 */
export function intentFromHeroParams(
  params: URLSearchParams,
  base: TripIntent,
): TripIntent | null {
  if (params.get("plan") === "1") return null; // share links win

  const destination = params.get("destination");
  const origin = params.get("origin");
  const travelers = params.get("travelers");
  const budget = params.get("budget");
  const month = params.get("month");
  const date = params.get("date");
  if (
    destination === null &&
    origin === null &&
    travelers === null &&
    budget === null &&
    month === null &&
    date === null
  )
    return null;

  const intent: TripIntent = { ...base, vibe: { ...base.vibe } };

  if (origin && getCity(origin)) {
    intent.originCityId = origin;
  }
  if (destination && getCity(destination)) {
    intent.mode = "custom";
    intent.selectedCityIds = [destination];
  }
  // A picked date is the more specific signal, so it wins over a bare month.
  if (isISODate(date)) {
    Object.assign(intent, withStartDate(date));
  } else {
    const monthIndex = parseMonth(month);
    if (monthIndex !== null) intent.travelMonth = monthIndex;
  }
  if (travelers === "solo" || travelers === "couple" || travelers === "group") {
    intent.companions = travelers;
  }
  if (budget === "backpacker" || budget === "comfort" || budget === "luxury") {
    intent.vibe.budget = budget;
  }
  return intent;
}
