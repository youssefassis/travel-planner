export type TripIntent = {
  query?: string | null;
  duration?: number | null;
  companions?: "solo" | "couple" | "group";
  vibe: {
    pace: "chill" | "balanced" | "intense";
    budget: "backpacker" | "comfort" | "luxury";
    activities: string[];
    climate?: "hot" | "cold" | "temperate" | "any";
  };
};

export type FlightOption = {
  id: string;
  provider: "google_flights" | "skyscanner";
  price: number;
  duration: string;
  from: string;
  to: string;
  affiliateUrl: string;
};

export type StayOption = {
  id: string;
  type: "hotel" | "airbnb";
  name: string;
  pricePerNight: number;
  rating: number;
  location: string;
  image?: string;
  affiliateUrl: string;
};

export type Activity = {
  id: string;
  name: string;
  category: "free" | "paid";
  price?: number;
  location: [number, number];
  city: string;
  affiliateUrl?: string;
};

export type ItineraryDay = {
  id: string;
  label: string;
  city: string;
  activities: Activity[];
};

export type TripOption = {
  id: string;
  title: string;
  description: string;
  itinerary: ItineraryDay[];
};

export type TripPlan = {
  id: string;
  flights?: FlightOption[];
  stays?: StayOption[];
  itinerary: ItineraryDay[];
};
