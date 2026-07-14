"use client";

import { Car, Bus, TrainFront, Plane } from "lucide-react";
import MapView from "./MapView";
import { CityStay, ItineraryDay, TransportLeg, TransportMode } from "../types";

type Props = {
  itinerary: ItineraryDay[];
  activeDayId: string | null;
  setActiveDayId: (id: string) => void;
  loading: boolean;
  stops?: CityStay[];
  legs?: TransportLeg[];
};

const MODE_ICONS: Record<TransportMode, typeof Car> = {
  car: Car,
  bus: Bus,
  train: TrainFront,
  flight: Plane,
};

export default function PlannerCanvas({
  itinerary,
  activeDayId,
  setActiveDayId,
  loading,
  stops = [],
  legs = [],
}: Props) {
  const legBetween = (fromCityId: string, toCityId: string) =>
    legs.find((leg) => leg.fromCityId === fromCityId && leg.toCityId === toCityId);

  const firstDayIdForCity = (cityId: string) =>
    itinerary.find((day) => day.cityId === cityId)?.id;

  return (
    <div className="space-y-6">
      {/* MAP */}
      <div className="rounded-2xl overflow-hidden bg-[var(--card)]">
        <MapView
          itinerary={itinerary}
          activeDayId={activeDayId}
          onSelectDay={(id) => setActiveDayId(id)}
          stops={stops}
          legs={legs}
        />
      </div>

      {/* ROUTE SUMMARY */}
      {stops.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-4 rounded-2xl bg-[var(--card)]">
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
                  <div className="flex items-center gap-1 text-xs text-[var(--muted)]">
                    <Icon size={14} />
                    <span>{leg.durationHrs}h</span>
                    <span>€{leg.cost}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ITINERARY */}
      <div className="space-y-3">
        {loading && (
          <div className="text-sm text-[var(--muted)]">Generating trip...</div>
        )}

        {itinerary.map((day) => {
          const isActive = activeDayId === day.id;

          return (
            <div
              key={day.id}
              onClick={() => setActiveDayId(day.id)}
              className={`
                p-4 rounded-2xl cursor-pointer transition
                bg-[var(--card)]
                hover:bg-[var(--card)]/80
                ${isActive ? "ring-1 ring-[var(--foreground)]" : ""}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{day.label}</div>

                <div
                  className={`
                    text-xs px-2 py-1 rounded-lg
                    ${
                      isActive
                        ? "bg-[var(--foreground)] text-[var(--bg)]"
                        : "text-[var(--muted)]"
                    }
                  `}
                >
                  {day.activities.length} stops
                </div>
              </div>

              <div className="text-xs text-[var(--muted)] mt-1">{day.city}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
