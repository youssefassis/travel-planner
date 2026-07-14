import { BudgetTier, Climate, Interest, Pace, Region } from "@/domain/types";
import { TripIntent, TripMode } from "../types";

/** Shared option lists + labels for the trip intent fields (wizard, summary). */

export const MODE_OPTIONS: { label: string; value: TripMode }[] = [
  { label: "Surprise me", value: "surprise" },
  { label: "Pick my cities", value: "custom" },
];

export const COMPANION_OPTIONS: {
  label: string;
  value: TripIntent["companions"];
}[] = [
  { label: "Solo", value: "solo" },
  { label: "Couple", value: "couple" },
  { label: "Group", value: "group" },
];

export const PACE_OPTIONS: { label: string; value: Pace }[] = [
  { label: "Chill", value: "chill" },
  { label: "Balanced", value: "balanced" },
  { label: "Intense", value: "intense" },
];

export const BUDGET_OPTIONS: { label: string; value: BudgetTier }[] = [
  { label: "Backpacker", value: "backpacker" },
  { label: "Comfort", value: "comfort" },
  { label: "Luxury", value: "luxury" },
];

export const INTEREST_OPTIONS: Interest[] = [
  "culture",
  "food",
  "nature",
  "nightlife",
  "beach",
  "history",
  "art",
  "adventure",
];

export const CLIMATE_OPTIONS: (Climate | "any")[] = [
  "any",
  "cold",
  "temperate",
  "warm",
];

export const REGION_LABELS: Record<Region, string> = {
  iberia: "Iberia",
  france: "France",
  "british-isles": "British Isles",
  benelux: "Benelux",
  central: "Central Europe",
  italy: "Italy",
  nordics: "Nordics",
  balkans: "Balkans",
  east: "Eastern Europe",
};

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function labelFor<T extends string>(
  options: { label: string; value: T }[],
  value: T,
): string {
  return options.find((o) => o.value === value)?.label ?? capitalize(value);
}
