"use client";

import { useState } from "react";
import Link from "next/link";
import { Car, Bus, TrainFront, Plane, Plus, X } from "lucide-react";
import CityAutocomplete from "@/components/ui/CityAutocomplete";
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
  /** Returns false when the city can't be removed (last one left). */
  onRemoveCity: (cityId: string) => boolean;
  /** Returns false when the city can't be added (already in the trip, trip full). */
  onAddCity: (cityId: string) => boolean;
};

export default function RouteStrip({
  stops,
  legs,
  itinerary,
  setActiveDayId,
  onRemoveCity,
  onAddCity,
}: Props) {
  const [addingCity, setAddingCity] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (stops.length === 0) return null;

  const legBetween = (fromCityId: string, toCityId: string) =>
    legs.find((leg) => leg.fromCityId === fromCityId && leg.toCityId === toCityId);

  const firstDayIdForCity = (cityId: string) =>
    itinerary.find((day) => day.cityId === cityId)?.id;

  const handleRemove = (stop: CityStay) => {
    setMessage(
      onRemoveCity(stop.cityId) ? null : "A trip needs at least one city."
    );
  };

  const handleAdd = (cityId: string) => {
    if (!cityId) return;
    const added = onAddCity(cityId);
    setMessage(
      added
        ? null
        : "Couldn't add that city — it's already in the trip, or the trip is at its 30-day limit."
    );
    if (added) setAddingCity(false);
  };

  return (
    <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <div className="flex flex-wrap items-center gap-2">
        {stops.map((stop, index) => {
          const nextStop = stops[index + 1];
          const leg = nextStop ? legBetween(stop.cityId, nextStop.cityId) : undefined;
          const Icon = leg ? MODE_ICONS[leg.mode] : null;

          return (
            <div key={stop.cityId} className="flex items-center gap-2">
              <div className="flex items-center rounded-full bg-[var(--card-subtle)]">
                <button
                  type="button"
                  onClick={() => {
                    const dayId = firstDayIdForCity(stop.cityId);
                    if (dayId) setActiveDayId(dayId);
                  }}
                  className="text-xs pl-3 pr-1.5 py-1.5 rounded-l-full hover:text-[var(--primary)] transition font-medium"
                >
                  {stop.city} · {stop.days}d
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(stop)}
                  aria-label={`Remove ${stop.city} from the trip`}
                  title={`Remove ${stop.city}`}
                  className="pr-2.5 pl-0.5 py-1.5 rounded-r-full text-[var(--muted)] hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

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

        {addingCity ? (
          <div className="flex items-center gap-1.5 min-w-[220px]">
            <CityAutocomplete
              value=""
              onChange={handleAdd}
              placeholder="Add a city..."
              id="route-add-city"
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => {
                setAddingCity(false);
                setMessage(null);
              }}
              aria-label="Close the add-city field"
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--card-subtle)] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddingCity(true)}
            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-dashed border-[var(--border)] text-[var(--muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors font-medium"
          >
            <Plus className="w-3 h-3" /> Add city
          </button>
        )}
      </div>

      {message && (
        <p className="text-xs text-[var(--muted)] mt-2">{message}</p>
      )}
    </div>
  );
}
