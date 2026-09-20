import { describe, expect, it } from "vitest";
import { CITIES } from "./cities";
import { allCountryEssentials, getCountryEssentials } from "./countries";

describe("country essentials", () => {
  it("covers every country a trip can actually reach", () => {
    const missing = [...new Set(CITIES.map((city) => city.country))].filter(
      (country) => !getCountryEssentials(country),
    );
    expect(missing).toEqual([]);
  });

  it("describes no country the dataset can't visit", () => {
    const reachable = new Set(CITIES.map((city) => city.country));
    const orphans = allCountryEssentials()
      .map((entry) => entry.country)
      .filter((country) => !reachable.has(country));
    expect(orphans).toEqual([]);
  });

  it("gives every entry the facts a traveller needs on arrival", () => {
    for (const entry of allCountryEssentials()) {
      expect(entry.plugTypes.length).toBeGreaterThan(0);
      expect(entry.currency).not.toBe("");
      expect(entry.emergency).toMatch(/\d/);
      expect(entry.tipping).not.toBe("");
    }
  });

  it("flags every non-euro country, since that changes what you carry", () => {
    for (const entry of allCountryEssentials()) {
      const isEuro = entry.currency.startsWith("Euro");
      expect(isEuro || entry.moneyNote !== undefined).toBe(true);
    }
  });

  it("returns undefined for a country it doesn't know", () => {
    expect(getCountryEssentials("Atlantis")).toBeUndefined();
  });
});
