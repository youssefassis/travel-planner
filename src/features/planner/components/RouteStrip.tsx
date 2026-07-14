"use client";

import Link from "next/link";
import { Car, Bus, TrainFront, Plane } from "lucide-react";
import { CityStay, ItineraryDay, TransportLeg, TransportMode } from "../types";

const MODE_ICONS: Record<TransportMode, typeof Car> = {
  car: Car,
  bus: Bus,
  train: TrainFront,
  flight: Plane,
};

type Props = {
  stops: CityStay[];
  legs: TransportLeg[];
  itinerary: ItineraryDay[];
  setActiveDayId: (id: string) => void;
};

export default function RouteStrip({ stops, legs, itinerary, setActiveDayId }: Props) {
  if (stops.length === 0) return null;

  const legBetween = (fromCityId: string, toCityId: string) =>
    legs.find((leg) => leg.fromCityId === fromCityId && leg.toCityId === toCityId);

  const firstDayIdForCity = (cityId: string) =>
    itinerary.find((day) => day.cityId === cityId)?.id;

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
      {stops.map((stop, index) => {
        const nextStop = stops[index + 1];
        const leg = nextStop ? legBetween(stop.cityId, nextStop.cityId) : undefined;
        const Icon = leg ? MODE_ICONS[leg.mode] : null;

        return (
          <div key={stop.cityId} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const dayId = firstDayIdForCity(stop.cityId);
                if (dayId) setActiveDayId(dayId);
              }}
              className="text-xs px-3 py-1.5 rounded-full bg-[var(--card-subtle)] hover:bg-[var(--primary)] hover:text-white transition font-medium"
            >
              {stop.city} · {stop.days}d
            </button>

            {leg && Icon && (
              // Flight legs deep-link into the standalone flights search.
              leg.mode === "flight" ? (
                <Link
                  href={`/flights?from=${leg.fromCityId}&to=${leg.toCityId}`}
                  className="flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--primary)] transition-colors underline-offset-2 hover:underline"
                >
                  <Icon size={14} />
                  <span>{leg.durationHrs}h</span>
                  <span>€{leg.cost}</span>
                </Link>
              ) : (
                <div className="flex items-center gap-1 text-xs text-[var(--muted)]">
                  <Icon size={14} />
                  <span>{leg.durationHrs}h</span>
                  <span>€{leg.cost}</span>
                </div>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
