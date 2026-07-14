import { City } from "../types";
import { FRANCE } from "./france";
import { IBERIA } from "./iberia";
import { ITALY } from "./italy";
import { CENTRAL } from "./central";
import { BENELUX } from "./benelux";
import { BRITISH_ISLES } from "./british-isles";
import { NORDICS } from "./nordics";
import { BALKANS } from "./balkans";
import { EAST } from "./east";

export const CITIES: City[] = [
  ...FRANCE,
  ...IBERIA,
  ...ITALY,
  ...CENTRAL,
  ...BENELUX,
  ...BRITISH_ISLES,
  ...NORDICS,
  ...BALKANS,
  ...EAST,
];

export const CITY_BY_ID: Record<string, City> = Object.fromEntries(
  CITIES.map((city) => [city.id, city])
);

export function getCity(id: string): City | undefined {
  return CITY_BY_ID[id];
}

export function citiesByCountry(): Record<string, City[]> {
  return CITIES.reduce<Record<string, City[]>>((acc, city) => {
    (acc[city.country] ??= []).push(city);
    return acc;
  }, {});
}
