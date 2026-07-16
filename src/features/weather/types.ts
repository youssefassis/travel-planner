import { City } from "@/domain/types";
import { MonthlyNormal, MONTH_NAMES } from "@/domain/climate";

/** Full month names for display, January-first (index-aligned with domain MONTHS). */
export const MONTH_FULL = MONTH_NAMES;

/** Which way the search runs. */
export type WeatherMode = "conditions" | "city";

/** Warmth target the traveler is chasing (or "any" — don't care). */
export type WarmthTarget = "warm" | "mild" | "cool" | "any";

/** The conditions→cities search inputs. */
export type WeatherPrefs = {
  warmth: WarmthTarget;
  dry: boolean; // prefer few rainy days
  sunny: boolean; // prefer long sunshine hours
  monthIndex: number | null; // 0-11, or null = "any month" (pick each city's best)
};

/** What the search form emits — a discriminated union over the two modes. */
export type WeatherQuery =
  | { mode: "conditions"; prefs: WeatherPrefs }
  | { mode: "city"; cityId: string };

/** One destination scored against the desired conditions. */
export type TripWeatherMatch = {
  city: City;
  monthIndex: number; // the month evaluated (chosen, or the city's best for these conditions)
  normal: MonthlyNormal;
  score: number; // 0-100 fit
  verdict: string; // "Warm and dry", "Mild with some rain", …
  reasons: string[];
};

/** How pleasant one month is to visit a given city. */
export type MonthVerdict = {
  normal: MonthlyNormal;
  score: number; // 0-100 general comfort
  label: string; // "Ideal" | "Great" | "Good" | "Shoulder" | "Off-season"
};

/** The city→best-months report. */
export type CityWeatherReport = {
  city: City;
  months: MonthVerdict[]; // 12, Jan→Dec
  bestMonths: MonthVerdict[]; // top 3
};
