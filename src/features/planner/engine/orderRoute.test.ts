import { describe, it, expect } from "vitest";
import { City } from "@/domain/types";
import { orderRoute } from "./orderRoute";

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

// Four cities on a line (lng axis), 100km apart each, in this order:
// A(0) -- B(100) -- C(200) -- D(300)
// Starting at A, nearest-neighbor visits them in order A, B, C, D (each next
// hop is always the closest unvisited one).
const A = fixtureCity({ id: "A", name: "A", coords: { lat: 0, lng: 0 } });
const B = fixtureCity({ id: "B", name: "B", coords: { lat: 0, lng: 1 } });
const C = fixtureCity({ id: "C", name: "C", coords: { lat: 0, lng: 2 } });
const D = fixtureCity({ id: "D", name: "D", coords: { lat: 0, lng: 3 } });

describe("orderRoute", () => {
  it("starts at the origin and visits nearest-neighbor in order on a simple line", () => {
    const ordered = orderRoute([D, B, A, C], A);
    expect(ordered.map((c) => c.id)).toEqual(["A", "B", "C", "D"]);
  });

  it("starts at whichever city is nearest to the origin when origin isn't in the set", () => {
    // Origin is far off past D, closest of the remaining set is D.
    const farOrigin = fixtureCity({ id: "origin", name: "Origin", coords: { lat: 0, lng: 3.5 } });
    const ordered = orderRoute([A, B, C, D], farOrigin);
    expect(ordered[0].id).toBe("D");
    // Then nearest-neighbor walks back down the line: D, C, B, A
    expect(ordered.map((c) => c.id)).toEqual(["D", "C", "B", "A"]);
  });

  it("returns the same set of cities, just reordered", () => {
    const ordered = orderRoute([D, B, A, C], A);
    expect(ordered).toHaveLength(4);
    expect(new Set(ordered.map((c) => c.id))).toEqual(new Set(["A", "B", "C", "D"]));
  });

  it("handles an empty city list without crashing", () => {
    expect(orderRoute([], A)).toEqual([]);
  });

  it("handles a single city", () => {
    expect(orderRoute([B], A).map((c) => c.id)).toEqual(["B"]);
  });
});
