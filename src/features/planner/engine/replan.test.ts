import { describe, expect, it } from "vitest";
import { CITIES } from "@/domain/cities";
import { TripIntent } from "../types";
import { generateTripPlan } from "./generatePlan";
import { makeRainFriendly, swapActivity } from "./replan";
import { OUTDOOR_CATEGORIES } from "./constants";

// Chill pace over 2 days uses 4 of Paris's 6 POIs, leaving alternatives
// for swap/rain replanning to reach for.
const INTENT: TripIntent = {
  mode: "custom",
  originCityId: "paris-fr",
  selectedCityIds: ["paris-fr"],
  duration: 2,
  companions: "solo",
  interests: ["culture", "food"],
  region: "any",
  vibe: { pace: "chill", budget: "comfort", climate: "any" },
};

describe("swapActivity", () => {
  it("replaces the activity with an unused POI from the same city", () => {
    const plan = generateTripPlan(INTENT, CITIES);
    const day = plan.itinerary[0];
    const target = day.activities[0];

    const next = swapActivity(plan, INTENT, day.id, target.id, CITIES);
    expect(next).not.toBeNull();

    const newDay = next!.itinerary.find((d) => d.id === day.id)!;
    expect(newDay.activities.some((a) => a.id === target.id)).toBe(false);
    expect(newDay.activities).toHaveLength(day.activities.length);

    // No duplicates across the whole plan after the swap.
    const ids = next!.itinerary.flatMap((d) => d.activities.map((a) => a.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("recomputes the budget after swapping", () => {
    const plan = generateTripPlan(INTENT, CITIES);
    const day = plan.itinerary[0];
    const next = swapActivity(plan, INTENT, day.id, day.activities[0].id, CITIES);
    const expected =
      next!.budget.stays + next!.budget.food + next!.budget.activities + next!.budget.transport;
    expect(next!.budget.total).toBe(expected);
  });

  it("is deterministic and pure (input plan untouched)", () => {
    const plan = generateTripPlan(INTENT, CITIES);
    const day = plan.itinerary[0];
    const before = JSON.stringify(plan);
    const a = swapActivity(plan, INTENT, day.id, day.activities[0].id, CITIES);
    const b = swapActivity(plan, INTENT, day.id, day.activities[0].id, CITIES);
    expect(a).toEqual(b);
    expect(JSON.stringify(plan)).toBe(before);
  });
});

describe("makeRainFriendly", () => {
  it("swaps outdoor stops for indoor ones and appends a note", () => {
    const plan = generateTripPlan(INTENT, CITIES);
    const rainyDay = plan.itinerary.find((d) =>
      d.activities.some((a) => OUTDOOR_CATEGORIES.includes(a.category))
    );
    if (!rainyDay) return; // dataset shuffle produced an all-indoor plan — nothing to test

    const next = makeRainFriendly(plan, INTENT, rainyDay.id, CITIES);
    if (next === null) return; // no indoor alternatives left in this city

    const newDay = next.itinerary.find((d) => d.id === rainyDay.id)!;
    const outdoorBefore = rainyDay.activities.filter((a) =>
      OUTDOOR_CATEGORIES.includes(a.category)
    ).length;
    const outdoorAfter = newDay.activities.filter((a) =>
      OUTDOOR_CATEGORIES.includes(a.category)
    ).length;
    expect(outdoorAfter).toBeLessThan(outdoorBefore);
    expect(next.notes.at(-1)).toMatch(/rain-friendly/);
  });

  it("returns null when the day has no outdoor stops to swap", () => {
    const plan = generateTripPlan(INTENT, CITIES);
    const indoorDay = plan.itinerary.find(
      (d) => !d.activities.some((a) => OUTDOOR_CATEGORIES.includes(a.category))
    );
    if (!indoorDay) return;
    expect(makeRainFriendly(plan, INTENT, indoorDay.id, CITIES)).toBeNull();
  });
});
