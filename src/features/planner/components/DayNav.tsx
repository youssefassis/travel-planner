"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { ItineraryDay, TransportLeg } from "../types";
import TransportModeIcon from "./TransportModeIcon";

const NavButton = ({
  day,
  leg,
  direction,
  onSelect,
}: {
  day: ItineraryDay;
  leg?: TransportLeg;
  direction: "prev" | "next";
  onSelect: (dayId: string) => void;
}) => (
  <button
    type="button"
    onClick={() => onSelect(day.id)}
    className={`flex-1 max-w-[280px] rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 transition-all hover:border-[var(--primary)]/40 hover:shadow-sm ${
      direction === "prev" ? "text-left" : "text-right"
    }`}
  >
    <span
      className={`flex items-center gap-1.5 text-caption text-[var(--muted)] mb-0.5 ${
        direction === "next" ? "justify-end" : ""
      }`}
    >
      {direction === "prev" && <ArrowLeft className="w-3 h-3" />}
      {direction === "prev" ? "Previous" : "Next"}
      {direction === "next" && <ArrowRight className="w-3 h-3" />}
    </span>
    <span className="block text-sm font-medium text-[var(--fg)]">
      {day.label} · {day.city}
    </span>
    {leg && (
      <span
        className={`flex items-center gap-1.5 text-xs text-[var(--muted)] mt-1 ${
          direction === "next" ? "justify-end" : ""
        }`}
      >
        <TransportModeIcon mode={leg.mode} className="w-3.5 h-3.5" />
        {leg.durationHrs}h · €{leg.cost}
      </span>
    )}
  </button>
);

/**
 * Previous/next day navigation under the day card. When the neighboring day
 * is in another city, the button carries the transport leg between them —
 * the trip reads as one continuous journey.
 */
export default function DayNav({
  itinerary,
  activeDayId,
  legs,
  onSelectDay,
}: {
  itinerary: ItineraryDay[];
  activeDayId: string | null;
  legs: TransportLeg[];
  onSelectDay: (dayId: string) => void;
}) {
  const index = itinerary.findIndex((d) => d.id === activeDayId);
  if (index === -1) return null;

  const prev = itinerary[index - 1];
  const next = itinerary[index + 1];
  const current = itinerary[index];
  if (!prev && !next) return null;

  const legBetween = (from: ItineraryDay, to: ItineraryDay) =>
    from.cityId === to.cityId
      ? undefined
      : legs.find(
          (l) => l.fromCityId === from.cityId && l.toCityId === to.cityId
        );

  return (
    <div className="flex justify-between gap-3">
      {prev ? (
        <NavButton
          day={prev}
          leg={legBetween(prev, current)}
          direction="prev"
          onSelect={onSelectDay}
        />
      ) : (
        <span className="flex-1 max-w-[280px]" />
      )}
      {next ? (
        <NavButton
          day={next}
          leg={legBetween(current, next)}
          direction="next"
          onSelect={onSelectDay}
        />
      ) : (
        <span className="flex-1 max-w-[280px]" />
      )}
    </div>
  );
}
