import { describe, expect, it } from "vitest";
import { TripIntent } from "../types";
import { intentFromHeroParams } from "./heroPrefill";

const BASE: TripIntent = {
  mode: "surprise",
  originCityId: "paris-fr",
  selectedCityIds: [],
  duration: 7,
  companions: "solo",
  interests: [],
  region: "any",
  vibe: { pace: "balanced", budget: "comfort", climate: "any" },
};

describe("intentFromHeroParams", () => {
  it("maps destination, date, travelers, and budget onto the base intent", () => {
    const intent = intentFromHeroParams(
      new URLSearchParams(
        "destination=barcelona-es&date=2026-08-01&travelers=couple&budget=luxury",
      ),
      BASE,
    );
    expect(intent).toEqual({
      ...BASE,
      mode: "custom",
      selectedCityIds: ["barcelona-es"],
      companions: "couple",
      startDate: "2026-08-01",
      travelMonth: 7,
      vibe: { ...BASE.vibe, budget: "luxury" },
    });
  });

  it("maps a valid travel month and ignores an invalid one", () => {
    const withMonth = intentFromHeroParams(
      new URLSearchParams("destination=barcelona-es&month=6"),
      BASE,
    );
    expect(withMonth?.travelMonth).toBe(6);

    const badMonth = intentFromHeroParams(
      new URLSearchParams("destination=barcelona-es&month=13"),
      BASE,
    );
    expect(badMonth?.travelMonth).toBeUndefined();
  });

  it("ignores an unknown destination but keeps the other fields", () => {
    const intent = intentFromHeroParams(
      new URLSearchParams("destination=atlantis&budget=backpacker"),
      BASE,
    );
    expect(intent).toEqual({
      ...BASE,
      vibe: { ...BASE.vibe, budget: "backpacker" },
    });
    expect(intent?.mode).toBe("surprise");
  });

  it("ignores invalid travelers and budget values", () => {
    const intent = intentFromHeroParams(
      new URLSearchParams("destination=rome-it&travelers=friends&budget=standard"),
      BASE,
    );
    expect(intent).toEqual({
      ...BASE,
      mode: "custom",
      selectedCityIds: ["rome-it"],
    });
  });

  it("maps a valid origin (from /flights redirects) and ignores an unknown one", () => {
    const withOrigin = intentFromHeroParams(
      new URLSearchParams("destination=rome-it&origin=barcelona-es"),
      BASE,
    );
    expect(withOrigin?.originCityId).toBe("barcelona-es");

    const badOrigin = intentFromHeroParams(
      new URLSearchParams("destination=rome-it&origin=atlantis"),
      BASE,
    );
    expect(badOrigin?.originCityId).toBe("paris-fr");

    // origin alone is still a valid hero handoff.
    expect(
      intentFromHeroParams(new URLSearchParams("origin=rome-it"), BASE)?.originCityId,
    ).toBe("rome-it");
  });

  it("returns null for share links and for no relevant params", () => {
    expect(
      intentFromHeroParams(
        new URLSearchParams("plan=1&destination=rome-it"),
        BASE,
      ),
    ).toBeNull();
    expect(intentFromHeroParams(new URLSearchParams(""), BASE)).toBeNull();
  });

  it("carries a picked date and pins the month it falls in", () => {
    const august = intentFromHeroParams(
      new URLSearchParams("date=2026-08-01"),
      BASE,
    );
    expect(august?.startDate).toBe("2026-08-01");
    expect(august?.travelMonth).toBe(7);

    const january = intentFromHeroParams(
      new URLSearchParams("destination=rome-it&date=2026-01-15"),
      BASE,
    );
    expect(january?.startDate).toBe("2026-01-15");
    expect(january?.travelMonth).toBe(0);
  });

  it("ignores an impossible date and falls back to an explicit month", () => {
    const vague = intentFromHeroParams(
      new URLSearchParams("date=next-summer"),
      BASE,
    );
    expect(vague?.startDate).toBeUndefined();
    expect(vague?.travelMonth).toBeUndefined();

    const fallback = intentFromHeroParams(
      new URLSearchParams("date=2026-02-30&month=4"),
      BASE,
    );
    expect(fallback?.startDate).toBeUndefined();
    expect(fallback?.travelMonth).toBe(4);
  });

  it("does not mutate the base intent", () => {
    const base = structuredClone(BASE);
    intentFromHeroParams(
      new URLSearchParams("destination=rome-it&budget=luxury"),
      base,
    );
    expect(base).toEqual(BASE);
  });
});
