import { describe, it, expect } from "vitest";
import { City, Poi } from "@/domain/types";
import { TripIntent } from "../types";
import { ACTIVITIES_PER_DAY } from "./constants";
import { buildCityDayPlans } from "./dayPlans";

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

function makePois(n: number): Poi[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `poi-${i}`,
    name: `Poi ${i}`,
    category: "sight" as const,
    coords: { lat: 0, lng: 0 },
    price: 10,
  }));
}

describe("buildCityDayPlans", () => {
  it("schedules ACTIVITIES_PER_DAY activities per day when enough POIs exist", () => {
    const city = fixtureCity({ pois: makePois(20) });
    for (const pace of ["chill", "balanced", "intense"] as const) {
      const intent = fixtureIntent({ vibe: { pace } });
      const days = buildCityDayPlans(city, 3, intent, 1);
      for (const day of days) {
        expect(day.activities).toHaveLength(ACTIVITIES_PER_DAY[pace]);
      }
    }
  });

  it("never schedules the same real POI twice across the whole city stay", () => {
    const city = fixtureCity({ pois: makePois(10) });
    const intent = fixtureIntent({ vibe: { pace: "intense" } }); // 4/day
    const days = buildCityDayPlans(city, 3, intent, 1); // needs 12 slots, only 10 real POIs

    const realActivityIds = days
      .flatMap((d) => d.activities)
      .map((a) => a.id)
      .filter((id) => id.startsWith("poi-"));

    const unique = new Set(realActivityIds);
    expect(unique.size).toBe(realActivityIds.length);
  });

  it("pads with a synthetic free filler activity once POIs run out", () => {
    const city = fixtureCity({ id: "lisbon", name: "Lisbon", pois: makePois(2) });
    const intent = fixtureIntent({ vibe: { pace: "chill" } }); // 2/day
    const days = buildCityDayPlans(city, 5, intent, 1); // needs 10 slots, only 2 real POIs

    const allActivities = days.flatMap((d) => d.activities);
    const realCount = allActivities.filter((a) => a.id.startsWith("poi-")).length;
    const fillerActivities = allActivities.filter((a) => !a.id.startsWith("poi-"));

    expect(realCount).toBe(2);
    expect(fillerActivities).toHaveLength(8);
    for (const filler of fillerActivities) {
      expect(filler.price).toBe(0);
      expect(filler.category).toBe("activity");
      expect(filler.name).toBe("Explore Lisbon at your own pace");
      expect(filler.id).toMatch(/^lisbon-explore-\d+-\d+$/);
    }

    const fillerIds = fillerActivities.map((f) => f.id);
    expect(new Set(fillerIds).size).toBe(fillerIds.length);
  });

  it("produces correctly-indexed day ids/labels starting at startDayIndex", () => {
    const city = fixtureCity({ id: "porto", pois: makePois(20) });
    const intent = fixtureIntent();
    const days = buildCityDayPlans(city, 3, intent, 5);

    expect(days.map((d) => d.id)).toEqual(["day-5-porto", "day-6-porto", "day-7-porto"]);
    expect(days.map((d) => d.label)).toEqual(["Day 5", "Day 6", "Day 7"]);
  });
});
