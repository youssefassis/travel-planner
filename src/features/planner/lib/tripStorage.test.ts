import { afterEach, describe, expect, it, vi } from "vitest";
import { CITIES } from "@/domain/cities";
import { generateTripPlan } from "../engine";
import { TripIntent } from "../types";
import {
  MAX_SAVED_TRIPS,
  StoredTrip,
  clearDraft,
  loadDraft,
  loadTrips,
  parseDraft,
  parseTrips,
  removeTrip,
  saveDraft,
  saveTrips,
  tripId,
  tripName,
  upsertTrip,
} from "./tripStorage";

const INTENT: TripIntent = {
  mode: "custom",
  originCityId: "paris-fr",
  selectedCityIds: ["rome-it", "florence-it"],
  duration: 5,
  startDate: "2026-05-04",
  travelMonth: 4,
  companions: "solo",
  interests: ["culture"],
  region: "any",
  vibe: { pace: "balanced", budget: "comfort", climate: "any" },
};

const PLAN = generateTripPlan(INTENT, CITIES);

const entry = (id: string, savedAt = 0): StoredTrip => ({
  id,
  name: id,
  savedAt,
  intent: INTENT,
  plan: PLAN,
  bookings: {},
});

describe("tripName", () => {
  it("reads as the route and its dates", () => {
    expect(tripName(PLAN, INTENT)).toBe(
      `${PLAN.stops.map((s) => s.city).join(" → ")} · 4 – 8 May 2026`,
    );
  });

  it("falls back to a day count when the trip is undated", () => {
    expect(tripName(PLAN, { ...INTENT, startDate: undefined })).toContain("5 days");
  });
});

describe("tripId", () => {
  it("separates the same route on different dates", () => {
    expect(tripId(PLAN, INTENT)).not.toBe(
      tripId(PLAN, { ...INTENT, startDate: "2026-06-04" }),
    );
  });

  it("is stable for the same route and dates", () => {
    expect(tripId(PLAN, INTENT)).toBe(tripId(PLAN, { ...INTENT }));
  });
});

describe("upsertTrip", () => {
  it("puts the newest first", () => {
    const trips = upsertTrip(upsertTrip([], entry("a")), entry("b"));
    expect(trips.map((t) => t.id)).toEqual(["b", "a"]);
  });

  it("re-saving moves a trip to the front instead of duplicating it", () => {
    const trips = upsertTrip(
      [entry("a"), entry("b"), entry("c")],
      entry("c", 99),
    );
    expect(trips.map((t) => t.id)).toEqual(["c", "a", "b"]);
    expect(trips[0].savedAt).toBe(99);
  });

  it("drops the oldest past the cap", () => {
    const full = Array.from({ length: MAX_SAVED_TRIPS }, (_, i) => entry(`t${i}`));
    const trips = upsertTrip(full, entry("new"));
    expect(trips).toHaveLength(MAX_SAVED_TRIPS);
    expect(trips[0].id).toBe("new");
    expect(trips.some((t) => t.id === `t${MAX_SAVED_TRIPS - 1}`)).toBe(false);
  });
});

describe("removeTrip", () => {
  it("removes by id and leaves the rest alone", () => {
    expect(removeTrip([entry("a"), entry("b")], "a").map((t) => t.id)).toEqual(["b"]);
    expect(removeTrip([entry("a")], "nope")).toHaveLength(1);
  });
});

describe("parseTrips", () => {
  it("round-trips what it wrote", () => {
    const trips = [entry("a"), entry("b")];
    expect(parseTrips(JSON.stringify(trips))).toEqual(trips);
  });

  it("survives absent, corrupt, and wrongly-shaped storage", () => {
    expect(parseTrips(null)).toEqual([]);
    expect(parseTrips("")).toEqual([]);
    expect(parseTrips("{not json")).toEqual([]);
    expect(parseTrips('{"trips":[]}')).toEqual([]);
  });

  it("drops entries that no longer match the app's shape", () => {
    const mixed = JSON.stringify([
      entry("good"),
      { id: "stale", name: "Stale", savedAt: 0, intent: {}, plan: { stops: "no" } },
      null,
    ]);
    expect(parseTrips(mixed).map((t) => t.id)).toEqual(["good"]);
  });
});

describe("parseDraft", () => {
  it("round-trips a saved draft, bookings and all", () => {
    const draft = {
      intent: INTENT,
      plan: PLAN,
      bookings: {
        "rome-colosseum": {
          activityId: "rome-colosseum",
          reference: "WND-ABC123",
          bookedAt: 1,
          price: 18,
        },
      },
    };
    expect(parseDraft(JSON.stringify(draft))).toEqual(draft);
  });

  it("reads a draft written before bookings existed", () => {
    const old = JSON.stringify({ intent: INTENT, plan: PLAN });
    expect(parseDraft(old)?.bookings).toEqual({});
  });

  it("returns null for anything unusable", () => {
    expect(parseDraft(null)).toBeNull();
    expect(parseDraft("nonsense")).toBeNull();
    expect(parseDraft(JSON.stringify({ intent: INTENT }))).toBeNull();
    expect(
      parseDraft(JSON.stringify({ intent: INTENT, plan: { stops: [] } })),
    ).toBeNull();
  });
});

/* ─── Browser storage ───────────────────────────────────────────── */

/** A minimal localStorage; `failing` models a private window or full quota. */
function stubStorage(failing = false) {
  const store = new Map<string, string>();
  const boom = () => {
    throw new DOMException("denied", "SecurityError");
  };
  vi.stubGlobal("window", {
    localStorage: {
      getItem: failing ? boom : (k: string) => store.get(k) ?? null,
      setItem: failing ? boom : (k: string, v: string) => void store.set(k, v),
      removeItem: failing ? boom : (k: string) => void store.delete(k),
    },
  });
  return store;
}

afterEach(() => vi.unstubAllGlobals());

describe("draft storage", () => {
  it("gives back the trip that was last on screen", () => {
    stubStorage();
    saveDraft({ intent: INTENT, plan: PLAN, bookings: {} });
    expect(loadDraft()).toEqual({ intent: INTENT, plan: PLAN, bookings: {} });
  });

  it("is empty before anything is written, and after clearing", () => {
    stubStorage();
    expect(loadDraft()).toBeNull();
    saveDraft({ intent: INTENT, plan: PLAN, bookings: {} });
    clearDraft();
    expect(loadDraft()).toBeNull();
  });

  it("keeps the traveller's edits, not just the wizard's answers", () => {
    stubStorage();
    const edited = { ...PLAN, notes: [...PLAN.notes, "swapped a stop"] };
    saveDraft({ intent: INTENT, plan: edited, bookings: {} });
    expect(loadDraft()?.plan.notes).toContain("swapped a stop");
  });
});

describe("saved trip storage", () => {
  it("round-trips the list", () => {
    stubStorage();
    const trips = [entry("a"), entry("b")];
    saveTrips(trips);
    expect(loadTrips()).toEqual(trips);
  });
});

describe("when storage is unavailable", () => {
  it("never throws — a private window costs the session, not the app", () => {
    stubStorage(true);
    expect(() => saveDraft({ intent: INTENT, plan: PLAN, bookings: {} })).not.toThrow();
    expect(() => saveTrips([entry("a")])).not.toThrow();
    expect(() => clearDraft()).not.toThrow();
    expect(loadDraft()).toBeNull();
    expect(loadTrips()).toEqual([]);
  });
});
