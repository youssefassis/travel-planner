import { pleasantWarmth } from "@/domain/climate";
import { WarmthTarget } from "../types";

// Shared climate math lives in the domain so the planner can use it too.
export {
  drynessScore,
  sunScore,
  tempWord,
  rainWord,
  monthlyComfort as comfortScore,
} from "@/domain/climate";

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
      return pleasantWarmth(high);
  }
}
