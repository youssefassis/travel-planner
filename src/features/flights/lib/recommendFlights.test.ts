import { describe, expect, it } from "vitest";
import { FlightOption } from "../types";
import { recommendFlights } from "./recommendFlights";

function flight(overrides: Partial<FlightOption> & { id: string }): FlightOption {
  return {
    airline: "SkyWings",
    fromCityId: "paris-fr",
    toCityId: "rome-it",
    from: "Paris",
    to: "Rome",
    departureTime: "8:00 AM",
    arrivalTime: "10:00 AM",
    durationHrs: 2,
    stops: 0,
    price: 100,
    bagFee: 30,
    ...overrides,
  };
}

const FIXTURE: FlightOption[] = [
  flight({ id: "a", price: 80, durationHrs: 3.5, stops: 1, departureTime: "6:30 AM" }),
  flight({ id: "b", price: 120, durationHrs: 2, stops: 0, departureTime: "9:00 AM" }),
  flight({ id: "c", price: 100, durationHrs: 2.25, stops: 0, departureTime: "3:00 PM" }),
  flight({ id: "d", price: 150, durationHrs: 2, stops: 0, departureTime: "7:15 PM" }),
];

describe("recommendFlights", () => {
  it("returns an empty list for no options", () => {
    expect(recommendFlights([])).toEqual([]);
  });

  it("is deterministic", () => {
    expect(recommendFlights(FIXTURE)).toEqual(recommendFlights(FIXTURE));
  });

  it("leads with Best overall and never repeats a flight", () => {
    const picks = recommendFlights(FIXTURE);
    expect(picks[0].tag).toBe("Best overall");
    const ids = picks.map((p) => p.flight.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(picks.length).toBeGreaterThanOrEqual(3);
    expect(picks.length).toBeLessThanOrEqual(5);
  });

  it("tags the cheapest and fastest flights", () => {
    const picks = recommendFlights(FIXTURE);
    const cheapest = picks.find((p) => p.tag === "Cheapest");
    expect(cheapest?.flight.id).toBe("a");
    const fastestTagged = picks.find((p) => p.tag === "Fastest" || p.tag === "Best overall");
    expect(fastestTagged).toBeDefined();
  });

  it("explains trade-offs relative to the cheapest and fastest", () => {
    const picks = recommendFlights(FIXTURE);
    const cheapest = picks.find((p) => p.tag === "Cheapest")!;
    expect(cheapest.reasons[0]).toBe("Lowest fare on this route");
    const pricier = picks.find((p) => p.flight.price !== 80);
    expect(pricier?.reasons[0]).toMatch(/^€\d+ more than the cheapest$/);
  });

  it("signals book/fair/monitor from the route's median fare", () => {
    // median of [80, 100, 120, 150] = 110
    const picks = recommendFlights(FIXTURE);
    const byId = Object.fromEntries(picks.map((p) => [p.flight.id, p]));
    expect(byId["a"].signal.level).toBe("book"); // 80 <= 110 * 0.92
    if (byId["d"]) expect(byId["d"].signal.level).toBe("monitor"); // 150 > 110 * 1.05
  });
});
