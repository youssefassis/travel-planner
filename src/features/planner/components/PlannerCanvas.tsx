"use client";

import MapView from "./MapView";
import { ItineraryDay } from "../types";

type Props = {
  itinerary: ItineraryDay[];
  activeDayId: string | null;
  setActiveDayId: (id: string) => void;
  loading: boolean;
};

export default function PlannerCanvas({
  itinerary,
  activeDayId,
  setActiveDayId,
  loading,
}: Props) {
  return (
    <div className="space-y-6">
      {/* MAP */}
      <div className="rounded-2xl overflow-hidden bg-[var(--card)]">
        <MapView
          itinerary={itinerary}
          activeDayId={activeDayId}
          onSelectDay={(id) => setActiveDayId(id)}
        />
      </div>

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
