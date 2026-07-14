import { describe, it, expect } from "vitest";
import { City } from "@/domain/types";
import { allocateDays } from "./allocateDays";

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

function sumDays(allocations: { city: City; days: number }[]): number {
  return allocations.reduce((sum, a) => sum + a.days, 0);
}

describe("allocateDays", () => {
  it("sums exactly to duration across several city counts/durations", () => {
    const cases: { count: number; duration: number }[] = [
      { count: 1, duration: 1 },
      { count: 1, duration: 10 },
      { count: 2, duration: 5 },
      { count: 3, duration: 9 },
      { count: 5, duration: 14 },
      { count: 4, duration: 4 },
    ];

    for (const { count, duration } of cases) {
      const cities = Array.from({ length: count }, (_, i) => fixtureCity({ id: `c${i}` }));
      const { allocations } = allocateDays(cities, duration);
      expect(sumDays(allocations)).toBe(duration);
      for (const a of allocations) {
        expect(a.days).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("trims to duration when duration < city count, giving 1 day each", () => {
    const cities = Array.from({ length: 5 }, (_, i) => fixtureCity({ id: `c${i}` }));
    const { allocations, notes } = allocateDays(cities, 3);

    expect(allocations).toHaveLength(3);
    expect(allocations.map((a) => a.city.id)).toEqual(["c0", "c1", "c2"]);
    for (const a of allocations) expect(a.days).toBe(1);
    expect(notes).toContain("Trimmed to 3 cities to fit 3 days");
  });

  it("does not crash and adds a note for a 30-day trip across only 2 cities", () => {
    const cities = [
      fixtureCity({ id: "c0", minDays: 1, maxDays: 3 }),
      fixtureCity({ id: "c1", minDays: 1, maxDays: 3 }),
    ];
    const { allocations, notes } = allocateDays(cities, 30);

    expect(sumDays(allocations)).toBe(30);
    expect(allocations.every((a) => a.days >= 1)).toBe(true);
    expect(notes).toContain("Long trip — added extra leisure days beyond typical stay length");
  });

  it("respects minDays as the starting allocation before distributing extra days", () => {
    const cities = [
      fixtureCity({ id: "c0", minDays: 2, maxDays: 4 }),
      fixtureCity({ id: "c1", minDays: 2, maxDays: 4 }),
    ];
    // duration exactly equal to sum(minDays): no extra days to hand out
    const { allocations } = allocateDays(cities, 4);
    expect(sumDays(allocations)).toBe(4);
    expect(allocations.map((a) => a.days)).toEqual([2, 2]);
  });

  it("shrinks below minDays (never below 1) when duration is tight but still >= city count", () => {
    const cities = [
      fixtureCity({ id: "c0", minDays: 3, maxDays: 5 }),
      fixtureCity({ id: "c1", minDays: 3, maxDays: 5 }),
    ];
    // sum(minDays) = 6, but duration is only 2 (still >= city count of 2)
    const { allocations } = allocateDays(cities, 2);
    expect(sumDays(allocations)).toBe(2);
    expect(allocations.every((a) => a.days === 1)).toBe(true);
  });

  it("returns an empty allocation for an empty city list without crashing", () => {
    const { allocations, notes } = allocateDays([], 5);
    expect(allocations).toEqual([]);
    expect(notes).toEqual([]);
  });
});
