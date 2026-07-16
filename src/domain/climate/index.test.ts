import { describe, expect, it } from "vitest";
import { CITIES } from "../cities";
import { climateCityIds, getMonthlyClimate, getMonthNormal } from "./index";

describe("climate normals", () => {
  it("covers every city in the dataset", () => {
    const withClimate = new Set(climateCityIds());
    for (const city of CITIES) {
      expect(withClimate.has(city.id)).toBe(true);
    }
  });

  it("gives every city exactly 12 months", () => {
    for (const id of climateCityIds()) {
      expect(getMonthlyClimate(id)?.months).toHaveLength(12);
    }
  });

  it("keeps highs at or above lows every month", () => {
    for (const id of climateCityIds()) {
      for (const m of getMonthlyClimate(id)!.months) {
        expect(m.high).toBeGreaterThanOrEqual(m.low);
      }
    }
  });

  it("keeps values within plausible European ranges", () => {
    for (const id of climateCityIds()) {
      for (const m of getMonthlyClimate(id)!.months) {
        expect(m.high).toBeGreaterThanOrEqual(-15);
        expect(m.high).toBeLessThanOrEqual(45);
        expect(m.rainDays).toBeGreaterThanOrEqual(0);
        expect(m.rainDays).toBeLessThanOrEqual(31);
        expect(m.sunHours).toBeGreaterThanOrEqual(0);
        expect(m.sunHours).toBeLessThanOrEqual(14);
      }
    }
  });

  it("labels months January-first", () => {
    expect(getMonthNormal("paris-fr", 0)?.month).toBe("Jan");
    expect(getMonthNormal("paris-fr", 11)?.month).toBe("Dec");
  });

  it("returns undefined for unknown cities", () => {
    expect(getMonthlyClimate("atlantis-xx")).toBeUndefined();
  });
});
