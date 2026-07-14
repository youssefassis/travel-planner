import { describe, expect, it } from "vitest";
import { Activity, ItineraryDay } from "../types";
import { DAY_START_MIN, DINNER, LUNCH } from "./constants";
import { buildDaySchedule, formatClock } from "./schedule";

function activity(overrides: Partial<Activity> & { id: string }): Activity {
  return {
    name: "Test Stop",
    category: "sight",
    price: 0,
    location: { lat: 48.85, lng: 2.35 },
    cityId: "paris-fr",
    city: "Paris",
    durationHrs: 1.5,
    mustSee: false,
    bookAhead: false,
    why: "test",
    ...overrides,
  };
}

function day(activities: Activity[]): ItineraryDay {
  return { id: "day-1-paris-fr", label: "Day 1", cityId: "paris-fr", city: "Paris", activities };
}

describe("buildDaySchedule", () => {
  it("starts the day at 09:30 with no walk before the first stop", () => {
    const schedule = buildDaySchedule(day([activity({ id: "a" })]), "balanced");
    const first = schedule.items[0];
    expect(first.kind).toBe("activity");
    expect(first.startMin).toBe(DAY_START_MIN);
    if (first.kind === "activity") expect(first.walkMin).toBe(0);
  });

  it("always schedules lunch (≥12:30) and dinner (≥19:00), in order", () => {
    const schedule = buildDaySchedule(
      day([
        activity({ id: "a", durationHrs: 2 }),
        activity({ id: "b", durationHrs: 2, location: { lat: 48.86, lng: 2.36 } }),
        activity({ id: "c", durationHrs: 1.5, location: { lat: 48.87, lng: 2.34 } }),
      ]),
      "balanced"
    );
    const meals = schedule.items.filter((i) => i.kind === "meal");
    expect(meals.map((m) => m.kind === "meal" && m.label)).toEqual(["Lunch", "Dinner"]);
    expect(meals[0].startMin).toBeGreaterThanOrEqual(LUNCH.earliestMin);
    expect(meals[1].startMin).toBeGreaterThanOrEqual(DINNER.earliestMin);

    for (let i = 1; i < schedule.items.length; i++) {
      expect(schedule.items[i].startMin).toBeGreaterThanOrEqual(
        schedule.items[i - 1].endMin
      );
    }
  });

  it("adds walking time between distant stops", () => {
    const schedule = buildDaySchedule(
      day([
        activity({ id: "a", location: { lat: 48.85, lng: 2.29 } }),
        activity({ id: "b", location: { lat: 48.86, lng: 2.34 } }), // ~3.7 km away
      ]),
      "balanced"
    );
    const second = schedule.items.find(
      (i) => i.kind === "activity" && i.activity.id === "b"
    );
    expect(second?.kind === "activity" && second.walkMin).toBeGreaterThan(0);
  });

  it("rates a heavy day as packed and a light day as relaxed", () => {
    const heavy = buildDaySchedule(
      day([
        activity({ id: "a", durationHrs: 2 }),
        activity({ id: "b", durationHrs: 2 }),
        activity({ id: "c", durationHrs: 2 }),
      ]),
      "chill" // budget 5h < 6h planned
    );
    expect(heavy.load).toBe("packed");

    const light = buildDaySchedule(day([activity({ id: "a", durationHrs: 1.5 })]), "intense");
    expect(light.load).toBe("relaxed");
  });

  it("is deterministic", () => {
    const d = day([activity({ id: "a" }), activity({ id: "b" })]);
    expect(buildDaySchedule(d, "balanced")).toEqual(buildDaySchedule(d, "balanced"));
  });
});

describe("meal + nightlife integration", () => {
  it("uses a cheap food stop as the lunch venue instead of a daytime visit", () => {
    const schedule = buildDaySchedule(
      day([
        activity({ id: "sight", category: "sight" }),
        activity({ id: "cafe", category: "food", price: 15, durationHrs: 1.5 }),
      ]),
      "balanced"
    );
    const lunch = schedule.items.find((i) => i.kind === "meal" && i.label === "Lunch");
    expect(lunch?.kind === "meal" && lunch.activity?.id).toBe("cafe");
    // The café must not also appear as a regular daytime stop.
    const asActivity = schedule.items.filter(
      (i) => i.kind === "activity" && i.activity.id === "cafe"
    );
    expect(asActivity).toHaveLength(0);
    expect(lunch!.startMin).toBeGreaterThanOrEqual(LUNCH.earliestMin);
  });

  it("sends an expensive restaurant to dinner and keeps lunch generic", () => {
    const schedule = buildDaySchedule(
      day([
        activity({ id: "sight", category: "sight" }),
        activity({ id: "resto", category: "food", price: 40, durationHrs: 1.5 }),
      ]),
      "balanced"
    );
    const lunch = schedule.items.find((i) => i.kind === "meal" && i.label === "Lunch");
    const dinner = schedule.items.find((i) => i.kind === "meal" && i.label === "Dinner");
    expect(lunch?.kind === "meal" && lunch.activity).toBeUndefined();
    expect(dinner?.kind === "meal" && dinner.activity?.id).toBe("resto");
  });

  it("splits two restaurants: cheaper to lunch, pricier to dinner", () => {
    const schedule = buildDaySchedule(
      day([
        activity({ id: "cafe", category: "food", price: 12 }),
        activity({ id: "resto", category: "food", price: 45 }),
      ]),
      "balanced"
    );
    const lunch = schedule.items.find((i) => i.kind === "meal" && i.label === "Lunch");
    const dinner = schedule.items.find((i) => i.kind === "meal" && i.label === "Dinner");
    expect(lunch?.kind === "meal" && lunch.activity?.id).toBe("cafe");
    expect(dinner?.kind === "meal" && dinner.activity?.id).toBe("resto");
  });

  it("schedules nightlife after dinner, never in the morning", () => {
    const schedule = buildDaySchedule(
      day([
        activity({ id: "bar", category: "nightlife", durationHrs: 2 }),
        activity({ id: "sight", category: "sight" }),
      ]),
      "balanced"
    );
    const bar = schedule.items.find(
      (i) => i.kind === "activity" && i.activity.id === "bar"
    );
    const dinner = schedule.items.find((i) => i.kind === "meal" && i.label === "Dinner");
    expect(bar!.startMin).toBeGreaterThanOrEqual(dinner!.endMin);
  });
});

describe("formatClock", () => {
  it("formats minutes since midnight as 12h clock", () => {
    expect(formatClock(570)).toBe("9:30 AM");
    expect(formatClock(750)).toBe("12:30 PM");
    expect(formatClock(1170)).toBe("7:30 PM");
  });
});
