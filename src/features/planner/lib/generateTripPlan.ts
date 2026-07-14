import { CITIES, getCity } from "@/domain/cities";
import { TripIntent, TripPlan, ItineraryDay, Activity } from "../types";

// Temporary placeholder pending the full rule-based engine
// (features/planner/engine/, wave 1 task #6). Single-city, no legs.
export function generateTripPlan(intent: TripIntent): TripPlan {
  const city = getCity(intent.originCityId) ?? CITIES[0];
  const days = Math.min(30, Math.max(1, intent.duration));
  const perDay = 3;

  const dayPlans: ItineraryDay[] = Array.from({ length: days }, (_, i) => {
    const start = (i * perDay) % Math.max(city.pois.length, 1);
    const activities: Activity[] = city.pois
      .slice(start, start + perDay)
      .map((poi) => ({
        id: poi.id,
        name: poi.name,
        category: poi.category,
        price: poi.price,
        location: poi.coords,
        cityId: city.id,
        city: city.name,
      }));

    return {
      id: `day-${i + 1}-${city.id}`,
      label: `Day ${i + 1}`,
      cityId: city.id,
      city: city.name,
      activities,
    };
  });

  const stayTotal = days * city.stayPerNight[intent.vibe.budget];
  const activitiesTotal = dayPlans
    .flatMap((d) => d.activities)
    .reduce((sum, a) => sum + a.price, 0);
  const foodTotal = days * city.foodPerDay[intent.vibe.budget];
  const total = stayTotal + activitiesTotal + foodTotal;

  return {
    id: `plan-${city.id}-${days}`,
    stops: [
      {
        cityId: city.id,
        city: city.name,
        country: city.country,
        coords: city.coords,
        days,
        dayPlans,
        stayPerNight: city.stayPerNight[intent.vibe.budget],
        stayTotal,
      },
    ],
    legs: [],
    itinerary: dayPlans,
    budget: {
      transport: 0,
      stays: stayTotal,
      activities: activitiesTotal,
      food: foodTotal,
      total,
      perDay: Math.round(total / days),
    },
    notes: [],
  };
}
