import { getCity } from "@/domain/cities";
import { distanceKm } from "@/domain/geo";
import { FlightOption } from "../types";

const AIRLINES = [
  "SkyWings",
  "AirGlobal",
  "JetStream",
  "VoyageAir",
  "Nordica Air",
  "EuroConnect",
];

const DEPARTURE_HOURS = [6.5, 8, 9.75, 11.5, 13.25, 15, 16.5, 18.25, 20.5];

const AVG_SPEED_KMH = 750;
const NONSTOP_OVERHEAD_HRS = 0.7;
const LAYOVER_HRS = 1.6;
const BASE_FARE = 45;
const FARE_PER_KM = 0.11;
const ONE_STOP_DISCOUNT = 0.82;

/** Deterministic djb2 string hash — keeps mock results stable across renders. */
function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function formatTime(hoursFromMidnight: number): string {
  const dayHours = ((hoursFromMidnight % 24) + 24) % 24;
  let hours = Math.floor(dayHours);
  let minutes = Math.round((dayHours - hours) * 60);
  if (minutes === 60) {
    minutes = 0;
    hours = (hours + 1) % 24;
  }
  const period = hours < 12 ? "AM" : "PM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

/**
 * Deterministic mock flight search. `dateISO` (YYYY-MM-DD, optional) seeds the
 * variation so different travel dates produce different schedules and fares;
 * omitted = "flexible dates", which keeps old deep links stable.
 */
export function searchFlights(
  fromCityId: string,
  toCityId: string,
  dateISO = ""
): FlightOption[] {
  const from = getCity(fromCityId);
  const to = getCity(toCityId);
  if (!from || !to || from.id === to.id) return [];

  const distance = distanceKm(from.coords, to.coords);
  const routeKey = `${from.id}->${to.id}@${dateISO}`;
  const routeHash = hashString(routeKey);
  const count = 6 + (routeHash % 3); // 6-8 options per route

  const options: FlightOption[] = [];
  for (let i = 0; i < count; i++) {
    const optionHash = hashString(`${routeKey}#${i}`);
    const stops: 0 | 1 = optionHash % 3 === 0 ? 1 : 0;

    const rawDuration =
      distance / AVG_SPEED_KMH + NONSTOP_OVERHEAD_HRS + stops * LAYOVER_HRS;
    const durationHrs = Math.round(rawDuration * 4) / 4;

    const fareVariation = 0.85 + (optionHash % 31) / 100; // 0.85-1.15
    const stopFactor = stops === 1 ? ONE_STOP_DISCOUNT : 1;
    const price = Math.max(
      29,
      Math.round((BASE_FARE + distance * FARE_PER_KM) * fareVariation * stopFactor)
    );

    const departureHour =
      DEPARTURE_HOURS[(routeHash + i * 2) % DEPARTURE_HOURS.length];
    const arrivalHour = departureHour + durationHrs;

    options.push({
      id: `${from.id}--${to.id}--${dateISO || "flex"}--${i}`,
      airline: AIRLINES[optionHash % AIRLINES.length],
      fromCityId: from.id,
      toCityId: to.id,
      from: from.name,
      to: to.name,
      departureTime: formatTime(departureHour),
      arrivalTime:
        arrivalHour >= 24 ? `${formatTime(arrivalHour)} +1` : formatTime(arrivalHour),
      durationHrs,
      stops,
      price,
      bagFee: 20 + (optionHash % 26), // €20-45 per checked bag
    });
  }

  return options.sort((a, b) => a.price - b.price);
}
