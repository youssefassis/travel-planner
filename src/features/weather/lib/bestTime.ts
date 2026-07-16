import { getMonthlyClimate } from "@/domain/climate";
import { getCity } from "@/domain/cities";
import { CityWeatherReport, MonthVerdict } from "../types";
import { comfortScore } from "./score";

/** Turn a 0-100 comfort score into a shorthand label. */
function label(score: number): string {
  if (score >= 75) return "Ideal";
  if (score >= 60) return "Great";
  if (score >= 45) return "Good";
  if (score >= 30) return "Shoulder";
  return "Off-season";
}

/**
 * Rate all 12 months for visiting a city and surface the best three. Pure and
 * deterministic; ties break toward the earlier month. Returns null for unknown
 * cities or cities with no recorded climate.
 */
export function rateCityMonths(cityId: string): CityWeatherReport | null {
  const city = getCity(cityId);
  const climate = getMonthlyClimate(cityId);
  if (!city || !climate) return null;

  const months: MonthVerdict[] = climate.months.map((normal) => {
    const score = comfortScore(normal);
    return { normal, score, label: label(score) };
  });

  const bestMonths = [...months]
    .sort((a, b) => b.score - a.score || a.normal.monthIndex - b.normal.monthIndex)
    .slice(0, 3);

  return { city, months, bestMonths };
}
