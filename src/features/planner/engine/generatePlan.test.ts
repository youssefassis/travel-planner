import { describe, it, expect } from "vitest";
import { City, Poi } from "@/domain/types";
import { TripIntent } from "../types";
import { generateTripPlan } from "./generatePlan";

const fixtureCity = (overrides: Partial<City>): City => ({
  id: "x",
  name: "X",
  country: "X",
  region: "france",
  coords: { lat: 0, lng: 0 },
  climate: "temperate",
  interests: ["culture"],
  stayPerNight: { backpacker: 30, comfort: 100, luxury: 250 },
  foodPerDay: { backpacker: 20, comfort: 50, luxury: 120 },
  minDays: 1,
  maxDays: 3,
  pois: [],
  ...overrides,
});

type IntentOverrides = Partial<Omit<TripIntent, "vibe">> & { vibe?: Partial<TripIntent["vibe"]> };

const fixtureIntent = (overrides: IntentOverrides = {}): TripIntent => ({
  mode: "surprise",
  originCityId: "a",
  selectedCityIds: [],
  duration: 6,
  companions: "solo",
  interests: [],
  region: "any",
  ...overrides,
  vibe: { pace: "balanced", budget: "comfort", climate: "any", ...(overrides.vibe ?? {}) },
});

function makePois(prefix: string, n: number): Poi[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `${prefix}-poi-${i}`,
    name: `${prefix} Poi ${i}`,
    category: "sight" as const,
    coords: { lat: 0, lng: 0 },
    price: 10,
  }));
}

function makeCities(n: number): City[] {
  return Array.from({ length: n }, (_, i) =>
    fixtureCity({
      id: `city${i}`,
      name: `City${i}`,
      coords: { lat: i * 2, lng: i * 2 },
      pois: makePois(`city${i}`, 10),
    })
  );
}

describe("generateTripPlan", () => {
  it("yields 1 stop and 0 legs with transport cost 0 for a 1-day trip", () => {
    const cities = makeCities(4);
    const intent = fixtureIntent({ originCityId: "city0", duration: 1 });

    const plan = generateTripPlan(intent, cities);

    expect(plan.stops).toHaveLength(1);
    expect(plan.legs).toHaveLength(0);
    expect(plan.budget.transport).toBe(0);
  });

  it("falls back to surprise mode without throwing when all custom city ids are unknown", () => {
    const cities = makeCities(4);
    const intent = fixtureIntent({
      mode: "custom",
      originCityId: "city0",
      selectedCityIds: ["nope-1", "nope-2"],
      duration: 6,
    });

    expect(() => generateTripPlan(intent, cities)).not.toThrow();
    const plan = generateTripPlan(intent, cities);

    expect(plan.stops.length).toBeGreaterThan(0);
    expect(plan.notes).toContain("No valid cities selected — generated a suggested route instead");
    expect(plan.notes.some((n) => n.startsWith("Skipped unknown city:"))).toBe(true);
  });

  it("falls back to the first city with a note when the origin id is unknown", () => {
    const cities = makeCities(3);
    const intent = fixtureIntent({ originCityId: "does-not-exist", duration: 4 });

    const plan = generateTripPlan(intent, cities);

    expect(plan.notes.some((n) => n.startsWith("Unknown origin"))).toBe(true);
    expect(plan.stops.length).toBeGreaterThan(0);
  });

  it("is deterministic: identical intents produce deep-equal plans", () => {
    const cities = makeCities(5);
    const intent = fixtureIntent({ originCityId: "city0", duration: 10 });

    const planA = generateTripPlan(intent, cities);
    const planB = generateTripPlan(intent, cities);

    expect(planA).toEqual(planB);
  });

  it("produces legs.length === stops.length - 1 for a multi-city result", () => {
    const cities = makeCities(6);
    const intent = fixtureIntent({ originCityId: "city0", duration: 16, vibe: { pace: "intense" } });

    const plan = generateTripPlan(intent, cities);

    expect(plan.stops.length).toBeGreaterThan(1);
    expect(plan.legs).toHaveLength(plan.stops.length - 1);
  });

  it("handles a 30-day trip against only 2-3 matching cities without crashing", () => {
    const cities = makeCities(3);
    const intent = fixtureIntent({ originCityId: "city0", duration: 30 });

    expect(() => generateTripPlan(intent, cities)).not.toThrow();
    const plan = generateTripPlan(intent, cities);

    const totalDays = plan.stops.reduce((sum, s) => sum + s.days, 0);
    expect(totalDays).toBe(30);
    expect(plan.itinerary).toHaveLength(30);
  });

  it("handles custom mode with a valid selection, preserving those cities", () => {
    const cities = makeCities(5);
    const intent = fixtureIntent({
      mode: "custom",
      originCityId: "city0",
      selectedCityIds: ["city2", "city3"],
      duration: 6,
    });

    const plan = generateTripPlan(intent, cities);
    const stopIds = plan.stops.map((s) => s.cityId).sort();
    expect(stopIds).toEqual(["city2", "city3"]);
  });
});
