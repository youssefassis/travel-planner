/** Calendar months, January-first. Index 0 = January. */
export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export type Month = (typeof MONTHS)[number];

/** Full month names, index-aligned with MONTHS (0 = January). */
export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** Monthly climate normal for one city. */
export type MonthlyNormal = {
  month: Month;
  monthIndex: number; // 0-11
  high: number; // avg daily high, °C
  low: number; // avg daily low, °C
  rainDays: number; // days/month with measurable precipitation
  sunHours: number; // avg daily sunshine hours
};

/**
 * Compact hand-authored source shape: four 12-length arrays (Jan→Dec).
 * Reading each array top-to-bottom reads as the city's seasonal curve.
 */
export type ClimateSource = {
  high: number[];
  low: number[];
  rainDays: number[];
  sunHours: number[];
};

export type CityClimate = {
  cityId: string;
  months: MonthlyNormal[]; // length 12, Jan→Dec
};
