import { TransportMode } from "./types";

/**
 * Real journeys between city pairs, where the generic distance model gets it
 * meaningfully wrong.
 *
 * The fallback model estimates from straight-line distance at a fixed speed,
 * which is roughly right for conventional rail and badly wrong in two ways:
 * it makes high-speed corridors look about twice as slow as they are
 * (Milan–Rome is 3 hours, not 5), and it will happily route a train across
 * open water (there is no rail from Britain to Ireland, or across the
 * Adriatic). Both matter now that travel time is subtracted from the day it
 * falls on.
 *
 * Only the pairs listed here override the model; everything else keeps the
 * estimate. Fares are standard one-way, in euros per person.
 *
 * **Every duration is door to door**, city centre to city centre — so a
 * flight's figure includes getting out to the airport, waiting, and coming
 * back in at the far end. That is the only basis on which rail and air can
 * be compared honestly, and it's what the travel-day model needs, since
 * those hours come out of the day the journey falls on.
 */

export type Corridor = {
  /** How this journey is really made. */
  mode: TransportMode;
  durationHrs: number;
  /** Typical standard one-way fare, € per person. */
  fare: number;
  /**
   * For a pair people normally fly: the rail journey that exists anyway, so
   * the traveler can weigh it up. Absent when there isn't a practical one.
   */
  railAlternative?: { durationHrs: number; fare: number };
};

