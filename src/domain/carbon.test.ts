import { describe, expect, it } from "vitest";
import {
  EmittingLeg,
  emissionsIfFlownKg,
  legEmissionsKg,
  savingVsFlying,
  totalEmissionsKg,
} from "./carbon";

const leg = (mode: EmittingLeg["mode"], distanceKm: number): EmittingLeg => ({
  mode,
  distanceKm,
});

describe("legEmissionsKg", () => {
  it("ranks the modes the way the physics does", () => {
    const km = 500;
    const flight = legEmissionsKg(leg("flight", km));
    const car = legEmissionsKg(leg("car", km));
    const train = legEmissionsKg(leg("train", km));
    const bus = legEmissionsKg(leg("bus", km));

    expect(flight).toBeGreaterThan(car);
    expect(car).toBeGreaterThan(train);
    expect(train).toBeGreaterThan(bus);
  });

  it("makes a short flight several times a train", () => {
    const ratio = legEmissionsKg(leg("flight", 500)) / legEmissionsKg(leg("train", 500));
    expect(ratio).toBeGreaterThan(5);
    expect(ratio).toBeLessThan(10);
  });

  it("scales with distance and is zero for none", () => {
    expect(legEmissionsKg(leg("train", 1000))).toBeCloseTo(
      legEmissionsKg(leg("train", 500)) * 2,
    );
    expect(legEmissionsKg(leg("train", 0))).toBe(0);
  });

  it("lands in the right ballpark for a real journey", () => {
    // Milan–Rome by train, ~477 km apart: a few tens of kg at most.
    const kg = legEmissionsKg(leg("train", 477));
    expect(kg).toBeGreaterThan(10);
    expect(kg).toBeLessThan(40);
  });
});

describe("totalEmissionsKg", () => {
  it("adds the legs up, and is zero for a trip with none", () => {
    const legs = [leg("train", 300), leg("flight", 800)];
    expect(totalEmissionsKg(legs)).toBeCloseTo(
      legEmissionsKg(legs[0]) + legEmissionsKg(legs[1]),
    );
    expect(totalEmissionsKg([])).toBe(0);
  });
});

describe("savingVsFlying", () => {
  it("is most of the footprint for a rail trip", () => {
    const saving = savingVsFlying([leg("train", 400), leg("train", 300)]);
    expect(saving).toBeGreaterThan(0.8);
    expect(saving).toBeLessThan(1);
  });

  it("is nothing when the trip already flies everywhere", () => {
    expect(savingVsFlying([leg("flight", 800), leg("flight", 600)])).toBe(0);
  });

  it("is nothing, not an error, for a trip with no legs", () => {
    expect(savingVsFlying([])).toBe(0);
    expect(emissionsIfFlownKg([])).toBe(0);
  });

  it("sits in between for a mixed trip", () => {
    const saving = savingVsFlying([leg("flight", 800), leg("train", 400)]);
    expect(saving).toBeGreaterThan(0);
    expect(saving).toBeLessThan(0.5);
  });
});
