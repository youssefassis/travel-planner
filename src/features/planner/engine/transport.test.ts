import { describe, it, expect } from "vitest";
import { City } from "@/domain/types";
import { TripIntent } from "../types";
import { pickTransportLeg } from "./transport";

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

// Along the same meridian (lng=0), haversine distance reduces exactly to
// R * dLat(radians), so this gives us an exact, hand-verifiable km distance.
const R = 6371;
function cityAtKm(km: number): City {
  const latDeg = (km / R) * (180 / Math.PI);
  return fixtureCity({ id: "to", name: "To", coords: { lat: latDeg, lng: 0 } });
}

const origin = fixtureCity({ id: "from", name: "From", coords: { lat: 0, lng: 0 } });

describe("pickTransportLeg", () => {
  it("uses car under 110km", () => {
    const to = cityAtKm(109);
    const leg = pickTransportLeg(origin, to, fixtureIntent({ vibe: { budget: "comfort" } }));
    expect(leg.mode).toBe("car");
    expect(leg.distanceKm).toBe(109);
    // duration = 0.4 + 109/80 = 1.7625 -> nearest quarter hour = 1.75
    expect(leg.durationHrs).toBeCloseTo(1.75);
    // baseCost = 8 + 0.2*109 = 29.8; cost = round(29.8*1/5)*5 = 30
    expect(leg.cost).toBe(30);
  });

  it("uses bus (not train) for backpacker between 110 and 600km", () => {
    const to = cityAtKm(110);
    const leg = pickTransportLeg(
      origin,
      to,
      fixtureIntent({ vibe: { pace: "balanced", budget: "backpacker", climate: "any" } })
    );
    expect(leg.mode).toBe("bus");
    expect(leg.distanceKm).toBe(110);
    // duration = 0.5 + 110/70 = 2.0714... -> nearest quarter = 2.0
    expect(leg.durationHrs).toBeCloseTo(2.0);
    // baseCost = 5 + 0.07*110 = 12.7; cost = round(12.7*0.85/5)*5 = 10
    expect(leg.cost).toBe(10);
  });

  it("uses train (not bus) for non-backpacker between 110 and 600km", () => {
    const to = cityAtKm(110);
    const leg = pickTransportLeg(origin, to, fixtureIntent({ vibe: { budget: "comfort" } }));
    expect(leg.mode).toBe("train");
    // duration = 0.75 + 110/110 = 1.75
    expect(leg.durationHrs).toBeCloseTo(1.75);
    // baseCost = 12 + 0.14*110 = 27.4; cost = round(27.4/5)*5 = 25
    expect(leg.cost).toBe(25);
  });

  it("still uses train just under 600km", () => {
    const to = cityAtKm(599);
    const leg = pickTransportLeg(origin, to, fixtureIntent({ vibe: { budget: "comfort" } }));
    expect(leg.mode).toBe("train");
    // duration = 0.75 + 599/110 = 6.195454... -> nearest quarter = 6.25
    expect(leg.durationHrs).toBeCloseTo(6.25);
    // baseCost = 12 + 0.14*599 = 95.86; cost = round(95.86/5)*5 = 95
    expect(leg.cost).toBe(95);
  });

  it("switches to flight at 600km", () => {
    const to = cityAtKm(600);
    const leg = pickTransportLeg(origin, to, fixtureIntent({ vibe: { budget: "comfort" } }));
    expect(leg.mode).toBe("flight");
    // duration = 2.5 + 600/750 = 3.3 -> nearest quarter = 3.25
    expect(leg.durationHrs).toBeCloseTo(3.25);
    // baseCost = 45 + 0.09*600 = 99; cost = round(99/5)*5 = 100
    expect(leg.cost).toBe(100);
  });

  it("applies the budget tier multiplier to cost", () => {
    const to = cityAtKm(300);
    const comfort = pickTransportLeg(origin, to, fixtureIntent({ vibe: { budget: "comfort" } }));
    const luxury = pickTransportLeg(origin, to, fixtureIntent({ vibe: { budget: "luxury" } }));
    const backpacker = pickTransportLeg(origin, to, fixtureIntent({ vibe: { budget: "backpacker" } }));

    expect(comfort.mode).toBe("train");
    expect(comfort.cost).toBe(55); // baseCost 54 * 1 -> round(10.8)*5 = 55
    expect(luxury.cost).toBe(85); // baseCost 54 * 1.6 = 86.4 -> round(17.28)*5 = 85
    expect(backpacker.mode).toBe("bus");
    expect(backpacker.cost).toBe(20); // baseCost 26 * 0.85 = 22.1 -> round(4.42)*5 = 20
    expect(luxury.cost).toBeGreaterThan(comfort.cost);
  });

  it("derives a content-based, deterministic id", () => {
    const to = cityAtKm(200);
    const leg = pickTransportLeg(origin, to, fixtureIntent({ vibe: { budget: "comfort" } }));
    expect(leg.id).toBe(`leg-${origin.id}-${to.id}`);
    expect(leg.fromCityId).toBe(origin.id);
    expect(leg.toCityId).toBe(to.id);
    expect(leg.from).toBe(origin.name);
    expect(leg.to).toBe(to.name);
  });
});
