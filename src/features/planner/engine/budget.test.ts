import { describe, it, expect } from "vitest";
import { City } from "@/domain/types";
import { CityStay, ItineraryDay, TransportLeg, TripIntent } from "../types";
import { computeBudget } from "./budget";

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
  originCityId: "origin",
  selectedCityIds: [],
  duration: 6,
  companions: "solo",
  interests: [],
  region: "any",
  ...overrides,
  vibe: { pace: "balanced", budget: "comfort", climate: "any", ...(overrides.vibe ?? {}) },
});

function dayPlan(id: string, cityId: string, city: string, prices: number[]): ItineraryDay {
  return {
    id,
    label: id,
    cityId,
    city,
    activities: prices.map((price, i) => ({
      id: `${id}-act-${i}`,
      name: `Activity ${i}`,
      category: "sight",
      price,
      location: { lat: 0, lng: 0 },
      cityId,
      city,
    })),
  };
}

describe("computeBudget", () => {
  it("hand-computed sums on a 2-stop, 1-leg fixture", () => {
    const cityA = fixtureCity({
      id: "a",
      name: "A",
      foodPerDay: { backpacker: 20, comfort: 40, luxury: 100 },
    });
    const cityB = fixtureCity({
      id: "b",
      name: "B",
      foodPerDay: { backpacker: 25, comfort: 60, luxury: 150 },
    });

    const stops: CityStay[] = [
      {
        cityId: "a",
        city: "A",
        country: "A",
        coords: { lat: 0, lng: 0 },
        days: 3,
        dayPlans: [
          dayPlan("day-1-a", "a", "A", [10, 20]),
          dayPlan("day-2-a", "a", "A", [15]),
          dayPlan("day-3-a", "a", "A", [0]),
        ],
        stayPerNight: 100,
        stayTotal: 300, // 100 * 3
      },
      {
        cityId: "b",
        city: "B",
        country: "B",
        coords: { lat: 0, lng: 0 },
        days: 2,
        dayPlans: [dayPlan("day-4-b", "b", "B", [30]), dayPlan("day-5-b", "b", "B", [5, 5])],
        stayPerNight: 80,
        stayTotal: 160, // 80 * 2
      },
    ];

    const legs: TransportLeg[] = [
      {
        id: "leg-a-b",
        fromCityId: "a",
        toCityId: "b",
        from: "A",
        to: "B",
        mode: "train",
        distanceKm: 200,
        durationHrs: 2,
        cost: 50,
      },
    ];

    const intent = fixtureIntent({ duration: 5, vibe: { budget: "comfort" } });
    const budget = computeBudget(stops, legs, intent, [cityA, cityB]);

    // stays = sum(stayTotal) = 300 + 160 = 460
    // food  = 3*40 (A comfort) + 2*60 (B comfort) = 120 + 120 = 240
    // activities = (10+20+15+0) + (30+5+5) = 45 + 40 = 85
    // transport = 50
    // total = 460 + 240 + 85 + 50 = 835
    // perDay = round(835 / 5) = 167
    expect(budget.stays).toBe(460);
    expect(budget.food).toBe(240);
    expect(budget.activities).toBe(85);
    expect(budget.transport).toBe(50);
    expect(budget.total).toBe(835);
    expect(budget.perDay).toBe(167);
  });

  it("returns all zeros for an empty plan", () => {
    const intent = fixtureIntent({ duration: 1 });
    const budget = computeBudget([], [], intent, []);
    expect(budget).toEqual({ transport: 0, stays: 0, activities: 0, food: 0, total: 0, perDay: 0 });
  });
});
