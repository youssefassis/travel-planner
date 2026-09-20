export type Coordinates = { lat: number; lng: number };

export type BudgetTier = "backpacker" | "comfort" | "luxury";
export type Pace = "chill" | "balanced" | "intense";
export type Climate = "cold" | "temperate" | "warm";

export type Interest =
  | "culture"
  | "food"
  | "nature"
  | "nightlife"
  | "beach"
  | "history"
  | "art"
  | "adventure";

export type Region =
  | "iberia"
  | "france"
  | "british-isles"
  | "benelux"
  | "central"
  | "italy"
  | "nordics"
  | "balkans"
  | "east";

export type TransportMode = "car" | "bus" | "train" | "flight";

export type PoiCategory =
  | "sight"
  | "museum"
  | "food"
  | "nature"
  | "nightlife"
  | "activity";

export type Poi = {
  id: string;
  name: string;
  category: PoiCategory;
  coords: Coordinates;
  price: number; // € per person; 0 = free
  description?: string;
};

export type City = {
  id: string; // "lisbon-pt"
  name: string;
  country: string;
  region: Region;
  coords: Coordinates;
  climate: Climate;
  interests: Interest[];
  stayPerNight: Record<BudgetTier, number>; // € per person per night
  foodPerDay: Record<BudgetTier, number>; // € per person per day
  minDays: number;
  maxDays: number;
  pois: Poi[];
};
