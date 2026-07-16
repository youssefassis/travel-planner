import { CITIES } from "@/domain/cities";
import { getMonthlyClimate, MonthlyNormal } from "@/domain/climate";
import { City } from "@/domain/types";
import { MONTH_FULL, TripWeatherMatch, WeatherPrefs } from "../types";
import { drynessScore, rainWord, sunScore, tempWord, warmthScore } from "./score";

/**
 * Fit of one month's normals to the desired conditions, 0-100. Warmth leads
 * when a target is set; dryness and sunshine always contribute (they define
 * "pleasant") and weigh more when explicitly requested.
 */
function conditionScore(n: MonthlyNormal, prefs: WeatherPrefs): number {
  // A chosen warmth target is the primary criterion; dryness and sunshine
  // always nudge the ranking (they define "pleasant") but only lead when asked.
  const wWarm = prefs.warmth === "any" ? 0.5 : 1.5;
  const wDry = prefs.dry ? 1.0 : 0.25;
  const wSun = prefs.sunny ? 1.0 : 0.25;

  const weighted =
    wWarm * warmthScore(n.high, prefs.warmth) +
    wDry * drynessScore(n.rainDays) +
    wSun * sunScore(n.sunHours);

  return Math.round((weighted / (wWarm + wDry + wSun)) * 100);
}

function verdict(n: MonthlyNormal): string {
  const temp = tempWord(n.high);
  const rain = rainWord(n.rainDays);
  const lead = temp.charAt(0).toUpperCase() + temp.slice(1);
  if (rain === "dry") return `${lead} and dry`;
  if (rain === "wet") return `${lead} but wet`;
  return `${lead} with some rain`;
}

function reasonsFor(
  n: MonthlyNormal,
  monthPicked: boolean
): string[] {
  const reasons = [
    `Highs around ${n.high}°C, lows near ${n.low}°C`,
    `${n.rainDays} rainy ${n.rainDays === 1 ? "day" : "days"} · ${n.sunHours}h sun a day`,
  ];
  if (monthPicked) reasons.push(`Best around ${MONTH_FULL[n.monthIndex]}`);
  return reasons;
}

/** Evaluate one city: use the chosen month, or its own best month if "any". */
function matchCity(city: City, prefs: WeatherPrefs): TripWeatherMatch | null {
  const climate = getMonthlyClimate(city.id);
  if (!climate) return null;

  let normal: MonthlyNormal;
  let monthAutoPicked = false;
  if (prefs.monthIndex !== null) {
    normal = climate.months[prefs.monthIndex];
  } else {
    normal = climate.months.reduce((best, m) =>
      conditionScore(m, prefs) > conditionScore(best, prefs) ? m : best
    );
    monthAutoPicked = true;
  }

  return {
    city,
    monthIndex: normal.monthIndex,
    normal,
    score: conditionScore(normal, prefs),
    verdict: verdict(normal),
    reasons: reasonsFor(normal, monthAutoPicked),
  };
}

/**
 * Rank destinations by how well their weather fits the desired conditions.
 * Pure and deterministic; ties break alphabetically by city name for a stable
 * order. Returns at most `limit` matches (default 8).
 */
export function suggestTrips(
  prefs: WeatherPrefs,
  limit = 8
): TripWeatherMatch[] {
  return CITIES.map((city) => matchCity(city, prefs))
    .filter((m): m is TripWeatherMatch => m !== null)
    .sort((a, b) => b.score - a.score || a.city.name.localeCompare(b.city.name))
    .slice(0, limit);
}
