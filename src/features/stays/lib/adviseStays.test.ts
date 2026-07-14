import { describe, expect, it } from "vitest";
import { StayPreferences } from "../types";
import { adviseStays } from "./adviseStays";
import { getNeighborhoods, getStays } from "./stays";

const PREFS: StayPreferences = {
  cityId: "barcelona-es",
  party: "couple",
  nights: 5,
  budgetPerNight: 250,
  styles: ["walkable", "cafes", "architecture", "quiet"],
};

describe("getStays / getNeighborhoods", () => {
  it("is deterministic", () => {
    expect(getStays("barcelona-es")).toEqual(getStays("barcelona-es"));
    expect(getNeighborhoods("barcelona-es")).toEqual(getNeighborhoods("barcelona-es"));
  });

  it("returns 8-10 stays, each assigned to a real neighborhood of the city", () => {
    const stays = getStays("barcelona-es");
    const neighborhoodIds = new Set(getNeighborhoods("barcelona-es").map((n) => n.id));
    expect(stays.length).toBeGreaterThanOrEqual(8);
    expect(stays.length).toBeLessThanOrEqual(10);
    for (const stay of stays) {
      expect(neighborhoodIds.has(stay.neighborhoodId)).toBe(true);
      expect(stay.cityTaxPerNight).toBeGreaterThanOrEqual(2);
      expect(stay.serviceFee).toBeGreaterThanOrEqual(10);
      expect(stay.praise.length).toBeGreaterThan(0);
      expect(stay.reviewCount).toBeGreaterThan(0);
    }
  });

  it("returns [] for unknown cities", () => {
    expect(getStays("nope")).toEqual([]);
    expect(getNeighborhoods("nope")).toEqual([]);
  });
});

describe("adviseStays", () => {
  it("is deterministic", () => {
    expect(adviseStays(PREFS)).toEqual(adviseStays(PREFS));
  });

  it("recommends exactly 2 neighborhoods with style-grounded reasons", () => {
    const advice = adviseStays(PREFS);
    expect(advice.neighborhoods).toHaveLength(2);
    for (const pick of advice.neighborhoods) {
      expect(pick.reasons.length).toBeGreaterThanOrEqual(2);
      expect(pick.reasons.at(-1)).toMatch(/min on foot to the center/);
    }
  });

  it("returns up to 4 distinct picks led by Best match", () => {
    const advice = adviseStays(PREFS);
    expect(advice.picks.length).toBeGreaterThanOrEqual(3);
    expect(advice.picks.length).toBeLessThanOrEqual(4);
    expect(advice.picks[0].tag).toBe("Best match");
    const ids = advice.picks.map((p) => p.stay.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every pick a distinct strength tag (no 'Also great' padding)", () => {
    const advice = adviseStays(PREFS);
    const tags = advice.picks.map((p) => p.tag);
    expect(new Set(tags).size).toBe(tags.length);
    for (const tag of tags) {
      expect(["Best match", "Best value", "Most central", "Worth the splurge", "Top rated"]).toContain(tag);
    }
  });

  it("keeps Best match within ~budget and marks the splurge as over budget", () => {
    const advice = adviseStays(PREFS);
    const bestMatch = advice.picks.find((p) => p.tag === "Best match")!;
    expect(bestMatch.stay.pricePerNight).toBeLessThanOrEqual(PREFS.budgetPerNight * 1.1);
    const splurge = advice.picks.find((p) => p.tag === "Worth the splurge");
    if (splurge) {
      expect(splurge.stay.pricePerNight).toBeGreaterThan(PREFS.budgetPerNight);
    }
  });

  it("computes true totals: nightly + taxes + fees", () => {
    const advice = adviseStays(PREFS);
    for (const pick of advice.picks) {
      const { nightly, taxes, fees, total } = pick.totalCost;
      expect(nightly).toBe(pick.stay.pricePerNight * PREFS.nights);
      expect(taxes).toBe(pick.stay.cityTaxPerNight * PREFS.nights);
      expect(fees).toBe(pick.stay.serviceFee);
      expect(total).toBe(nightly + taxes + fees);
    }
  });

  it("summarizes guest feedback with praise and the recurring complaint", () => {
    const advice = adviseStays(PREFS);
    for (const pick of advice.picks) {
      expect(pick.reviewSummary).toMatch(/^Guests keep mentioning /);
      if (pick.stay.niggle) {
        expect(pick.reviewSummary).toContain(`a few note ${pick.stay.niggle}`);
      }
    }
  });

  it("explains trade-offs against the value baseline", () => {
    const advice = adviseStays(PREFS);
    const nonValue = advice.picks.filter((p) => p.tag !== "Best value" && p.tradeOff);
    for (const pick of nonValue) {
      expect(pick.tradeOff).toMatch(/€\d+\/night (more|cheaper) than/);
    }
  });
});
