import { describe, expect, it } from "vitest";
import { CITIES } from "./index";

// Rough Europe bounding box: lat 34..71, lng -25..45
const EUROPE_BOUNDS = { minLat: 34, maxLat: 71, minLng: -25, maxLng: 45 };

describe("CITIES dataset", () => {
  it("has unique ids", () => {
    const ids = CITIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every city 5-8 POIs", () => {
    for (const city of CITIES) {
      expect(city.pois.length).toBeGreaterThanOrEqual(5);
      expect(city.pois.length).toBeLessThanOrEqual(8);
    }
  });

  it("keeps minDays <= maxDays", () => {
    for (const city of CITIES) {
      expect(city.minDays).toBeLessThanOrEqual(city.maxDays);
      expect(city.minDays).toBeGreaterThanOrEqual(1);
    }
  });

  it("places every city and POI within Europe", () => {
    for (const city of CITIES) {
      expect(city.coords.lat).toBeGreaterThanOrEqual(EUROPE_BOUNDS.minLat);
      expect(city.coords.lat).toBeLessThanOrEqual(EUROPE_BOUNDS.maxLat);
      expect(city.coords.lng).toBeGreaterThanOrEqual(EUROPE_BOUNDS.minLng);
      expect(city.coords.lng).toBeLessThanOrEqual(EUROPE_BOUNDS.maxLng);

      for (const poi of city.pois) {
        expect(poi.coords.lat).toBeGreaterThanOrEqual(EUROPE_BOUNDS.minLat);
        expect(poi.coords.lat).toBeLessThanOrEqual(EUROPE_BOUNDS.maxLat);
      }
    }
  });

  it("gives every POI a unique id", () => {
    const poiIds = CITIES.flatMap((c) => c.pois.map((p) => p.id));
    expect(new Set(poiIds).size).toBe(poiIds.length);
  });
});
