import { describe, expect, it } from "vitest";
import { CITIES } from "@/domain/cities";
import { generateTripPlan } from "../engine";
import { TripIntent } from "../types";
import {
  dateOfDay,
  endDate,
  legDepartureDates,
  withStartDate,
  withTravelMonth,
} from "./tripDates";

describe("withStartDate", () => {
  it("pins the month the date falls in", () => {
    expect(withStartDate("2026-05-04")).toEqual({
      startDate: "2026-05-04",
      travelMonth: 4,
    });
  });

  it("clears both for a date that doesn't exist", () => {
    expect(withStartDate("2026-02-30")).toEqual({
      startDate: undefined,
      travelMonth: undefined,
    });
    expect(withStartDate("")).toEqual({
      startDate: undefined,
      travelMonth: undefined,
    });
  });
});

describe("withTravelMonth", () => {
  it("drops the exact date, which a loose month contradicts", () => {
    expect(withTravelMonth(6)).toEqual({ startDate: undefined, travelMonth: 6 });
    expect(withTravelMonth(undefined)).toEqual({
      startDate: undefined,
      travelMonth: undefined,
    });
  });
});

describe("dateOfDay", () => {
  it("counts from day 1, not day 0", () => {
    expect(dateOfDay("2026-05-04", 1)).toBe("2026-05-04");
    expect(dateOfDay("2026-05-04", 9)).toBe("2026-05-12");
  });

  it("returns null without a usable start date", () => {
    expect(dateOfDay(undefined, 3)).toBeNull();
    expect(dateOfDay("soon", 3)).toBeNull();
    expect(dateOfDay("2026-05-04", 0)).toBeNull();
  });
});

describe("endDate", () => {
  it("is the last day of the trip, not the day after", () => {
    expect(endDate("2026-05-04", 9)).toBe("2026-05-12");
  });
});

describe("legDepartureDates", () => {
  // Paris home, two Italian stops: a flight out, a train between, a flight back.
  const INTENT: TripIntent = {
    mode: "custom",
    originCityId: "paris-fr",
    selectedCityIds: ["rome-it", "florence-it"],
    duration: 6,
    startDate: "2026-05-04",
    travelMonth: 4,
    companions: "solo",
    interests: ["culture"],
    region: "any",
    vibe: { pace: "balanced", budget: "comfort", climate: "any" },
  };

  it("leaves on day 1, moves on when the next stay begins, and flies home on the last day", () => {
    const plan = generateTripPlan(INTENT, CITIES);
    const dates = legDepartureDates(plan, INTENT.startDate);

    expect(dates.get(plan.outbound!.id)).toBe("2026-05-04");

    // The second stop starts the day after the first one ends.
    const firstStopDays = plan.stops[0].days;
    expect(dates.get(plan.legs[0].id)).toBe(
      dateOfDay(INTENT.startDate, firstStopDays + 1),
    );

    expect(dates.get(plan.homebound!.id)).toBe(
      dateOfDay(INTENT.startDate, plan.itinerary.length),
    );
  });

  it("covers every leg the traveler rides", () => {
    const plan = generateTripPlan(INTENT, CITIES);
    const dates = legDepartureDates(plan, INTENT.startDate);
    expect(dates.size).toBe(plan.legs.length + 2);
  });

  it("is empty for an undated trip, so searches stay flexible", () => {
    const plan = generateTripPlan({ ...INTENT, startDate: undefined }, CITIES);
    expect(legDepartureDates(plan, undefined).size).toBe(0);
  });
});
