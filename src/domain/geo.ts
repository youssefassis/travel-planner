import { Coordinates } from "./types";

export function toRad(v: number) {
  return (v * Math.PI) / 180;
}

export function distanceKm(a: Coordinates, b: Coordinates) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

// Mapbox expects [lng, lat]; keep the swap in one place.
export function toLngLat(c: Coordinates): [number, number] {
  return [c.lng, c.lat];
}