/** Pairs are order-independent — a journey is the same in both directions. */
function key(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

type Entry = [string, string, Corridor];

const ENTRIES: Entry[] = [
  /* ── France ─────────────────────────────────────────────────── */
  ["paris-fr", "lyon-fr", { mode: "train", durationHrs: 2, fare: 70 }],
  ["paris-fr", "marseille-fr", { mode: "train", durationHrs: 3.25, fare: 90 }],
  ["paris-fr", "bordeaux-fr", { mode: "train", durationHrs: 2.25, fare: 75 }],
  ["paris-fr", "nantes-fr", { mode: "train", durationHrs: 2.25, fare: 65 }],
  ["paris-fr", "strasbourg-fr", { mode: "train", durationHrs: 1.75, fare: 70 }],
  ["paris-fr", "toulouse-fr", { mode: "train", durationHrs: 4.25, fare: 90 }],
  ["paris-fr", "nice-fr", { mode: "train", durationHrs: 5.75, fare: 110 }],
  ["lyon-fr", "marseille-fr", { mode: "train", durationHrs: 1.75, fare: 45 }],
  ["lyon-fr", "annecy-fr", { mode: "train", durationHrs: 2, fare: 30 }],
  ["marseille-fr", "nice-fr", { mode: "train", durationHrs: 2.5, fare: 40 }],
  ["nice-fr", "cannes-fr", { mode: "train", durationHrs: 0.5, fare: 10 }],
  ["marseille-fr", "cannes-fr", { mode: "train", durationHrs: 2.25, fare: 35 }],
  ["bordeaux-fr", "toulouse-fr", { mode: "train", durationHrs: 2.25, fare: 40 }],

  /* ── Cross-Channel and Benelux ──────────────────────────────── */
  ["paris-fr", "london-uk", { mode: "train", durationHrs: 2.5, fare: 100 }],
  ["paris-fr", "brussels-be", { mode: "train", durationHrs: 1.5, fare: 60 }],
  ["brussels-be", "london-uk", { mode: "train", durationHrs: 2, fare: 90 }],
  ["brussels-be", "amsterdam-nl", { mode: "train", durationHrs: 2, fare: 45 }],
  ["brussels-be", "bruges-be", { mode: "train", durationHrs: 1, fare: 16 }],
  ["bruges-be", "amsterdam-nl", { mode: "train", durationHrs: 3.25, fare: 45 }],
  ["bruges-be", "london-uk", { mode: "train", durationHrs: 4, fare: 95 }],
  ["amsterdam-nl", "london-uk", { mode: "train", durationHrs: 4.25, fare: 100 }],
  ["amsterdam-nl", "paris-fr", { mode: "train", durationHrs: 3.25, fare: 80 }],
  ["amsterdam-nl", "berlin-de", { mode: "train", durationHrs: 6.25, fare: 75 }],

  /* ── Italy ──────────────────────────────────────────────────── */
  ["milan-it", "rome-it", { mode: "train", durationHrs: 3, fare: 70 }],
  ["rome-it", "florence-it", { mode: "train", durationHrs: 1.5, fare: 40 }],
  ["florence-it", "venice-it", { mode: "train", durationHrs: 2, fare: 45 }],
  ["milan-it", "venice-it", { mode: "train", durationHrs: 2.25, fare: 35 }],
  ["milan-it", "florence-it", { mode: "train", durationHrs: 1.75, fare: 45 }],
  ["rome-it", "naples-it", { mode: "train", durationHrs: 1.25, fare: 35 }],
  ["florence-it", "naples-it", { mode: "train", durationHrs: 3, fare: 55 }],
  ["venice-it", "rome-it", { mode: "train", durationHrs: 3.75, fare: 70 }],
  ["milan-it", "naples-it", { mode: "train", durationHrs: 4.5, fare: 90 }],
  ["milan-it", "nice-fr", { mode: "train", durationHrs: 4.75, fare: 40 }],

  /* ── Iberia ─────────────────────────────────────────────────── */
  ["madrid-es", "barcelona-es", { mode: "train", durationHrs: 2.75, fare: 70 }],
  ["madrid-es", "seville-es", { mode: "train", durationHrs: 2.5, fare: 60 }],
  ["barcelona-es", "seville-es", { mode: "train", durationHrs: 5.5, fare: 90 }],
  ["lisbon-pt", "porto-pt", { mode: "train", durationHrs: 3, fare: 30 }],
  // No through rail worth taking; the coach is how this is actually done.
  ["lisbon-pt", "seville-es", { mode: "bus", durationHrs: 6.5, fare: 35 }],
  ["lisbon-pt", "madrid-es", { mode: "flight", durationHrs: 3.75, fare: 80 }],
  ["barcelona-es", "toulouse-fr", { mode: "train", durationHrs: 3.25, fare: 40 }],
  ["barcelona-es", "marseille-fr", { mode: "train", durationHrs: 4.75, fare: 50 }],
  ["barcelona-es", "lyon-fr", { mode: "train", durationHrs: 5, fare: 60 }],
  [
    "barcelona-es",
    "paris-fr",
    {
      mode: "flight",
      durationHrs: 4,
      fare: 90,
      railAlternative: { durationHrs: 6.5, fare: 90 },
    },
  ],

  /* ── Central Europe ─────────────────────────────────────────── */
  ["berlin-de", "munich-de", { mode: "train", durationHrs: 4, fare: 90 }],
  ["berlin-de", "prague-cz", { mode: "train", durationHrs: 4.25, fare: 50 }],
  ["prague-cz", "vienna-at", { mode: "train", durationHrs: 4, fare: 40 }],
  ["vienna-at", "budapest-hu", { mode: "train", durationHrs: 2.5, fare: 30 }],
  ["prague-cz", "munich-de", { mode: "train", durationHrs: 5, fare: 40 }],
  ["munich-de", "vienna-at", { mode: "train", durationHrs: 4, fare: 60 }],
  ["munich-de", "zurich-ch", { mode: "train", durationHrs: 3.5, fare: 60 }],
  ["zurich-ch", "milan-it", { mode: "train", durationHrs: 3.25, fare: 70 }],
  ["zurich-ch", "paris-fr", { mode: "train", durationHrs: 4, fare: 90 }],
  ["vienna-at", "ljubljana-si", { mode: "train", durationHrs: 6, fare: 45 }],
  ["ljubljana-si", "venice-it", { mode: "bus", durationHrs: 4.5, fare: 25 }],
  ["munich-de", "venice-it", { mode: "train", durationHrs: 6.75, fare: 60 }],
  ["venice-it", "vienna-at", { mode: "train", durationHrs: 7.5, fare: 70 }],
  ["berlin-de", "vienna-at", { mode: "train", durationHrs: 7.5, fare: 80 }],
  ["prague-cz", "krakow-pl", { mode: "train", durationHrs: 6.5, fare: 35 }],
  ["krakow-pl", "warsaw-pl", { mode: "train", durationHrs: 2.5, fare: 25 }],
  ["berlin-de", "warsaw-pl", { mode: "train", durationHrs: 5.5, fare: 60 }],
  ["berlin-de", "copenhagen-dk", { mode: "train", durationHrs: 7, fare: 70 }],
  [
    "milan-it",
    "paris-fr",
    {
      mode: "flight",
      durationHrs: 4,
      fare: 95,
      railAlternative: { durationHrs: 6.75, fare: 95 },
    },
  ],

  /* ── British Isles ──────────────────────────────────────────── */
  ["london-uk", "edinburgh-uk", { mode: "train", durationHrs: 4.5, fare: 100 }],
  // The Irish Sea: the distance model would put a train on these.
  ["london-uk", "dublin-ie", { mode: "flight", durationHrs: 3.5, fare: 70 }],
  ["edinburgh-uk", "dublin-ie", { mode: "flight", durationHrs: 3.5, fare: 70 }],

  /* ── Nordics ────────────────────────────────────────────────── */
  ["copenhagen-dk", "stockholm-se", { mode: "train", durationHrs: 5.25, fare: 70 }],
  ["stockholm-se", "oslo-no", { mode: "train", durationHrs: 6, fare: 60 }],
  ["copenhagen-dk", "oslo-no", { mode: "train", durationHrs: 7.75, fare: 80 }],

  /* ── Adriatic and the Balkans ───────────────────────────────── */
  // No rail down the Dalmatian coast — the coach road is the route.
  ["split-hr", "dubrovnik-hr", { mode: "bus", durationHrs: 4.5, fare: 25 }],
  ["split-hr", "ljubljana-si", { mode: "bus", durationHrs: 7, fare: 35 }],
  // Across the Adriatic, where the distance model would put a train.
  ["split-hr", "naples-it", { mode: "flight", durationHrs: 4, fare: 90 }],
  ["split-hr", "rome-it", { mode: "flight", durationHrs: 4, fare: 90 }],
  ["dubrovnik-hr", "naples-it", { mode: "flight", durationHrs: 4, fare: 90 }],
  ["dubrovnik-hr", "rome-it", { mode: "flight", durationHrs: 4, fare: 90 }],
];

const CORRIDORS: Record<string, Corridor> = Object.fromEntries(
  ENTRIES.map(([a, b, corridor]) => [key(a, b), corridor]),
);

/** The real journey between two cities, or undefined to use the estimate. */
export function getCorridor(a: string, b: string): Corridor | undefined {
  return CORRIDORS[key(a, b)];
}

/** Every authored pair, for coverage tests. */
export function allCorridors(): Entry[] {
  return ENTRIES;
}
