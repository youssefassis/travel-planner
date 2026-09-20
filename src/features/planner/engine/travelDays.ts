import {
  CityStay,
  DayTravel,
  DayTravelSlots,
  TransportLeg,
  TripPlan,
} from "../types";

/**
 * Travel takes time out of the days it falls on. A plan that gives every day
 * a full 09:30 start over-plans a multi-city trip by most of a day per move,
 * so the route's legs are mapped onto the days they actually consume.
 *
 * The traveler arrives into a city on that stay's **first** day — off the
 * outbound leg for the first stop, off the previous leg for the rest — and
 * leaves for home on the trip's **last** day. That matches how the legs are
 * dated in `lib/tripDates.ts`, so the itinerary and the flight searches agree.
 */

type Route = Pick<TripPlan, "legs" | "outbound" | "homebound">;

function toDayTravel(leg: TransportLeg): DayTravel {
  return {
    legId: leg.id,
    mode: leg.mode,
    from: leg.from,
    to: leg.to,
    durationHrs: leg.durationHrs,
  };
}

/** Which journey brackets each day, as `[stop][dayWithinStop]`. */
export function travelSlotsByStop(
  stops: { days: number }[],
  route: Route,
): DayTravelSlots[][] {
  return stops.map((stop, stopIndex) => {
    const slots: DayTravelSlots[] = Array.from({ length: stop.days }, () => ({}));
    if (slots.length === 0) return slots;

    const incoming = stopIndex === 0 ? route.outbound : route.legs[stopIndex - 1];
    if (incoming) slots[0].arrival = toDayTravel(incoming);

    if (stopIndex === stops.length - 1 && route.homebound) {
      slots[slots.length - 1].departure = toDayTravel(route.homebound);
    }

    return slots;
  });
}

/**
 * Re-brackets an existing plan's days after the route changes. Adding or
 * removing a city moves which day the traveler arrives on, and a stale
 * annotation would have the schedule starting late for no reason.
 *
 * Only the bracketing is recomputed, not how many activities each day holds —
 * rebuilding those would throw away the traveler's own edits. A day that
 * gains travel therefore reads as over-full, which is the honest signal.
 */
export function annotateTravelDays(stops: CityStay[], route: Route): CityStay[] {
  const slots = travelSlotsByStop(stops, route);

  return stops.map((stop, stopIndex) => ({
    ...stop,
    dayPlans: stop.dayPlans.map((day, dayIndex) => {
      const slot = slots[stopIndex]?.[dayIndex] ?? {};
      return { ...day, arrival: slot.arrival, departure: slot.departure };
    }),
  }));
}
