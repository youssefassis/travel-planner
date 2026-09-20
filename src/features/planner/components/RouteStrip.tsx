"use client";

import { useState } from "react";
import { Home, Plus, X } from "lucide-react";
import CityAutocomplete from "@/components/ui/CityAutocomplete";
import Card from "@/components/ui/Card";
import { CityStay, ItineraryDay, TransportLeg } from "../types";
import TransportModeIcon from "./TransportModeIcon";

type Props = {
  stops: CityStay[];
  legs: TransportLeg[];
  /** Home → first stop. Absent when the trip starts where you live. */
  outbound?: TransportLeg;
  /** Last stop → home. Absent when the trip ends where you live. */
  homebound?: TransportLeg;
  itinerary: ItineraryDay[];
  setActiveDayId: (id: string) => void;
  /** Returns false when the city can't be removed (last one left). */
  onRemoveCity: (cityId: string) => boolean;
  /** Returns false when the city can't be added (already in the trip, trip full). */
  onAddCity: (cityId: string) => boolean;
  /** Open flight options for a flight leg (in the hub's Flights tab). */
  onFlightLeg?: (leg: TransportLeg) => void;
};

export default function RouteStrip({
  stops,
  legs,
  outbound,
  homebound,
  itinerary,
  setActiveDayId,
  onRemoveCity,
  onAddCity,
  onFlightLeg,
}: Props) {
  const [addingCity, setAddingCity] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (stops.length === 0) return null;

  const legBetween = (fromCityId: string, toCityId: string) =>
    legs.find((leg) => leg.fromCityId === fromCityId && leg.toCityId === toCityId);

  // Flight legs open the hub's Flights tab for that route; everything else
  // is a plain read-out.
  const renderLeg = (leg: TransportLeg) => {
    const body = (
      <>
        <TransportModeIcon mode={leg.mode} size={14} />
        <span>{leg.durationHrs}h</span>
        <span>€{leg.cost}</span>
      </>
    );
    return leg.mode === "flight" && onFlightLeg ? (
      <button
        type="button"
        onClick={() => onFlightLeg(leg)}
        className="flex items-center gap-1 text-xs text-data text-[var(--muted)] hover:text-[var(--primary)] transition-colors underline-offset-2 hover:underline"
      >
        {body}
      </button>
    ) : (
      <div className="flex items-center gap-1 text-xs text-data text-[var(--muted)]">{body}</div>
    );
  };

  const homeChip = (cityName: string) => (
    <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-dashed border-[var(--border)] text-[var(--muted)]">
      <Home className="w-3 h-3" />
      {cityName}
    </div>
  );

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
    <Card padding="sm">
      <div className="flex flex-wrap items-center gap-2">
        {outbound && (
          <div className="flex items-center gap-2">
            {homeChip(outbound.from)}
            {renderLeg(outbound)}
          </div>
        )}

        {stops.map((stop, index) => {
          const nextStop = stops[index + 1];
          const leg = nextStop ? legBetween(stop.cityId, nextStop.cityId) : undefined;

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
                  className="pr-2.5 pl-0.5 py-1.5 rounded-r-full text-[var(--muted)] hover:text-[var(--danger)] transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {leg && renderLeg(leg)}
            </div>
          );
        })}

        {homebound && (
          <div className="flex items-center gap-2">
            {renderLeg(homebound)}
            {homeChip(homebound.to)}
          </div>
        )}

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
    </Card>
  );
}
