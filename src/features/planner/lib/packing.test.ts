import { describe, expect, it } from "vitest";
import { CITIES } from "@/domain/cities";
import { generateTripPlan } from "../engine";
import { TripIntent } from "../types";
import { packingList } from "./packing";

const BASE: TripIntent = {
  mode: "custom",
  originCityId: "paris-fr",
  selectedCityIds: ["rome-it"],
  duration: 4,
  travelMonth: 6, // July
  companions: "solo",
  interests: ["culture"],
  region: "any",
  vibe: { pace: "balanced", budget: "comfort", climate: "any" },
};

function labels(intent: TripIntent): string[] {
  const plan = generateTripPlan(intent, CITIES);
  return packingList(plan, intent).flatMap((section) =>
    section.items.map((item) => item.label),
  );
}

/** Every label, joined, for loose "does it mention X" checks. */
const text = (intent: TripIntent) => labels(intent).join(" | ").toLowerCase();

describe("packingList", () => {
  it("always covers the staples, whatever the trip", () => {
    const list = text(BASE);
    expect(list).toContain("walking shoes");
    expect(list).toContain("passport");
    expect(list).toContain("charger");
  });

  it("drops empty sections rather than showing bare headings", () => {
    const plan = generateTripPlan(BASE, CITIES);
    for (const section of packingList(plan, BASE)) {
      expect(section.items.length).toBeGreaterThan(0);
    }
  });

  it("packs for the cold in January and for the heat in July", () => {
    const winter = text({ ...BASE, travelMonth: 0 });
    const summer = text({ ...BASE, travelMonth: 6 });

    expect(winter).toContain("warm coat");
    expect(winter).not.toContain("light, breathable");
    expect(summer).toContain("light, breathable");
    expect(summer).not.toContain("warm coat");
  });

  it("asks for sun protection where there's sun", () => {
    expect(text({ ...BASE, travelMonth: 6 })).toContain("sunscreen");
  });

  it("names the adapter for the countries on the route", () => {
    // Switzerland uses type J, which nothing else on the continent does.
    const swiss = text({
      ...BASE,
      selectedCityIds: ["zurich-ch"],
    });
    expect(swiss).toContain("type c, j");
  });

  it("warns about money when the route leaves the euro", () => {
    const euroOnly = text({ ...BASE, selectedCityIds: ["rome-it"] });
    const nonEuro = text({ ...BASE, selectedCityIds: ["prague-cz"] });

    expect(euroOnly).not.toContain("card that works abroad");
    expect(nonEuro).toContain("czech koruna");
  });

  it("adds flight kit only when the route actually flies", () => {
    // Paris → Rome is far enough to fly; Paris → Bruges is a train.
    const flying = text({ ...BASE, selectedCityIds: ["rome-it"] });
    const training = text({ ...BASE, selectedCityIds: ["bruges-be"] });

    expect(flying).toContain("100ml liquids");
    expect(training).not.toContain("100ml liquids");
  });

  it("scales the clothes to the trip, and stops at a week", () => {
    expect(text({ ...BASE, duration: 3 })).toContain("3 day's worth");
    expect(text({ ...BASE, duration: 12, selectedCityIds: ["rome-it", "naples-it"] }))
      .toContain("7 day's worth");
  });

  it("falls back to layers when no travel month is set", () => {
    const undated = text({ ...BASE, travelMonth: undefined });
    expect(undated).toContain("layers for mixed weather");
    expect(undated).not.toContain("sunscreen");
  });

  it("is pure — the same trip gives the same list", () => {
    const plan = generateTripPlan(BASE, CITIES);
    expect(packingList(plan, BASE)).toEqual(packingList(plan, BASE));
  });
});
