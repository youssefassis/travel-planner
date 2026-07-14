import { describe, expect, it } from "vitest";
import { searchFlights } from "./searchFlights";

describe("searchFlights", () => {
  it("is deterministic for identical inputs", () => {
    expect(searchFlights("paris-fr", "rome-it", "2026-08-01")).toEqual(
      searchFlights("paris-fr", "rome-it", "2026-08-01")
    );
  });

  it("varies results by travel date", () => {
    const a = searchFlights("paris-fr", "rome-it", "2026-08-01");
    const b = searchFlights("paris-fr", "rome-it", "2026-08-02");
    expect(a.map((f) => f.price)).not.toEqual(b.map((f) => f.price));
  });

  it("returns 6-8 options sorted by price with bag fees in range", () => {
    const options = searchFlights("paris-fr", "rome-it");
    expect(options.length).toBeGreaterThanOrEqual(6);
    expect(options.length).toBeLessThanOrEqual(8);
    for (let i = 1; i < options.length; i++) {
      expect(options[i].price).toBeGreaterThanOrEqual(options[i - 1].price);
    }
    for (const option of options) {
      expect(option.bagFee).toBeGreaterThanOrEqual(20);
      expect(option.bagFee).toBeLessThanOrEqual(45);
    }
  });

  it("returns [] for unknown or identical cities", () => {
    expect(searchFlights("nope", "rome-it")).toEqual([]);
    expect(searchFlights("paris-fr", "paris-fr")).toEqual([]);
  });
});
