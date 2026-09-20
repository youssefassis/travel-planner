import { describe, expect, it } from "vitest";
import { CITIES } from "@/domain/cities";
import { TripIntent } from "../types";
import { generateTripPlan } from "./generatePlan";
import { allLegs } from "./transport";
import { planEmissionsKg, planVariants } from "./variants";

const INTENT: TripIntent = {
  mode: "custom",
  originCityId: "paris-fr",
  selectedCityIds: ["rome-it", "naples-it", "florence-it"],
  duration: 9,
  companions: "couple",
  interests: ["culture", "food"],
  region: "any",
  vibe: { pace: "intense", budget: "luxury", climate: "any" },
};

const PLAN = generateTripPlan(INTENT, CITIES);
const variants = planVariants(PLAN, INTENT, CITIES);
const byId = (id: string) => variants.find((v) => v.id === id);

describe("planVariants", () => {
  it("offers real alternatives for a plan with room to change", () => {
    expect(variants.length).toBeGreaterThan(0);
    for (const variant of variants) {
      expect(variant.plan.stops.length).toBeGreaterThan(0);
      expect(variant.rationale).not.toBe("");
    }
  });

  it("leaves the current plan untouched", () => {
    const before = JSON.stringify(PLAN);
    planVariants(PLAN, INTENT, CITIES);
    expect(JSON.stringify(PLAN)).toBe(before);
  });

  it("is deterministic", () => {
    expect(planVariants(PLAN, INTENT, CITIES)).toEqual(variants);
  });

  it("never offers the same plan twice", () => {
    const signatures = variants.map((v) => `${v.plan.id}:${v.plan.budget.total}`);
    expect(new Set(signatures).size).toBe(signatures.length);
  });

  it("reports deltas that match the plans they describe", () => {
    for (const variant of variants) {
      expect(variant.delta.total).toBe(
        variant.plan.budget.total - PLAN.budget.total,
      );
      expect(variant.delta.cities).toBe(
        variant.plan.stops.length - PLAN.stops.length,
      );
      expect(variant.delta.days).toBe(
        variant.plan.itinerary.length - PLAN.itinerary.length,
      );
      expect(variant.delta.co2).toBe(
        Math.round(planEmissionsKg(variant.plan) - planEmissionsKg(PLAN)),
      );
    }
  });
});

describe("the cheaper variant", () => {
  const cheaper = byId("cheaper");

  it("actually costs less, on the same route and the same days", () => {
    expect(cheaper).toBeDefined();
    expect(cheaper!.delta.total).toBeLessThan(0);
    expect(cheaper!.delta.cities).toBe(0);
    expect(cheaper!.delta.days).toBe(0);
  });

  it("hands back an intent that would rebuild it", () => {
    expect(cheaper!.intent.vibe.budget).toBe("comfort");
    const rebuilt = generateTripPlan(cheaper!.intent, CITIES);
    expect(rebuilt.budget.total).toBe(cheaper!.plan.budget.total);
  });

  it("isn't offered when the trip is already at the cheapest tier", () => {
    const backpacker: TripIntent = {
      ...INTENT,
      vibe: { ...INTENT.vibe, budget: "backpacker" },
    };
    const plan = generateTripPlan(backpacker, CITIES);
    expect(planVariants(plan, backpacker, CITIES).find((v) => v.id === "cheaper"))
      .toBeUndefined();
  });
});

describe("the slower variant", () => {
  const slower = byId("slower");

  it("plans fewer stops over the same route", () => {
    expect(slower).toBeDefined();
    const before = PLAN.itinerary.reduce((n, d) => n + d.activities.length, 0);
    const after = slower!.plan.itinerary.reduce(
      (n, d) => n + d.activities.length,
      0,
    );
    expect(after).toBeLessThan(before);
    expect(slower!.delta.cities).toBe(0);
  });

  it("carries the slower pace in its intent, so adopting it sticks", () => {
    expect(slower!.intent.vibe.pace).toBe("chill");
  });

  it("isn't offered to someone already going slowly", () => {
    const chill: TripIntent = { ...INTENT, vibe: { ...INTENT.vibe, pace: "chill" } };
    const plan = generateTripPlan(chill, CITIES);
    expect(planVariants(plan, chill, CITIES).find((v) => v.id === "slower"))
      .toBeUndefined();
  });
});

describe("the fewer-cities variant", () => {
  const fewer = byId("fewer-cities");

  it("drops exactly one stop and names it", () => {
    expect(fewer).toBeDefined();
    expect(fewer!.delta.cities).toBe(-1);
    expect(fewer!.plan.stops.length).toBe(PLAN.stops.length - 1);

    const kept = new Set(fewer!.plan.stops.map((s) => s.cityId));
    const dropped = PLAN.stops.filter((s) => !kept.has(s.cityId));
    expect(dropped).toHaveLength(1);
    expect(fewer!.label).toContain(dropped[0].city);
  });

  it("keeps the trip bookended by the journeys home", () => {
    expect(fewer!.plan.outbound?.toCityId).toBe(fewer!.plan.stops[0].cityId);
    expect(fewer!.plan.homebound?.fromCityId).toBe(
      fewer!.plan.stops[fewer!.plan.stops.length - 1].cityId,
    );
  });

  it("isn't offered when there's nothing to spare", () => {
    const twoStops: TripIntent = {
      ...INTENT,
      selectedCityIds: ["rome-it", "florence-it"],
      duration: 5,
    };
    const plan = generateTripPlan(twoStops, CITIES);
    expect(
      planVariants(plan, twoStops, CITIES).find((v) => v.id === "fewer-cities"),
    ).toBeUndefined();
  });
});

describe("the greener variant", () => {
  it("isn't offered when nothing between the cities is flown", () => {
    // Rome, Florence and Naples are all connected by rail.
    expect(PLAN.legs.every((leg) => leg.mode !== "flight")).toBe(true);
    expect(byId("greener")).toBeUndefined();
  });

  it("removes a flight, not merely a few kilometres of one", () => {
    // Rome and Florence are an hour and a half apart by rail; Athens is a
    // flight from either, so dropping it takes a flight out of the trip.
    const flying: TripIntent = {
      ...INTENT,
      selectedCityIds: ["rome-it", "florence-it", "athens-gr"],
      duration: 12,
    };
    const plan = generateTripPlan(flying, CITIES);
    const flightsBefore = allLegs(plan).filter((l) => l.mode === "flight").length;

    const greener = planVariants(plan, flying, CITIES).find((v) => v.id === "greener");
    expect(greener).toBeDefined();

    const flightsAfter = allLegs(greener!.plan).filter(
      (l) => l.mode === "flight",
    ).length;
    expect(flightsAfter).toBeLessThan(flightsBefore);
    expect(greener!.delta.co2).toBeLessThan(0);
    expect(planEmissionsKg(greener!.plan)).toBeLessThan(planEmissionsKg(plan));
  });

  it("stays quiet when dropping a stop would only shorten a flight", () => {
    // Lisbon, Athens and Rome are flights from each other however you cut it.
    const allFlights: TripIntent = {
      ...INTENT,
      selectedCityIds: ["lisbon-pt", "athens-gr", "rome-it"],
      duration: 12,
    };
    const plan = generateTripPlan(allFlights, CITIES);
    const variant = planVariants(plan, allFlights, CITIES).find(
      (v) => v.id === "greener",
    );
    expect(variant).toBeUndefined();
  });
});
