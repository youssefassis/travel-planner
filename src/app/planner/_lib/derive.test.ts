import { describe, expect, it } from "vitest";
import { partySize, flightSearchForLeg, stayPrefsForStop } from "./derive";
import { CityStay, TransportLeg, TripIntent } from "@/features/planner/types";

const baseIntent: TripIntent = {
  mode: "surprise",
  originCityId: "paris-fr",
  selectedCityIds: [],
  duration: 5,
  companions: "solo",
  interests: [],
  vibe: { pace: "balanced", budget: "comfort" },
};

const stop: CityStay = {
  cityId: "rome-it",
  city: "Rome",
  country: "Italy",
  coords: { lat: 41.9, lng: 12.5 },
  days: 4,
  dayPlans: [],
  stayPerNight: 97,
  stayTotal: 388,
};

const leg: TransportLeg = {
  id: "leg-1",
  fromCityId: "paris-fr",
  toCityId: "rome-it",
  from: "Paris",
  to: "Rome",
  mode: "flight",
  distanceKm: 1100,
  durationHrs: 2,
  cost: 58,
};

describe("partySize", () => {
  it("maps companions to 1 / 2 / 4", () => {
    expect(partySize({ ...baseIntent, companions: "solo" })).toBe(1);
    expect(partySize({ ...baseIntent, companions: "couple" })).toBe(2);
    expect(partySize({ ...baseIntent, companions: "group" })).toBe(4);
  });
});

describe("flightSearchForLeg", () => {
  it("builds a one-way search for the leg's route", () => {
    const s = flightSearchForLeg(leg, 2);
    expect(s.fromCityId).toBe("paris-fr");
    expect(s.toCityId).toBe("rome-it");
    expect(s.travelers).toBe(2);
    expect(s.tripType).toBe("oneway");
    expect(s.stops).toBe("any");
  });
});

describe("stayPrefsForStop", () => {
  it("derives nights, party, and rounded budget from the stop", () => {
    const prefs = stayPrefsForStop(stop, baseIntent);
    expect(prefs.cityId).toBe("rome-it");
    expect(prefs.nights).toBe(4);
    expect(prefs.party).toBe("solo");
    expect(prefs.budgetPerNight).toBe(100); // 97 rounded to €10 grid
  });

  it("maps group to friends and passes through lodging-relevant interests", () => {
    const prefs = stayPrefsForStop(stop, {
      ...baseIntent,
      companions: "group",
      interests: ["food", "nightlife", "history", "beach", "art"],
    });
    expect(prefs.party).toBe("friends");
    expect(prefs.styles).toEqual(["food", "nightlife", "beach", "art"]);
  });
});
