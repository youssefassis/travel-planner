import {
  BudgetTier,
  Climate,
  Coordinates,
  Interest,
  Pace,
  PoiCategory,
  Region,
} from "@/domain/types";

export type TripMode = "surprise" | "custom";

export type TripIntent = {
  mode: TripMode;
  originCityId: string;
  selectedCityIds: string[]; // custom mode only
  duration: number; // days, clamped 1..30
  companions: "solo" | "couple" | "group";
  interests: Interest[];
  region?: Region | "any";
  vibe: {
    pace: Pace;
    budget: BudgetTier;
    climate?: Climate | "any";
  };
};

export type Activity = {
  id: string;
  name: string;
  category: PoiCategory;
  price: number;
  location: Coordinates;
  cityId: string;
  city: string;
  /** Typical visit length in hours. */
  durationHrs: number;
  /** Top pick for this traveler's interests — don't skip it. */
  mustSee: boolean;
  /** Popular/ticketed — reserve before the trip. */
  bookAhead: boolean;
  /** Why the engine chose it, in plain language. */
  why: string;
};

/* ─── Scheduled day (the companion view of an ItineraryDay) ─────── */

export type ScheduleItem =
  | {
      kind: "activity";
      startMin: number; // minutes since midnight
      endMin: number;
      activity: Activity;
      /** Walking time from the previous stop, minutes (0 for the first). */
      walkMin: number;
    }
  | {
      kind: "meal";
      startMin: number;
      endMin: number;
      label: "Lunch" | "Dinner";
    };

export type DayLoad = "relaxed" | "balanced" | "packed";

export type DaySchedule = {
  items: ScheduleItem[];
  busyHrs: number; // activity + meal + walking time
  load: DayLoad;
  loadNote: string;
};

export type ItineraryDay = {
  id: string;
  label: string;
  cityId: string;
  city: string;
  activities: Activity[];
};

export type CityStay = {
  cityId: string;
  city: string;
  country: string;
  coords: Coordinates;
  days: number;
  dayPlans: ItineraryDay[];
  stayPerNight: number;
  stayTotal: number;
};

export type TransportMode = "car" | "bus" | "train" | "flight";

export type TransportLeg = {
  id: string;
  fromCityId: string;
  toCityId: string;
  from: string;
  to: string;
  mode: TransportMode;
  distanceKm: number;
  durationHrs: number;
  cost: number;
};

export type BudgetBreakdown = {
  transport: number;
  stays: number;
  activities: number;
  food: number;
  total: number;
  perDay: number;
};

export type TripPlan = {
  id: string;
  stops: CityStay[];
  legs: TransportLeg[]; // legs[i] connects stops[i] to stops[i+1]
  itinerary: ItineraryDay[]; // flattened stops[].dayPlans
  budget: BudgetBreakdown;
  notes: string[];
};
