import { describe, expect, it } from "vitest";
import { CITY_BY_ID } from "./cities";
import { allCorridors, getCorridor } from "./corridors";

describe("the corridor table", () => {
  it("only names cities the dataset has", () => {
    const unknown = allCorridors()
      .flatMap(([a, b]) => [a, b])
      .filter((id) => !CITY_BY_ID[id]);
    expect(unknown).toEqual([]);
  });

  it("never connects a city to itself", () => {
    expect(allCorridors().filter(([a, b]) => a === b)).toEqual([]);
  });

  it("holds each pair once, in either direction", () => {
    const keys = allCorridors().map(([a, b]) => [a, b].sort().join("|"));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("gives every journey a plausible duration and fare", () => {
    for (const [a, b, corridor] of allCorridors()) {
      expect(corridor.durationHrs, `${a}→${b}`).toBeGreaterThan(0);
      expect(corridor.durationHrs, `${a}→${b}`).toBeLessThan(24);
      expect(corridor.fare, `${a}→${b}`).toBeGreaterThan(0);
    }
  });

  it("counts a flight door to door, like every other mode", () => {
    // A gate-to-gate figure would make flying look cheaper in hours than it
    // is, and travel days subtract these directly.
    for (const [a, b, corridor] of allCorridors()) {
      if (corridor.mode !== "flight") continue;
      expect(corridor.durationHrs, `${a}→${b}`).toBeGreaterThanOrEqual(3);
    }
  });

  it("offers a rail alternative only where the journey is flown", () => {
    for (const [a, b, corridor] of allCorridors()) {
      if (!corridor.railAlternative) continue;
      expect(corridor.mode, `${a}→${b}`).toBe("flight");
      // A train that beat the plane on time would be the primary mode.
      expect(corridor.railAlternative.durationHrs).toBeGreaterThan(
        corridor.durationHrs,
      );
    }
  });

  it("reads the same in both directions", () => {
    expect(getCorridor("milan-it", "rome-it")).toBe(
      getCorridor("rome-it", "milan-it"),
    );
  });

  it("has nothing to say about a pair it doesn't cover", () => {
    expect(getCorridor("paris-fr", "athens-gr")).toBeUndefined();
    expect(getCorridor("paris-fr", "atlantis")).toBeUndefined();
  });

  it("never puts a train across open water", () => {
    // Britain to Ireland, and across the Adriatic — the distance model would.
    const crossings: [string, string][] = [
      ["london-uk", "dublin-ie"],
      ["edinburgh-uk", "dublin-ie"],
      ["split-hr", "naples-it"],
      ["split-hr", "rome-it"],
      ["dubrovnik-hr", "naples-it"],
      ["dubrovnik-hr", "rome-it"],
    ];
    for (const [a, b] of crossings) {
      const corridor = getCorridor(a, b);
      expect(corridor, `${a}→${b} must be covered`).toBeDefined();
      expect(corridor?.mode, `${a}→${b}`).toBe("flight");
    }
  });

  it("knows the high-speed corridors are fast", () => {
    // The distance model put every one of these at 4–5¼ hours.
    expect(getCorridor("milan-it", "rome-it")?.durationHrs).toBeLessThan(3.5);
    expect(getCorridor("madrid-es", "barcelona-es")?.durationHrs).toBeLessThan(3.5);
    expect(getCorridor("paris-fr", "lyon-fr")?.durationHrs).toBeLessThan(2.5);
    expect(getCorridor("paris-fr", "london-uk")?.durationHrs).toBeLessThan(3);
  });
});
