/**
 * Deterministic mock booking/reservation reference, shared by the flight,
 * stay, and activity booking flows. Same seed always yields the same code
 * (djb2 hash → base36), so a given selection reads identically everywhere.
 */
export function bookingReference(seed: string): string {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 33 + seed.charCodeAt(i)) >>> 0;
  }
  return `WND-${hash.toString(36).toUpperCase().padStart(6, "0").slice(0, 6)}`;
}
