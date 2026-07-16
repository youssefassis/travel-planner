import { describe, expect, it } from "vitest";
import { getCity } from "@/domain/cities";
import { TripIntent } from "../types";
import { scoreCity } from "./score";

const base: TripIntent = {
  mode: "surprise",
  originCityId: "paris-fr",
  selectedCityIds: [],
  duration: 7,
  companions: "solo",
  interests: [],
  region: "any",
  vibe: { pace: "balanced", budget: "comfort", climate: "any" },
};

const withMonth = (monthIndex: number): TripIntent => ({ ...base, travelMonth: monthIndex });

describe("scoreCity — weather-aware climate component", () => {
  it("scores a hot city lower in peak summer than in spring", () => {
    const seville = getCity("seville-es")!;
    const july = scoreCity(seville, withMonth(6));
    const april = scoreCity(seville, withMonth(3));
    expect(april).toBeGreaterThan(july); // 36°C July is penalized vs mild April
  });

  it("scores a cold-climate city higher in summer than in deep winter", () => {
    const oslo = getCity("oslo-no")!;
    const july = scoreCity(oslo, withMonth(6));
    const january = scoreCity(oslo, withMonth(0));
    expect(july).toBeGreaterThan(january);
  });

  it("falls back to the coarse climate band when no month is set", () => {
    const lisbon = getCity("lisbon-pt")!; // warm band
    const match = scoreCity(lisbon, { ...base, vibe: { ...base.vibe, climate: "warm" } });
    const miss = scoreCity(lisbon, { ...base, vibe: { ...base.vibe, climate: "cold" } });
    expect(match).toBeGreaterThan(miss);
  });
});
