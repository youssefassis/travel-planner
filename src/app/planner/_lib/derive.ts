import { FlightSearchFormData } from "@/features/flights/components/FlightSearch";
import { roundBudget } from "@/features/stays/lib/adviseStays";
import { StayPreferences, StayStyle, TravelParty } from "@/features/stays/types";
import { CityStay, TransportLeg, TripIntent } from "@/features/planner/types";

/** Booking party size: a table/room for 1, 2, or 4 by who's traveling. */
export function partySize(intent: TripIntent): number {
  if (intent.companions === "couple") return 2;
  if (intent.companions === "group") return 4;
  return 1;
}

const PARTY_BY_COMPANIONS: Record<TripIntent["companions"], TravelParty> = {
  solo: "solo",
  couple: "couple",
  group: "friends",
};

/** Interests that map cleanly onto a stay style; others don't constrain lodging. */
const INTEREST_TO_STAY_STYLE: Partial<Record<string, StayStyle>> = {
  food: "food",
  nightlife: "nightlife",
  beach: "beach",
  art: "art",
};

/** A one-way flight search for a single transport leg, priced for the party. */
export function flightSearchForLeg(
  leg: TransportLeg,
  travelers: number,
): FlightSearchFormData {
  return {
    fromCityId: leg.fromCityId,
    toCityId: leg.toCityId,
    travelers,
    stops: "any",
    tripType: "oneway",
    departDate: "",
    returnDate: "",
  };
}

/**
 * Stay preferences for one city stop, seeded from the trip: the engine's
 * per-night figure (rounded to the form's grid), the stop's length, party,
 * and any interests that translate to a lodging style.
 */
export function stayPrefsForStop(stop: CityStay, intent: TripIntent): StayPreferences {
  const styles = intent.interests
    .map((interest) => INTEREST_TO_STAY_STYLE[interest])
    .filter((style): style is StayStyle => style !== undefined);

  return {
    cityId: stop.cityId,
    party: PARTY_BY_COMPANIONS[intent.companions],
    nights: stop.days,
    budgetPerNight: roundBudget(stop.stayPerNight),
    styles,
  };
}
