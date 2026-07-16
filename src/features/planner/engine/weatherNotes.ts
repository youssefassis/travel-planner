import { getMonthNormal, MONTH_NAMES } from "@/domain/climate";
import { CityStay } from "../types";

/**
 * Per-stop weather warnings for the chosen travel month — the loud half of a
 * weather-aware plan. Pure and deterministic: at most one note per stop, only
 * when the month is a genuinely tough window for that city.
 */
export function weatherWarnings(stops: CityStay[], travelMonth: number): string[] {
  const month = MONTH_NAMES[travelMonth];
  if (!month) return [];

  const notes: string[] = [];
  for (const stop of stops) {
    const n = getMonthNormal(stop.cityId, travelMonth);
    if (!n) continue;

    if (n.high >= 33) {
      notes.push(
        `${stop.city} in ${month} averages ${n.high}°C highs — spring or autumn is milder.`
      );
    } else if (n.high <= 3) {
      notes.push(
        `${stop.city} in ${month} averages ${n.high}°C highs — pack for real cold.`
      );
    } else if (n.rainDays >= 12) {
      notes.push(
        `${stop.city} sees about ${n.rainDays} rainy days in ${month} — bring a raincoat.`
      );
    }
  }
  return notes;
}
