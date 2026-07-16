"use client";

import { Fragment, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { ItineraryDay, TransportLeg } from "../types";
import TransportModeIcon from "./TransportModeIcon";

type Props = {
  itinerary: ItineraryDay[];
  activeDayId: string | null;
  setActiveDayId: (id: string) => void;
  legs?: TransportLeg[];
};

/**
 * Horizontal, scrollable strip of day cards, connected like the journey
 * they are: plain links between same-city days, the transport mode where
 * the trip moves on to the next city.
 */
export default function DayTimeline({
  itinerary,
  activeDayId,
  setActiveDayId,
  legs = [],
}: Props) {
  const prefersReducedMotion = useReducedMotion();
  const activeTabRef = useRef<HTMLButtonElement | null>(null);

  // Keep the selected day visible when it changes via the arrows.
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      inline: "nearest",
      block: "nearest",
    });
  }, [activeDayId, prefersReducedMotion]);

  if (itinerary.length === 0) return null;

  const Connector = ({
    prev,
    day,
  }: {
    prev: ItineraryDay;
    day: ItineraryDay;
  }) => {
    if (prev.cityId === day.cityId) {
      return <span aria-hidden className="shrink-0 w-3 h-px bg-[var(--border)]" />;
    }
    const leg = legs.find(
      (l) => l.fromCityId === prev.cityId && l.toCityId === day.cityId
    );
    return (
      <span
        aria-hidden
        className="shrink-0 flex items-center gap-1 text-[var(--muted)]"
      >
        <span className="w-2 h-px bg-[var(--border)]" />
        {leg && <TransportModeIcon mode={leg.mode} size={13} />}
        <span className="w-2 h-px bg-[var(--border)]" />
      </span>
    );
  };

  return (
    <div
      className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-hide"
      role="tablist"
    >
      {itinerary.map((day, i) => {
        const isActive = activeDayId === day.id;
        return (
          <Fragment key={day.id}>
            {i > 0 && <Connector prev={itinerary[i - 1]} day={day} />}
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              ref={isActive ? activeTabRef : undefined}
              onClick={() => setActiveDayId(day.id)}
              className={`shrink-0 min-w-[124px] p-3 rounded-xl border bg-[var(--card)] text-left transition-all ${
                isActive
                  ? "border-transparent ring-2 ring-[var(--primary)]"
                  : "border-[var(--border)] hover:border-[var(--primary)]/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-medium text-[var(--fg)]">
                  {day.label}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--card-subtle)] text-[var(--muted)]"
                  }`}
                >
                  {day.activities.length}
                </span>
              </div>
              <span className="block text-xs text-[var(--muted)] truncate">
                {day.city}
              </span>
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
