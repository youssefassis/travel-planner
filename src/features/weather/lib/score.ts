import { MonthlyNormal } from "@/domain/climate";
import { WarmthTarget } from "../types";

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * How well a month's daytime high matches a warmth target (0-1). With only
 * three presets, "warm" and "cool" read as thresholds rather than points:
 *   warm — 24°C and up is ideal; cooler decays.
 *   mild — peaks at a sightseeing-friendly 20°C, decays both ways.
 *   cool — crisp 9-15°C is ideal; hotter decays fast, freezing decays gently.
 *   any  — broad comfort curve centered on a pleasant 21°C.
 */
export function warmthScore(high: number, target: WarmthTarget): number {
  switch (target) {
    case "warm":
      return high >= 24 ? 1 : clamp01(1 - (24 - high) / 10);
    case "mild":
      return clamp01(1 - Math.abs(high - 20) / 8);
    case "cool":
      if (high >= 9 && high <= 15) return 1;
      return high > 15
        ? clamp01(1 - (high - 15) / 10)
        : clamp01(1 - (9 - high) / 12);
    case "any":
      return clamp01(1 - Math.abs(high - 21) / 18);
  }
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
export function comfortScore(n: MonthlyNormal): number {
  const warmth = warmthScore(n.high, "any");
  const heatPenalty = n.high > 32 ? (n.high - 32) / 12 : 0;
  const raw =
    0.5 * warmth + 0.3 * drynessScore(n.rainDays) + 0.2 * sunScore(n.sunHours);
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
