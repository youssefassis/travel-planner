import { StayOption } from "../../types";

export async function getMockStays(): Promise<StayOption[]> {
  return [
    {
      id: "stay-1",
      type: "hotel",
      name: "Central City Hotel",
      pricePerNight: 140,
      rating: 4.4,
      location: "Barcelona Center",
      affiliateUrl: "https://example.com/stay1",
    },
    {
      id: "stay-2",
      type: "airbnb",
      name: "Modern Loft in El Born",
      pricePerNight: 110,
      rating: 4.8,
      location: "El Born",
      affiliateUrl: "https://example.com/stay2",
    },
    {
      id: "stay-3",
      type: "hotel",
      name: "Sea View Resort",
      pricePerNight: 180,
      rating: 4.6,
      location: "Barceloneta",
      affiliateUrl: "https://example.com/stay3",
    },
  ];
}
