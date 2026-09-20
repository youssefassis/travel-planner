import { getCity } from "@/domain/cities";
import { TripIntent } from "../types";

/** A 0-11 month index, or null when the value isn't one. */
function parseMonth(value: string | null): number | null {
  const parsed = value === null ? NaN : parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 11 ? parsed : null;
}

/** The month of a YYYY-MM-DD date, or null when it isn't one. */
function monthFromDate(value: string | null): number | null {
  if (value === null || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const month = parseInt(value.slice(5, 7), 10) - 1;
  return month >= 0 && month <= 11 ? month : null;
}

/**
 * Entry points across the site (hero search, trending chips, destination
 * cards, legacy /flights and /stays redirects) hand off to the planner as
 * `/planner?destination=<cityId>&origin=<cityId>&date=<iso>&travelers=<companions>&budget=<tier>`.
 * This maps those params onto a trip intent to prefill the wizard.
 *
 * `date` (YYYY-MM-DD) narrows to the travel month, which is all the
 * date-free engine can use today.
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
  const monthIndex = monthFromDate(date) ?? parseMonth(month);
  if (monthIndex !== null) {
    intent.travelMonth = monthIndex;
  }
  if (travelers === "solo" || travelers === "couple" || travelers === "group") {
    intent.companions = travelers;
  }
  if (budget === "backpacker" || budget === "comfort" || budget === "luxury") {
    intent.vibe.budget = budget;
  }
  return intent;
}
