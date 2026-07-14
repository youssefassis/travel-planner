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
  it("maps destination, travelers, and budget onto the base intent", () => {
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
      vibe: { ...BASE.vibe, budget: "luxury" },
    });
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

  it("returns null for share links, no relevant params, or date alone", () => {
    expect(
      intentFromHeroParams(
        new URLSearchParams("plan=1&destination=rome-it"),
        BASE,
      ),
    ).toBeNull();
    expect(intentFromHeroParams(new URLSearchParams(""), BASE)).toBeNull();
    expect(
      intentFromHeroParams(new URLSearchParams("date=2026-08-01"), BASE),
    ).toBeNull();
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
