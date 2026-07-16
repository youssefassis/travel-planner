import { describe, expect, it } from "vitest";
import { WeatherPrefs } from "../types";
import { suggestTrips } from "./suggestTrips";

const base: WeatherPrefs = { warmth: "any", dry: false, sunny: false, monthIndex: null };

describe("suggestTrips", () => {
  it("is deterministic", () => {
    expect(suggestTrips(base)).toEqual(suggestTrips(base));
  });

  it("respects the result limit and sorts by descending score", () => {
    const results = suggestTrips(base, 5);
    expect(results.length).toBe(5);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it("ranks a hot dry city top for warm+dry in July", () => {
    const prefs: WeatherPrefs = { warmth: "warm", dry: true, sunny: true, monthIndex: 6 };
    const top = suggestTrips(prefs, 5).map((m) => m.city.id);
    // Seville, Athens, Madrid — Mediterranean July heat with almost no rain.
    expect(top).toContain("seville-es");
    expect(top.some((id) => ["athens-gr", "madrid-es"].includes(id))).toBe(true);
  });

  it("prefers cool cities when warmth is 'cool'", () => {
    const warm: WeatherPrefs = { warmth: "warm", dry: false, sunny: false, monthIndex: 6 };
    const cool: WeatherPrefs = { warmth: "cool", dry: false, sunny: false, monthIndex: 6 };
    const warmTop = suggestTrips(warm, 1)[0];
    const coolTop = suggestTrips(cool, 1)[0];
    // The cool-target winner must be genuinely cooler than the warm-target winner.
    expect(coolTop.normal.high).toBeLessThan(warmTop.normal.high);
  });

  it("auto-picks each city's best month when month is 'any' and flags it", () => {
    const prefs: WeatherPrefs = { warmth: "warm", dry: true, sunny: true, monthIndex: null };
    const results = suggestTrips(prefs, 8);
    for (const m of results) {
      expect(m.monthIndex).toBeGreaterThanOrEqual(0);
      expect(m.monthIndex).toBeLessThanOrEqual(11);
      expect(m.reasons.some((r) => r.startsWith("Best around"))).toBe(true);
    }
  });

  it("uses the chosen month verbatim and omits the best-month note", () => {
    const prefs: WeatherPrefs = { warmth: "mild", dry: false, sunny: false, monthIndex: 3 };
    for (const m of suggestTrips(prefs, 8)) {
      expect(m.monthIndex).toBe(3);
      expect(m.reasons.some((r) => r.startsWith("Best around"))).toBe(false);
    }
  });
});
