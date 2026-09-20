import { describe, expect, it } from "vitest";
import { CITIES } from "@/domain/cities";
import { CityStay, TransportLeg, TripIntent, TripPlan } from "../types";
import { generateTripPlan } from "./generatePlan";
import { addCity, removeCity } from "./replan";
import { buildDaySchedule } from "./schedule";
import { annotateTravelDays, travelSlotsByStop } from "./travelDays";

const leg = (id: string, from: string, to: string, durationHrs: number): TransportLeg => ({
  id,
  fromCityId: from.toLowerCase(),
  toCityId: to.toLowerCase(),
  from,
  to,
  mode: "train",
  distanceKm: 300,
  durationHrs,
  cost: 50,
});

describe("travelSlotsByStop", () => {
  const route = {
    legs: [leg("l0", "A", "B", 3)],
    outbound: leg("out", "Home", "A", 2),
    homebound: leg("home", "B", "Home", 4),
  };

  it("lands the arrival on each stay's first day", () => {
    const slots = travelSlotsByStop([{ days: 3 }, { days: 2 }], route);

    expect(slots[0][0].arrival?.legId).toBe("out");
    expect(slots[0][1].arrival).toBeUndefined();
    expect(slots[0][2].arrival).toBeUndefined();
    expect(slots[1][0].arrival?.legId).toBe("l0");
  });

  it("puts the journey home on the trip's very last day", () => {
    const slots = travelSlotsByStop([{ days: 3 }, { days: 2 }], route);

    expect(slots[0].some((s) => s.departure)).toBe(false);
    expect(slots[1][0].departure).toBeUndefined();
    expect(slots[1][1].departure?.legId).toBe("home");
  });

  it("brackets a single one-day stop on both sides", () => {
    const slots = travelSlotsByStop([{ days: 1 }], {
      legs: [],
      outbound: leg("out", "Home", "A", 2),
      homebound: leg("home", "A", "Home", 2),
    });

    expect(slots[0][0].arrival?.legId).toBe("out");
    expect(slots[0][0].departure?.legId).toBe("home");
  });

  it("leaves a stay-at-home trip unbracketed", () => {
    const slots = travelSlotsByStop([{ days: 2 }], { legs: [] });
    expect(slots[0].every((s) => !s.arrival && !s.departure)).toBe(true);
  });
});

describe("annotateTravelDays", () => {
  const stay = (cityId: string, days: number): CityStay => ({
    cityId,
    city: cityId,
    country: "X",
    coords: { lat: 0, lng: 0 },
    days,
    dayPlans: Array.from({ length: days }, (_, i) => ({
      id: `${cityId}-${i}`,
      label: `Day ${i}`,
      cityId,
      city: cityId,
      activities: [],
    })),
    stayPerNight: 100,
    stayTotal: 100 * days,
  });

  it("clears an annotation that no longer applies", () => {
    const stale = stay("a", 2);
    stale.dayPlans[1].arrival = {
      legId: "gone",
      mode: "train",
      from: "X",
      to: "Y",
      durationHrs: 9,
    };

    const [annotated] = annotateTravelDays([stale], {
      legs: [],
      outbound: leg("out", "Home", "A", 2),
    });

    expect(annotated.dayPlans[0].arrival?.legId).toBe("out");
    expect(annotated.dayPlans[1].arrival).toBeUndefined();
  });
});

/* ─── Against real plans ────────────────────────────────────────── */

const INTENT: TripIntent = {
  mode: "custom",
  originCityId: "paris-fr",
  selectedCityIds: ["rome-it", "naples-it"],
  duration: 6,
  companions: "solo",
  interests: ["culture"],
  region: "any",
  vibe: { pace: "balanced", budget: "comfort", climate: "any" },
};

/** Days that lose time to a journey, in itinerary order. */
function travelDays(plan: TripPlan) {
  return plan.itinerary.filter((d) => d.arrival || d.departure);
}

describe("a generated plan", () => {
  const plan = generateTripPlan(INTENT, CITIES);

  it("brackets the first day with the journey out and the last with the journey home", () => {
    expect(plan.itinerary[0].arrival?.legId).toBe(plan.outbound?.id);
    expect(plan.itinerary.at(-1)?.departure?.legId).toBe(plan.homebound?.id);
  });

  it("plans fewer stops on a day that loses hours to travel", () => {
    const travelling = travelDays(plan);
    const free = plan.itinerary.filter((d) => !d.arrival && !d.departure);

    expect(travelling.length).toBeGreaterThan(0);
    expect(free.length).toBeGreaterThan(0);

    const busiestTravelDay = Math.max(...travelling.map((d) => d.activities.length));
    const freeDay = free[0].activities.length;
    expect(busiestTravelDay).toBeLessThan(freeDay);
  });

  it("never empties a day — you still do something the day you arrive", () => {
    for (const day of plan.itinerary) {
      expect(day.activities.length).toBeGreaterThan(0);
    }
  });

  it("is still deterministic", () => {
    expect(generateTripPlan(INTENT, CITIES)).toEqual(plan);
  });
});

describe("the schedule of a travel day", () => {
  const plan = generateTripPlan(INTENT, CITIES);

  it("opens with the journey and starts the day's plans after it lands", () => {
    const day = plan.itinerary[0];
    const schedule = buildDaySchedule(day, "balanced");
    const [first, second] = schedule.items;

    expect(first.kind).toBe("travel");
    expect(second.startMin).toBeGreaterThanOrEqual(first.endMin);
    expect(first.endMin - first.startMin).toBe(
      Math.round(((day.arrival?.durationHrs ?? 0) * 60) / 5) * 5,
    );
  });

  it("closes with the journey home and skips dinner the traveller won't be there for", () => {
    const day = plan.itinerary.at(-1)!;
    const schedule = buildDaySchedule(day, "balanced");
    const last = schedule.items.at(-1)!;

    expect(last.kind).toBe("travel");
    expect(last.kind === "travel" && last.direction).toBe("depart");

    const dinner = schedule.items.find(
      (i) => i.kind === "meal" && i.label === "Dinner",
    );
    if (dinner) expect(dinner.startMin).toBeLessThan(last.startMin);
  });

  it("counts the journey against the day's load", () => {
    const withTravel = buildDaySchedule(plan.itinerary[0], "balanced");
    const withoutTravel = buildDaySchedule(
      { ...plan.itinerary[0], arrival: undefined },
      "balanced",
    );
    expect(withTravel.busyHrs).toBeGreaterThan(withoutTravel.busyHrs);
  });
});

describe("editing the route", () => {
  it("moves the arrival to whichever stop is first now", () => {
    const plan = generateTripPlan(INTENT, CITIES);
    const grown = addCity(plan, INTENT, "florence-it", CITIES)!;

    expect(grown.itinerary[0].arrival?.legId).toBe(grown.outbound?.id);
    expect(grown.itinerary.at(-1)?.departure?.legId).toBe(grown.homebound?.id);

    // Exactly one day carries the journey out, and one the journey home.
    expect(grown.itinerary.filter((d) => d.arrival?.legId === grown.outbound?.id))
      .toHaveLength(1);
    expect(grown.itinerary.filter((d) => d.departure)).toHaveLength(1);
  });

  it("re-brackets after a stop is removed", () => {
    const plan = generateTripPlan(INTENT, CITIES);
    const shrunk = removeCity(plan, INTENT, plan.stops[0].cityId, CITIES)!;

    expect(shrunk.itinerary[0].arrival?.legId).toBe(shrunk.outbound?.id);
    expect(shrunk.itinerary.filter((d) => d.departure)).toHaveLength(1);
  });
});
