import { describe, it, expect } from "vitest";
import { City } from "@/domain/types";
import { TripIntent } from "../types";
import { selectCities } from "./selectCities";

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
  duration: 9,
  companions: "solo",
  interests: [],
  region: "any",
  ...overrides,
  vibe: { pace: "balanced", budget: "comfort", climate: "any", ...(overrides.vibe ?? {}) },
});

// Spread cities out on a grid so distance-based diversity picking has real signal.
function grid(prefix: string, region: City["region"], climate: City["climate"], n: number): City[] {
  return Array.from({ length: n }, (_, i) =>
    fixtureCity({
      id: `${prefix}${i}`,
      name: `${prefix}${i}`,
      region,
      climate,
      coords: { lat: i * 5, lng: i * 5 },
    })
  );
}

describe("selectCities", () => {
  it("respects a region filter", () => {
    const franceCities = grid("fr", "france", "temperate", 4);
    const italyCities = grid("it", "italy", "temperate", 4);
    const intent = fixtureIntent({
      originCityId: "fr0",
      region: "france",
      duration: 9, // n = round(9/3) = 3
    });

    const { cities } = selectCities(intent, [...franceCities, ...italyCities]);

    expect(cities.length).toBeGreaterThan(0);
    for (const c of cities) {
      expect(c.region).toBe("france");
    }
  });

  it("relaxes climate with a note when the filtered pool is too small", () => {
    const coldCity = fixtureCity({ id: "fr-cold", name: "Cold", region: "france", climate: "cold", coords: { lat: 0, lng: 0 } });
    const temperateCities = grid("fr-temp", "france", "temperate", 4);
    const intent = fixtureIntent({
      originCityId: "fr-cold",
      region: "france",
      duration: 9, // n = 3
      vibe: { climate: "cold" },
    });

    const { cities, notes } = selectCities(intent, [coldCity, ...temperateCities]);

    expect(cities.length).toBeGreaterThan(1); // had to pull in non-cold cities
    expect(notes.some((n) => n.includes("cold") && n.includes("included other climates"))).toBe(true);
  });

  it("always includes the origin city if it passes filters", () => {
    const origin = fixtureCity({ id: "origin", name: "Origin", region: "france", coords: { lat: 0, lng: 0 } });
    const others = grid("fr", "france", "temperate", 5);
    const intent = fixtureIntent({ originCityId: "origin", region: "france", duration: 9 });

    const { cities } = selectCities(intent, [origin, ...others]);

    expect(cities.some((c) => c.id === "origin")).toBe(true);
  });

  it("picks more cities for intense pace than chill pace at the same duration", () => {
    const pool = grid("c", "france", "temperate", 6);
    const duration = 10;

    const chill = selectCities(
      fixtureIntent({ originCityId: "c0", region: "any", duration, vibe: { pace: "chill" } }),
      pool
    );
    const intense = selectCities(
      fixtureIntent({ originCityId: "c0", region: "any", duration, vibe: { pace: "intense" } }),
      pool
    );

    expect(intense.cities.length).toBeGreaterThan(chill.cities.length);
  });
});
