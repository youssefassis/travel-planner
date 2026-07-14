import { describe, expect, it } from "vitest";
import { distanceKm, toLngLat } from "./geo";

describe("distanceKm", () => {
  it("is zero for identical points", () => {
    expect(distanceKm({ lat: 48.8566, lng: 2.3522 }, { lat: 48.8566, lng: 2.3522 })).toBe(0);
  });

  it("matches the known Paris-Lyon great-circle distance", () => {
    const paris = { lat: 48.8566, lng: 2.3522 };
    const lyon = { lat: 45.764, lng: 4.8357 };
    expect(distanceKm(paris, lyon)).toBeCloseTo(392, -1);
  });
});

describe("toLngLat", () => {
  it("swaps lat/lng into Mapbox's [lng, lat] order", () => {
    expect(toLngLat({ lat: 48.8566, lng: 2.3522 })).toEqual([2.3522, 48.8566]);
  });
});
