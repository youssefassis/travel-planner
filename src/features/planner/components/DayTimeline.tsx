"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { formatDayDate } from "@/domain/dates";
import { dateOfDay } from "../lib/tripDates";
import { ItineraryDay, TransportLeg } from "../types";
import TransportModeIcon from "./TransportModeIcon";

type Props = {
  itinerary: ItineraryDay[];
  activeDayId: string | null;
  setActiveDayId: (id: string) => void;
  legs?: TransportLeg[];
  /** First day of the trip; when set, each card shows its real date. */
  startDate?: string;
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
  startDate,
}: Props) {
  const prefersReducedMotion = useReducedMotion();
  const activeTabRef = useRef<HTMLButtonElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  // Which edges still hide days. Drives the fades that keep a half-scrolled
  // card from reading as a card tucked under the prev/next arrows.
  const [overflow, setOverflow] = useState({ start: false, end: false });

  const measureOverflow = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setOverflow({ start: el.scrollLeft > 1, end: el.scrollLeft < max - 1 });
  }, []);

  // Keep the selected day visible when it changes via the arrows, clear of
  // the fade so it is never the card that looks cut.
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      inline: "nearest",
      block: "nearest",
    });
  }, [activeDayId, prefersReducedMotion]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    measureOverflow();
    const observer = new ResizeObserver(measureOverflow);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measureOverflow, itinerary.length]);

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
    <div className="relative">
      {/* Edge fades — the strip clips flush against the arrows, so without
          them a partly-scrolled day card looks hidden behind one. */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 w-8 z-10 bg-gradient-to-r from-[var(--card)] to-transparent transition-opacity duration-200 ${
          overflow.start ? "opacity-100" : "opacity-0"
        }`}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-[var(--card)] to-transparent transition-opacity duration-200 ${
          overflow.end ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        ref={scrollerRef}
        onScroll={measureOverflow}
        className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 scroll-px-2 scrollbar-hide"
        role="tablist"
      >
        {itinerary.map((day, i) => {
          const isActive = activeDayId === day.id;
          const date = dateOfDay(startDate, i + 1);
          // A day that loses hours to a journey says so before it's opened.
          const travel = day.arrival ?? day.departure;
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
                  {date ? `${formatDayDate(date)} · ${day.city}` : day.city}
                </span>
                {travel && (
                  <span className="mt-1 flex items-center gap-1 text-[var(--muted)]">
                    <TransportModeIcon mode={travel.mode} size={11} />
                    <span className="text-xs truncate">
                      {travel.durationHrs}h {day.arrival ? "to here" : "home"}
                    </span>
                  </span>
                )}
              </button>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
