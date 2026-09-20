import { describe, expect, it } from "vitest";
import { CITIES } from "@/domain/cities";
import { buildDaySchedule, generateTripPlan } from "../engine";
import { TripIntent } from "../types";
import { localISODate, localMinutes, nowAndNext, tripProgress } from "./today";

const INTENT: TripIntent = {
  mode: "custom",
  originCityId: "paris-fr",
  selectedCityIds: ["rome-it", "naples-it"],
  duration: 6,
  startDate: "2026-05-04",
  travelMonth: 4,
  companions: "solo",
  interests: ["culture", "food"],
  region: "any",
  vibe: { pace: "balanced", budget: "comfort", climate: "any" },
};

const PLAN = generateTripPlan(INTENT, CITIES);

describe("tripProgress", () => {
  it("counts down before the trip starts", () => {
    const progress = tripProgress(PLAN, INTENT.startDate, "2026-05-01");
    expect(progress).toMatchObject({ phase: "before", daysUntil: 3 });
  });

  it("puts the traveller on day 1 on the start date itself", () => {
    const progress = tripProgress(PLAN, INTENT.startDate, "2026-05-04");
    expect(progress).toMatchObject({ phase: "during", dayNumber: 1 });
  });

  it("tracks the right day mid-trip", () => {
    const progress = tripProgress(PLAN, INTENT.startDate, "2026-05-07");
    expect(progress).toMatchObject({ phase: "during", dayNumber: 4 });
    expect(progress.phase === "during" && progress.day).toBe(PLAN.itinerary[3]);
  });

  it("still counts the final day as part of the trip", () => {
    const last = PLAN.itinerary.length; // 6 days → 2026-05-09
    const progress = tripProgress(PLAN, INTENT.startDate, "2026-05-09");
    expect(progress).toMatchObject({ phase: "during", dayNumber: last });
  });

  it("is over the day after the last one", () => {
    expect(tripProgress(PLAN, INTENT.startDate, "2026-05-10")).toMatchObject({
      phase: "after",
      daysSince: 1,
    });
  });

  it("has nothing to say about an undated trip", () => {
    expect(tripProgress(PLAN, undefined, "2026-05-07")).toEqual({ phase: "undated" });
    expect(tripProgress(PLAN, "someday", "2026-05-07")).toEqual({ phase: "undated" });
  });
});

describe("nowAndNext", () => {
  const schedule = buildDaySchedule(PLAN.itinerary[1], "balanced");
  const first = schedule.items[0];
  const last = schedule.items[schedule.items.length - 1];

  it("has nothing current before the day begins, and everything ahead", () => {
    const { current, next, done, upcoming } = nowAndNext(schedule, first.startMin - 30);
    expect(current).toBeNull();
    expect(done).toEqual([]);
    expect(next).toBe(first);
    expect(upcoming).toHaveLength(schedule.items.length);
  });

  it("holds an item as current for its whole span", () => {
    const midway = Math.floor((first.startMin + first.endMin) / 2);
    expect(nowAndNext(schedule, midway).current).toBe(first);
    expect(nowAndNext(schedule, first.startMin).current).toBe(first);
  });

  it("moves on the moment an item ends", () => {
    const { current, done } = nowAndNext(schedule, first.endMin);
    expect(current).not.toBe(first);
    expect(done).toContain(first);
  });

  it("has nothing left once the day is over", () => {
    const { current, next, upcoming } = nowAndNext(schedule, last.endMin + 1);
    expect(current).toBeNull();
    expect(next).toBeNull();
    expect(upcoming).toEqual([]);
  });

  it("accounts for every item exactly once", () => {
    const midway = Math.floor((first.startMin + last.endMin) / 2);
    const { current, done, upcoming } = nowAndNext(schedule, midway);
    const counted = done.length + upcoming.length + (current ? 1 : 0);
    expect(counted).toBe(schedule.items.length);
  });
});

describe("reading the local clock", () => {
  it("uses the traveller's own calendar date, not UTC's", () => {
    // 23:30 on the 4th in a zone ahead of UTC is still the 4th to them.
    const late = new Date(2026, 4, 4, 23, 30);
    expect(localISODate(late)).toBe("2026-05-04");
    expect(localMinutes(late)).toBe(23 * 60 + 30);
  });

  it("pads single-digit months and days", () => {
    expect(localISODate(new Date(2026, 0, 9, 8, 5))).toBe("2026-01-09");
    expect(localMinutes(new Date(2026, 0, 9, 8, 5))).toBe(485);
  });
});
