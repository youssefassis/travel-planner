import { describe, expect, it } from "vitest";
import { CITIES } from "@/domain/cities";
import { generateTripPlan } from "../engine";
import { TripIntent } from "../types";
import { icsFilename, planToICS } from "./calendar";

const INTENT: TripIntent = {
  mode: "custom",
  originCityId: "paris-fr",
  selectedCityIds: ["rome-it", "florence-it"],
  duration: 5,
  startDate: "2026-05-04",
  travelMonth: 4,
  companions: "couple",
  interests: ["culture", "food"],
  region: "any",
  vibe: { pace: "balanced", budget: "comfort", climate: "any" },
};

const plan = generateTripPlan(INTENT, CITIES);
const ics = planToICS(plan, INTENT.vibe.pace, INTENT.startDate) ?? "";

describe("planToICS", () => {
  it("returns null for an undated trip — there is nothing to schedule", () => {
    expect(planToICS(plan, INTENT.vibe.pace, undefined)).toBeNull();
    expect(planToICS(plan, INTENT.vibe.pace, "sometime")).toBeNull();
  });

  it("wraps the events in a valid calendar envelope", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("PRODID:-//Wanderly//Trip Planner//EN");
  });

  it("uses CRLF line endings throughout, as the spec requires", () => {
    expect(ics.split("\n").every((line) => line === "" || line.endsWith("\r"))).toBe(
      true,
    );
  });

  it("emits one balanced event per scheduled item", () => {
    const begins = ics.match(/BEGIN:VEVENT/g)?.length ?? 0;
    const ends = ics.match(/END:VEVENT/g)?.length ?? 0;
    expect(begins).toBeGreaterThan(0);
    expect(begins).toBe(ends);
  });

  it("starts the first day on the trip's start date", () => {
    expect(ics).toMatch(/DTSTART:20260504T\d{6}/);
  });

  it("writes floating local times, so 19:00 means 19:00 where you are", () => {
    expect(ics).not.toMatch(/DTSTART:\d{8}T\d{6}Z/);
    expect(ics).not.toContain("TZID");
  });

  it("gives every event a unique id", () => {
    const uids = [...ics.matchAll(/UID:(.+)\r/g)].map((m) => m[1]);
    expect(uids.length).toBeGreaterThan(0);
    expect(new Set(uids).size).toBe(uids.length);
  });

  it("escapes commas and semicolons in text fields", () => {
    const summaries = [...ics.matchAll(/SUMMARY:(.+)\r/g)].map((m) => m[1]);
    for (const summary of summaries) {
      expect(summary.replace(/\\[,;\\n]/g, "")).not.toMatch(/[,;]/);
    }
  });

  it("folds long lines to 75 octets", () => {
    for (const line of ics.split("\r\n")) {
      expect(line.length).toBeLessThanOrEqual(75);
    }
  });

  it("is deterministic — no clock, no randomness", () => {
    expect(planToICS(plan, INTENT.vibe.pace, INTENT.startDate)).toBe(ics);
  });
});

describe("icsFilename", () => {
  it("names the file after the route", () => {
    expect(icsFilename(plan)).toMatch(/^wanderly-[a-z-]+\.ics$/);
  });
});
