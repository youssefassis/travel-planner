export type FlightOption = {
  id: string;
  airline: string;
  fromCityId: string;
  toCityId: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  durationHrs: number;
  stops: 0 | 1 | 2;
  price: number;
};
