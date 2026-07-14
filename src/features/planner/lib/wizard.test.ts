import { describe, expect, it } from "vitest";
import { TripIntent } from "../types";
import {
  WIZARD_STEPS,
  canEnterStep,
  firstInvalidStep,
  validateStep,
} from "./wizard";

const VALID: TripIntent = {
  mode: "surprise",
  originCityId: "paris-fr",
  selectedCityIds: [],
  duration: 7,
  companions: "solo",
  interests: [],
  region: "any",
  vibe: { pace: "balanced", budget: "comfort", climate: "any" },
};

describe("validateStep", () => {
  it("accepts the default intent on every step", () => {
    for (const step of WIZARD_STEPS) {
      expect(validateStep(step.id, VALID)).toEqual([]);
    }
  });

  it("rejects an unknown origin city", () => {
    expect(
      validateStep("route", { ...VALID, originCityId: "atlantis" }),
    ).not.toEqual([]);
  });

  it("rejects out-of-range and non-integer durations", () => {
    for (const duration of [0, 31, 2.5, NaN]) {
      expect(validateStep("route", { ...VALID, duration })).not.toEqual([]);
    }
    for (const duration of [1, 30]) {
      expect(validateStep("route", { ...VALID, duration })).toEqual([]);
    }
  });

  it("requires at least one valid city in custom mode", () => {
    const custom = { ...VALID, mode: "custom" as const };
    expect(validateStep("route", custom)).not.toEqual([]);
    expect(
      validateStep("route", { ...custom, selectedCityIds: ["rome-it"] }),
    ).toEqual([]);
    expect(
      validateStep("route", { ...custom, selectedCityIds: ["atlantis"] }),
    ).not.toEqual([]);
  });

  it("party and style never block", () => {
    const broken = { ...VALID, mode: "custom" as const, duration: 99 };
    expect(validateStep("party", broken)).toEqual([]);
    expect(validateStep("style", broken)).toEqual([]);
  });
});

describe("step machine", () => {
  it("firstInvalidStep is the step count when everything is valid", () => {
    expect(firstInvalidStep(VALID)).toBe(WIZARD_STEPS.length);
  });

  it("an invalid route blocks the whole flow", () => {
    const invalid = { ...VALID, mode: "custom" as const };
    expect(firstInvalidStep(invalid)).toBe(0);
    expect(canEnterStep(0, invalid)).toBe(true);
    expect(canEnterStep(1, invalid)).toBe(false);
    expect(canEnterStep(2, invalid)).toBe(false);
  });

  it("every step is enterable when all are valid", () => {
    for (let i = 0; i < WIZARD_STEPS.length; i++) {
      expect(canEnterStep(i, VALID)).toBe(true);
    }
  });

  it("rejects out-of-bounds step indexes", () => {
    expect(canEnterStep(-1, VALID)).toBe(false);
    expect(canEnterStep(WIZARD_STEPS.length, VALID)).toBe(false);
  });
});
