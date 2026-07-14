export type StayType = "hotel" | "apartment" | "hostel";

/** The traveler's style vocabulary — what the advisor matches against. */
export type StayStyle =
  | "walkable"
  | "cafes"
  | "architecture"
  | "nightlife"
  | "quiet"
  | "beach"
  | "art"
  | "food";

export type TravelParty = "solo" | "couple" | "family" | "friends";

export type Neighborhood = {
  id: string;
  cityId: string;
  name: string;
  tagline: string;
  traits: StayStyle[];
  walkToCenterMin: number; // minutes on foot to the city center
  priceLevel: 1 | 2 | 3; // 1 = budget-friendly, 3 = premium
};

export type StayOption = {
  id: string;
  name: string;
  type: StayType;
  cityId: string;
  city: string;
  neighborhoodId: string;
  neighborhood: string;
  walkToCenterMin: number;
  pricePerNight: number;
  rating: number;
  reviewCount: number;
  /** What guests consistently praise. */
  praise: string[];
  /** The one recurring complaint, if any. */
  niggle: string | null;
  amenities: string[];
  cityTaxPerNight: number; // € per night, all-in for the room
  serviceFee: number; // € flat per stay
};

export type StayPreferences = {
  cityId: string;
  party: TravelParty;
  nights: number;
  budgetPerNight: number; // €
  styles: StayStyle[];
};

export type NeighborhoodPick = {
  neighborhood: Neighborhood;
  /** Why this area fits the traveler's stated style. */
  reasons: string[];
  avgPricePerNight: number;
  stayCount: number;
};

export type StayPick = {
  stay: StayOption;
  tag: string; // "Best match" | "Best value" | "Most central" | ...
  reasons: string[];
  /** One-line guest-feedback digest. */
  reviewSummary: string;
  /** Trade-off vs the value baseline, when meaningful. */
  tradeOff: string | null;
  totalCost: {
    nightly: number;
    taxes: number;
    fees: number;
    total: number;
  };
};

export type StayAdvice = {
  neighborhoods: NeighborhoodPick[];
  picks: StayPick[];
};
