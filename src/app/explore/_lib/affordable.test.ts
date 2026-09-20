import { describe, expect, it } from "vitest";
import { CITIES } from "@/domain/cities";
import { generateTripPlan } from "@/features/planner/engine";
import { AffordabilityQuery, affordableTrips, plannerUrlFor } from "./affordable";

const QUERY: AffordabilityQuery = {
  originCityId: "paris-fr",
  budget: 900,
  nights: 5,
  companions: "solo",
};

describe("affordableTrips", () => {
  it("only offers trips the budget actually covers", () => {
    const { affordable } = affordableTrips(QUERY, CITIES);
    expect(affordable.length).toBeGreaterThan(0);
    for (const trip of affordable) {
      expect(trip.total).toBeLessThanOrEqual(QUERY.budget);
      expect(trip.headroom).toBe(QUERY.budget - trip.total);
    }
  });

  it("never offers the city the traveller is leaving from", () => {
    const { affordable, nearMisses } = affordableTrips(QUERY, CITIES);
    const ids = [...affordable, ...nearMisses].map((t) => t.city.id);
    expect(ids).not.toContain("paris-fr");
  });

  it("quotes the price of a real plan, not a separate estimate", () => {
    const [trip] = affordableTrips(QUERY, CITIES).affordable;
    const plan = generateTripPlan(
      {
        mode: "custom",
        originCityId: QUERY.originCityId,
        selectedCityIds: [trip.city.id],
        duration: QUERY.nights,
        companions: QUERY.companions,
        interests: [],
        region: "any",
        vibe: { pace: "balanced", budget: trip.tier, climate: "any" },
      },
      CITIES,
    );
    expect(plan.budget.total).toBe(trip.total);
  });

  it("leads with the best experience the money buys", () => {
    const rank = { luxury: 3, comfort: 2, backpacker: 1 };
    const { affordable } = affordableTrips({ ...QUERY, budget: 3000 }, CITIES);

    for (let i = 1; i < affordable.length; i++) {
      const prev = rank[affordable[i - 1].tier];
      const here = rank[affordable[i].tier];
      expect(prev).toBeGreaterThanOrEqual(here);
      // Within a tier, the pricier trip is the better one for the money.
      if (prev === here) {
        expect(affordable[i - 1].total).toBeGreaterThanOrEqual(affordable[i].total);
      }
    }
  });

  it("a bigger budget never reaches fewer places", () => {
    const small = affordableTrips({ ...QUERY, budget: 600 }, CITIES).affordable;
    const large = affordableTrips({ ...QUERY, budget: 2500 }, CITIES).affordable;
    expect(large.length).toBeGreaterThanOrEqual(small.length);
  });

  it("offers the near misses when nothing fits, with what they'd cost", () => {
    const { affordable, nearMisses } = affordableTrips(
      { ...QUERY, budget: 50 },
      CITIES,
    );
    expect(affordable).toEqual([]);
    expect(nearMisses).toHaveLength(3);
    for (const trip of nearMisses) {
      expect(trip.headroom).toBeLessThan(0);
      expect(trip.tier).toBe("backpacker"); // the cheapest it could be done for
    }
    // Cheapest first, so the closest reach is on top.
    expect(nearMisses[0].total).toBeLessThanOrEqual(nearMisses[1].total);
  });

  it("has no near misses when everything is affordable", () => {
    expect(affordableTrips({ ...QUERY, budget: 100000 }, CITIES).nearMisses).toEqual(
      [],
    );
  });

  it("is deterministic", () => {
    expect(affordableTrips(QUERY, CITIES)).toEqual(affordableTrips(QUERY, CITIES));
  });
});

describe("plannerUrlFor", () => {
  it("carries the whole query into the planner", () => {
    const [trip] = affordableTrips(QUERY, CITIES).affordable;
    const url = plannerUrlFor(trip, { ...QUERY, travelMonth: 6 });

    expect(url).toContain(`destination=${trip.city.id}`);
    expect(url).toContain("origin=paris-fr");
    expect(url).toContain("travelers=solo");
    expect(url).toContain(`budget=${trip.tier}`);
    expect(url).toContain("month=6");
  });

  it("leaves the month out when the traveller hasn't picked one", () => {
    const [trip] = affordableTrips(QUERY, CITIES).affordable;
    expect(plannerUrlFor(trip, QUERY)).not.toContain("month=");
  });
});
