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
  /** € per checked bag, per person — used for the "true cost" estimate. */
  bagFee: number;
};

export type FareSignal = {
  level: "book" | "fair" | "monitor";
  text: string;
};

/** A tailored recommendation: one flight + why it's worth considering. */
export type FlightPick = {
  flight: FlightOption;
  tag: string; // "Best overall" | "Cheapest" | "Fastest" | ...
  reasons: string[]; // short trade-off statements
  signal: FareSignal;
};
