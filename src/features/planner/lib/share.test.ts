import { describe, expect, it } from "vitest";
import { CITIES } from "@/domain/cities";
import { TripIntent } from "../types";
import { generateTripPlan } from "../engine";
import {
  buildShareUrl,
  googleMapsRouteUrl,
  intentFromShareParams,
  intentToShareParams,
  planToText,
} from "./share";

const SURPRISE: TripIntent = {
  mode: "surprise",
  originCityId: "paris-fr",
  selectedCityIds: [],
  duration: 7,
  companions: "couple",
  interests: ["food", "art"],
  region: "italy",
  vibe: { pace: "chill", budget: "luxury", climate: "warm" },
};

const CUSTOM: TripIntent = {
  mode: "custom",
  originCityId: "lisbon-pt",
  selectedCityIds: ["lisbon-pt", "porto-pt"],
  duration: 5,
  companions: "solo",
  interests: [],
  region: "any",
  vibe: { pace: "balanced", budget: "comfort", climate: "any" },
};

describe("share link round trip", () => {
  it("encodes and decodes a surprise-mode intent losslessly", () => {
    const decoded = intentFromShareParams(intentToShareParams(SURPRISE));
    expect(decoded).toEqual(SURPRISE);
  });

  it("encodes and decodes a custom-mode intent losslessly", () => {
    const decoded = intentFromShareParams(intentToShareParams(CUSTOM));
    expect(decoded).toEqual(CUSTOM);
  });

  it("a shared link regenerates the identical plan", () => {
    const decoded = intentFromShareParams(intentToShareParams(SURPRISE))!;
    expect(generateTripPlan(decoded, CITIES)).toEqual(generateTripPlan(SURPRISE, CITIES));
  });

  it("rejects non-share params and unknown cities", () => {
    expect(intentFromShareParams(new URLSearchParams("from=paris-fr&d=7"))).toBeNull();
    expect(
      intentFromShareParams(new URLSearchParams("plan=1&from=atlantis&d=7"))
    ).toBeNull();
    expect(
      intentFromShareParams(new URLSearchParams("plan=1&from=paris-fr&d=99"))
    ).toBeNull();
  });

  it("builds an absolute planner URL", () => {
    const url = buildShareUrl(SURPRISE, "https://wanderly.app");
    expect(url).toMatch(/^https:\/\/wanderly\.app\/planner\?plan=1&/);
  });
});

describe("googleMapsRouteUrl", () => {
  it("chains every stop's coordinates into a directions URL", () => {
    const plan = generateTripPlan(CUSTOM, CITIES);
    const url = googleMapsRouteUrl(plan.stops);
    expect(url).toMatch(/^https:\/\/www\.google\.com\/maps\/dir\//);
    expect(url.split("/dir/")[1].split("/")).toHaveLength(plan.stops.length);
  });
});

describe("planToText", () => {
  it("includes the route, every day, times, and the booking list", () => {
    const plan = generateTripPlan(CUSTOM, CITIES);
    const text = planToText(plan, CUSTOM.vibe.pace);
    expect(text).toContain("Trip plan:");
    expect(text).toContain(`€${plan.budget.total}`);
    for (const day of plan.itinerary) {
      expect(text).toContain(`${day.label} · ${day.city}`);
    }
    expect(text).toMatch(/\d+:\d+ (AM|PM)/);
    if (plan.itinerary.some((d) => d.activities.some((a) => a.bookAhead))) {
      expect(text).toContain("Book before you go:");
    }
  });
});
