import { describe, expect, it } from "vitest";
import { CITIES } from "@/domain/cities";
import { generateTripPlan } from "@/features/planner/engine";
import { withStartDate } from "@/features/planner/lib/tripDates";
import { TripIntent } from "@/features/planner/types";
import { tripStatus } from "./status";

const BASE: TripIntent = {
  mode: "custom",
  originCityId: "paris-fr",
  selectedCityIds: ["rome-it", "florence-it"],
  duration: 5,
  companions: "couple",
  interests: ["culture"],
  region: "any",
  vibe: { pace: "balanced", budget: "comfort", climate: "any" },
};

const INTENT: TripIntent = { ...BASE, ...withStartDate("2026-06-10") };
const PLAN = generateTripPlan(INTENT, CITIES);

describe("tripStatus", () => {
  it("counts down to departure", () => {
    expect(tripStatus(PLAN, INTENT, "2026-06-01")).toEqual({
      label: "Starts in 9 days",
      tone: "brand",
    });
  });

  it("says tomorrow when it is tomorrow", () => {
    expect(tripStatus(PLAN, INTENT, "2026-06-09").label).toBe("Starts tomorrow");
  });

  it("tracks the running trip by day", () => {
    expect(tripStatus(PLAN, INTENT, "2026-06-12")).toEqual({
      label: "Day 3 of 5",
      tone: "success",
    });
  });

  it("files a finished trip as past", () => {
    expect(tripStatus(PLAN, INTENT, "2026-07-01").tone).toBe("neutral");
    expect(tripStatus(PLAN, INTENT, "2026-07-01").label).toBe("Past trip");
  });

  it("stays quiet about a trip with no dates", () => {
    expect(tripStatus(generateTripPlan(BASE, CITIES), BASE, "2026-06-12")).toEqual({
      label: "No dates yet",
      tone: "neutral",
    });
  });
});
