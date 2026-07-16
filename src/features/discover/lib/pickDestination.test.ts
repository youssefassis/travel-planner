import { describe, expect, it } from "vitest";
import { CITIES } from "@/domain/cities";
import { filterCities, pickDestination } from "./pickDestination";

describe("filterCities", () => {
  it("returns every city with no filters", () => {
    expect(filterCities({ interests: [], region: "any" })).toHaveLength(CITIES.length);
  });

  it("filters by region exactly", () => {
    const italy = filterCities({ interests: [], region: "italy" });
    expect(italy.length).toBeGreaterThan(0);
    expect(italy.every((c) => c.region === "italy")).toBe(true);
  });

  it("keeps cities matching any of the chosen interests", () => {
    const beachy = filterCities({ interests: ["beach"], region: "any" });
    expect(beachy.every((c) => c.interests.includes("beach"))).toBe(true);

    const either = filterCities({ interests: ["beach", "nightlife"], region: "any" });
    expect(
      either.every((c) => c.interests.includes("beach") || c.interests.includes("nightlife"))
    ).toBe(true);
    expect(either.length).toBeGreaterThanOrEqual(beachy.length);
  });

  it("combines region and interest filters", () => {
    const pool = filterCities({ interests: ["food"], region: "france" });
    expect(pool.every((c) => c.region === "france" && c.interests.includes("food"))).toBe(true);
  });
});

describe("pickDestination", () => {
  it("returns null for an empty pool", () => {
    expect(pickDestination([])).toBeNull();
  });

  it("picks a member of the pool", () => {
    const pool = filterCities({ interests: [], region: "iberia" });
    const pick = pickDestination(pool, () => 0.5)!;
    expect(pool).toContain(pick);
  });

  it("maps the rng across the pool and stays in range at the edges", () => {
    const pool = filterCities({ interests: [], region: "nordics" });
    expect(pickDestination(pool, () => 0)).toBe(pool[0]);
    expect(pickDestination(pool, () => 0.999999)).toBe(pool[pool.length - 1]);
    expect(pickDestination(pool, () => 1)).toBe(pool[pool.length - 1]); // rng()===1 guard
  });
});
