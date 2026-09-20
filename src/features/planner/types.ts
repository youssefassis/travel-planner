import {
  BudgetTier,
  Climate,
  Coordinates,
  Interest,
  Pace,
  PoiCategory,
  Region,
  TransportMode,
} from "@/domain/types";

export type { TransportMode };

export type TripMode = "surprise" | "custom";

export type TripIntent = {
  mode: TripMode;
  originCityId: string;
  selectedCityIds: string[]; // custom mode only
  duration: number; // days, clamped 1..30
  travelMonth?: number; // 0-11; undefined = "any time" (weather-agnostic)
  /** First day of the trip, YYYY-MM-DD. Undefined = dates not settled yet.
   *  Always agrees with `travelMonth` — set the pair via `tripDates.ts`. */
  startDate?: string;
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

/** A journey that eats into a day: arriving into a city, or leaving for home. */
export type DayTravel = {
  legId: string;
  mode: TransportMode;
  from: string;
  to: string;
  durationHrs: number;
};

/** What travel, if any, brackets a single day. */
export type DayTravelSlots = {
  arrival?: DayTravel;
  departure?: DayTravel;
};

/* ─── Scheduled day (the companion view of an ItineraryDay) ─────── */

export type ScheduleItem =
  | {
      kind: "travel";
      startMin: number;
      endMin: number;
      travel: DayTravel;
      direction: "arrive" | "depart";
    }
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
      /** The plan's restaurant for this meal; undefined = traveler's choice. */
      activity?: Activity;
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
  /** Getting here — the day's plans only start once this lands. */
  arrival?: DayTravel;
  /** Leaving for home — the day's plans have to be done before this. */
  departure?: DayTravel;
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

/** Every figure is € per person — `travelers` and `partyTotal` say what the
 *  whole party pays. */
export type BudgetBreakdown = {
  transport: number;
  stays: number;
  activities: number;
  food: number;
  total: number;
  perDay: number;
  travelers: number;
  partyTotal: number;
};

/** A reservation the traveller has actually made, kept with the trip. */
export type Booking = {
  activityId: string;
  reference: string;
  /** Epoch millis. */
  bookedAt: number;
  /** Per-person price at the time it was booked. */
  price: number;
};

/** Every booking on a trip, keyed by the activity it covers. */
export type Bookings = Record<string, Booking>;

export type TripPlan = {
  id: string;
  stops: CityStay[];
  legs: TransportLeg[]; // legs[i] connects stops[i] to stops[i+1]
  /** Home → the first stop. Absent when the trip starts in your own city. */
  outbound?: TransportLeg;
  /** The last stop → home. Absent when the trip ends in your own city. */
  homebound?: TransportLeg;
  itinerary: ItineraryDay[]; // flattened stops[].dayPlans
  budget: BudgetBreakdown;
  notes: string[];
};
