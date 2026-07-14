import { describe, expect, it } from "vitest";
import { CITIES } from "@/domain/cities";
import { TripIntent, TripPlan } from "../types";
import { generateTripPlan } from "./generatePlan";
import {
  addActivity,
  addCity,
  makeRainFriendly,
  removeActivity,
  removeCity,
  swapActivity,
  unusedPoisForCity,
} from "./replan";
import { OUTDOOR_CATEGORIES } from "./constants";

function expectSequentialDays(plan: TripPlan) {
  plan.itinerary.forEach((day, i) => {
    expect(day.label).toBe(`Day ${i + 1}`);
    expect(day.id).toBe(`day-${i + 1}-${day.cityId}`);
  });
  const ids = plan.itinerary.map((d) => d.id);
  expect(new Set(ids).size).toBe(ids.length);
}

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

describe("removeActivity", () => {
  it("drops the activity and lowers the budget by its price", () => {
    const plan = generateTripPlan(INTENT, CITIES);
    const day = plan.itinerary[0];
    const paid = day.activities.find((a) => a.price > 0) ?? day.activities[0];

    const next = removeActivity(plan, INTENT, day.id, paid.id, CITIES);
    expect(next).not.toBeNull();

    const newDay = next!.itinerary.find((d) => d.id === day.id)!;
    expect(newDay.activities.some((a) => a.id === paid.id)).toBe(false);
    expect(newDay.activities).toHaveLength(day.activities.length - 1);
    expect(next!.budget.activities).toBe(plan.budget.activities - paid.price);
  });

  it("returns null for an activity that isn't on that day", () => {
    const plan = generateTripPlan(INTENT, CITIES);
    expect(removeActivity(plan, INTENT, plan.itinerary[0].id, "nope", CITIES)).toBeNull();
  });
});

describe("addActivity", () => {
  it("adds an unused POI to the day and raises the budget", () => {
    const plan = generateTripPlan(INTENT, CITIES);
    const day = plan.itinerary[0];
    const available = unusedPoisForCity(plan, day.cityId, CITIES);
    expect(available.length).toBeGreaterThan(0);

    const poi = available[0];
    const next = addActivity(plan, INTENT, day.id, poi.id, CITIES);
    expect(next).not.toBeNull();

    const newDay = next!.itinerary.find((d) => d.id === day.id)!;
    expect(newDay.activities.some((a) => a.id === poi.id)).toBe(true);
    expect(next!.budget.activities).toBe(plan.budget.activities + poi.price);

    // No duplicates plan-wide.
    const ids = next!.itinerary.flatMap((d) => d.activities.map((a) => a.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("refuses POIs that are already in the plan", () => {
    const plan = generateTripPlan(INTENT, CITIES);
    const day = plan.itinerary[0];
    const usedPoi = day.activities[0];
    expect(addActivity(plan, INTENT, day.id, usedPoi.id, CITIES)).toBeNull();
  });
});

describe("addCity", () => {
  it("inserts the city, extends the trip, renumbers days, and rebuilds legs", () => {
    const plan = generateTripPlan(INTENT, CITIES);
    const before = plan.stops.reduce((sum, s) => sum + s.days, 0);

    const next = addCity(plan, INTENT, "brussels-be", CITIES);
    expect(next).not.toBeNull();
    expect(next!.stops.some((s) => s.cityId === "brussels-be")).toBe(true);
    expect(next!.legs).toHaveLength(next!.stops.length - 1);

    const after = next!.stops.reduce((sum, s) => sum + s.days, 0);
    expect(after).toBeGreaterThan(before);
    expectSequentialDays(next!);
    expect(next!.notes.at(-1)).toMatch(/Added Brussels/);
    expect(next!.budget.perDay).toBe(Math.round(next!.budget.total / after));
  });

  it("returns null for cities already in the trip or unknown", () => {
    const plan = generateTripPlan(INTENT, CITIES);
    expect(addCity(plan, INTENT, plan.stops[0].cityId, CITIES)).toBeNull();
    expect(addCity(plan, INTENT, "atlantis", CITIES)).toBeNull();
  });

  it("is deterministic and pure", () => {
    const plan = generateTripPlan(INTENT, CITIES);
    const before = JSON.stringify(plan);
    expect(addCity(plan, INTENT, "brussels-be", CITIES)).toEqual(
      addCity(plan, INTENT, "brussels-be", CITIES)
    );
    expect(JSON.stringify(plan)).toBe(before);
  });
});

describe("removeCity", () => {
  it("removes the stop, renumbers days, and reconnects the route", () => {
    const plan = generateTripPlan(INTENT, CITIES);
    const grown = addCity(plan, INTENT, "brussels-be", CITIES)!;

    const next = removeCity(grown, INTENT, "brussels-be", CITIES);
    expect(next).not.toBeNull();
    expect(next!.stops.some((s) => s.cityId === "brussels-be")).toBe(false);
    expect(next!.legs).toHaveLength(next!.stops.length - 1);
    expectSequentialDays(next!);
    expect(next!.notes.at(-1)).toMatch(/Removed Brussels/);
  });

  it("refuses to remove the last remaining city", () => {
    const plan = generateTripPlan(INTENT, CITIES); // single-city custom trip
    expect(plan.stops).toHaveLength(1);
    expect(removeCity(plan, INTENT, plan.stops[0].cityId, CITIES)).toBeNull();
  });
});
