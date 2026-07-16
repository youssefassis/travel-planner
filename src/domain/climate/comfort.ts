import { MonthlyNormal } from "./types";

/**
 * Pure climate-comfort math, shared across features (the weather advisor and
 * the trip planner both score cities on these). Lives in the domain so neither
 * feature has to import the other.
 */

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * Broad "is this a pleasant daytime temperature" curve: 1 at a comfortable
 * 21°C, decaying to 0 about 18°C away in either direction.
 */
export function pleasantWarmth(high: number): number {
  return clamp01(1 - Math.abs(high - 21) / 18);
}

/** Fewer rainy days is better: 0 days → 1, 15+ days → 0. */
export function drynessScore(rainDays: number): number {
  return clamp01(1 - rainDays / 15);
}

/** More sunshine is better: 10+ h/day → 1. */
export function sunScore(sunHours: number): number {
  return clamp01(sunHours / 10);
}

/**
 * General pleasantness of a month, independent of any stated preference:
 * comfortable daytime highs, low rain, decent sun — with a penalty for
 * oppressive heat above ~32°C. Returns 0-100.
 */
export function monthlyComfort(n: MonthlyNormal): number {
  const heatPenalty = n.high > 32 ? (n.high - 32) / 12 : 0;
  const raw =
    0.5 * pleasantWarmth(n.high) +
    0.3 * drynessScore(n.rainDays) +
    0.2 * sunScore(n.sunHours);
  return Math.round(clamp01(raw - heatPenalty) * 100);
}

/** Short temperature descriptor from a daytime high. */
export function tempWord(high: number): string {
  if (high >= 28) return "hot";
  if (high >= 22) return "warm";
  if (high >= 16) return "mild";
  if (high >= 10) return "cool";
  return "cold";
}

/** Short precipitation descriptor from rainy-day count. */
export function rainWord(rainDays: number): string {
  if (rainDays <= 4) return "dry";
  if (rainDays <= 8) return "some rain";
  return "wet";
}
