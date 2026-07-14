import { City } from "@/domain/types";
import { TripIntent } from "../types";

const INTEREST_WEIGHT = 0.5;
const CLIMATE_WEIGHT = 0.25;
const BUDGET_WEIGHT = 0.25;

function interestScore(city: City, intent: TripIntent): number {
  if (intent.interests.length === 0) return 0.5;
  const overlap = intent.interests.filter((i) => city.interests.includes(i)).length;
  return overlap / Math.max(1, intent.interests.length);
}

function climateScore(city: City, intent: TripIntent): number {
  const wanted = intent.vibe.climate;
  if (!wanted || wanted === "any" || wanted === city.climate) return 1;
  return 0.4;
}

function budgetScore(city: City, intent: TripIntent, pool: City[]): number {
  const tier = intent.vibe.budget;
  if (tier === "comfort") return 0.7;

  const prices = pool.map((c) => c.stayPerNight.comfort);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (max === min) return 0.5;

  const price = city.stayPerNight.comfort;
  const normalized = (price - min) / (max - min); // 0 = cheapest, 1 = priciest
  return tier === "backpacker" ? 1 - normalized : normalized;
}

/**
 * Scores a city 0..1 against a trip intent. `pool` is the set of cities used
 * to normalize the relative price range for the budget-fit component; when
 * omitted it defaults to just the city itself (degenerate, neutral budget score).
 */
export function scoreCity(city: City, intent: TripIntent, pool: City[] = [city]): number {
  return (
    INTEREST_WEIGHT * interestScore(city, intent) +
    CLIMATE_WEIGHT * climateScore(city, intent) +
    BUDGET_WEIGHT * budgetScore(city, intent, pool)
  );
}
