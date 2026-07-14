"use client";

import { ItineraryDay } from "../types";

type Props = {
  itinerary: ItineraryDay[];
  activeDayId: string | null;
  setActiveDayId: (id: string) => void;
};

/** Horizontal, scrollable strip of day cards. */
export default function DayTimeline({ itinerary, activeDayId, setActiveDayId }: Props) {
  if (itinerary.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" role="tablist">
      {itinerary.map((day) => {
        const isActive = activeDayId === day.id;
        return (
          <button
            key={day.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setActiveDayId(day.id)}
            className={`shrink-0 min-w-[132px] p-3 rounded-xl border bg-[var(--card)] text-left transition-all ${
              isActive
                ? "border-transparent ring-2 ring-[var(--primary)]"
                : "border-[var(--border)] hover:border-[var(--primary)]/40"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-sm font-medium text-[var(--fg)]">{day.label}</span>
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
            <span className="block text-xs text-[var(--muted)] truncate">{day.city}</span>
          </button>
        );
      })}
    </div>
  );
}
