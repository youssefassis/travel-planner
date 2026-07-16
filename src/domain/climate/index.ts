import { CLIMATE_NORMALS } from "./normals";
import { CityClimate, ClimateSource, MonthlyNormal, MONTHS } from "./types";

export * from "./types";

/** Zip a city's four seasonal arrays into 12 per-month normals. */
function buildMonths(source: ClimateSource): MonthlyNormal[] {
  return MONTHS.map((month, monthIndex) => ({
    month,
    monthIndex,
    high: source.high[monthIndex],
    low: source.low[monthIndex],
    rainDays: source.rainDays[monthIndex],
    sunHours: source.sunHours[monthIndex],
  }));
}

const CLIMATE_BY_ID: Record<string, CityClimate> = Object.fromEntries(
  Object.entries(CLIMATE_NORMALS).map(([cityId, source]) => [
    cityId,
    { cityId, months: buildMonths(source) },
  ])
);

/** Monthly climate normals for a city, or undefined if none are recorded. */
export function getMonthlyClimate(cityId: string): CityClimate | undefined {
  return CLIMATE_BY_ID[cityId];
}

/** Normals for a single month (0 = January), or undefined. */
export function getMonthNormal(
  cityId: string,
  monthIndex: number
): MonthlyNormal | undefined {
  return CLIMATE_BY_ID[cityId]?.months[monthIndex];
}

export function hasClimate(cityId: string): boolean {
  return cityId in CLIMATE_BY_ID;
}

/** Ids of every city with recorded climate normals. */
export function climateCityIds(): string[] {
  return Object.keys(CLIMATE_BY_ID);
}

// Fail loudly at load if any city's arrays are malformed — the advisor and
// climate strip both assume exactly 12 entries per metric.
for (const [cityId, source] of Object.entries(CLIMATE_NORMALS)) {
  for (const key of ["high", "low", "rainDays", "sunHours"] as const) {
    if (source[key].length !== 12) {
      throw new Error(
        `Climate normals for "${cityId}" have ${source[key].length} ${key} entries; expected 12.`
      );
    }
  }
}
