import { FlightOption } from "../../types";

export async function getMockFlights(): Promise<FlightOption[]> {
  return [
    {
      id: "flight-1",
      provider: "google_flights",
      price: 120,
      duration: "2h 10m",
      from: "CDG",
      to: "BCN",
      affiliateUrl: "https://example.com/flight1",
    },
    {
      id: "flight-2",
      provider: "skyscanner",
      price: 95,
      duration: "2h 25m",
      from: "CDG",
      to: "BCN",
      affiliateUrl: "https://example.com/flight2",
    },
    {
      id: "flight-3",
      provider: "google_flights",
      price: 160,
      duration: "1h 55m",
      from: "CDG",
      to: "BCN",
      affiliateUrl: "https://example.com/flight3",
    },
  ];
}
