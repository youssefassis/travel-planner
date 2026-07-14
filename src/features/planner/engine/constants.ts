import { BudgetTier, Interest, Pace, PoiCategory } from "@/domain/types";

export const ACTIVITIES_PER_DAY: Record<Pace, number> = {
  chill: 2,
  balanced: 3,
  intense: 4,
};

export const AVG_STAY_DAYS: Record<Pace, number> = {
  chill: 3.5,
  balanced: 3,
  intense: 2,
};

export const MAX_CITIES = 8;

export const TIER_TRANSPORT_MULT: Record<BudgetTier, number> = {
  backpacker: 0.85,
  comfort: 1,
  luxury: 1.6,
};

export const STAY_SHARE: Record<"solo" | "couple" | "group", number> = {
  solo: 1,
  couple: 0.65,
  group: 0.55,
};

export const CATEGORY_TO_INTERESTS: Record<PoiCategory, Interest[]> = {
  sight: ["culture", "history"],
  museum: ["culture", "art", "history"],
  food: ["food"],
  nature: ["nature", "adventure"],
  nightlife: ["nightlife"],
  activity: ["adventure", "culture"],
};
