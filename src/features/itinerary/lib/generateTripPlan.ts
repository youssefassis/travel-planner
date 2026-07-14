import { TripPlan } from "../types";
import { getMockFlights } from "./mock/flights";
import { getMockStays } from "./mock/stays";
import { getMockActivities } from "./mock/activities";
import { buildItinerary } from "./buildItinerary";

type Intent = {
  query?: string | null;
  duration?: number | null;
  companions?: "solo" | "couple" | "group";
  vibe?: {
    pace?: "chill" | "balanced" | "intense";
    budget?: "backpacker" | "comfort" | "luxury";
  };
};

export async function generateTripPlan(intent: Intent): Promise<TripPlan> {
  const [flights, stays, activities] = await Promise.all([
    getMockFlights(),
    getMockStays(),
    getMockActivities(),
  ]);

  const days = intent.duration ?? 5;

  const itinerary = buildItinerary(activities, days);

  return {
    id: crypto.randomUUID(),
    flights,
    stays,
    itinerary,
  };
}
