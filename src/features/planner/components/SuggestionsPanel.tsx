"use client";

import { TripPlan } from "../types";

export type SuggestionsTab = "budget" | "cities" | "activities";

type Props = {
  trip: TripPlan | null;
  activeTab: SuggestionsTab;
  setActiveTab: (t: SuggestionsTab) => void;
};

const TABS: SuggestionsTab[] = ["budget", "cities", "activities"];

export default function SuggestionsPanel({ trip, activeTab, setActiveTab }: Props) {
  if (!trip) return null;

  return (
    <aside className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 text-sm">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-3 py-1.5 rounded-xl capitalize
              ${
                activeTab === tab
                  ? "bg-[var(--foreground)] text-[var(--bg)]"
                  : "bg-[var(--card)]"
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {activeTab === "budget" && (
          <div className="p-3 rounded-xl bg-[var(--card)] space-y-2">
            <div className="flex justify-between text-sm">
              <span>Transport</span>
              <span>€{trip.budget.transport}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Stays</span>
              <span>€{trip.budget.stays}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Activities</span>
              <span>€{trip.budget.activities}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Food</span>
              <span>€{trip.budget.food}</span>
            </div>
            <div className="flex justify-between text-sm font-medium border-t border-[var(--border)] pt-2">
              <span>Total</span>
              <span>€{trip.budget.total}</span>
            </div>
            <div className="text-xs text-[var(--muted)]">
              €{trip.budget.perDay}/day
            </div>
          </div>
        )}

        {activeTab === "cities" &&
          trip.stops.map((stop) => (
            <div key={stop.cityId} className="p-3 rounded-xl bg-[var(--card)]">
              <div className="text-sm font-medium">{stop.city}</div>
              <div className="text-xs text-[var(--muted)]">
                {stop.days} {stop.days === 1 ? "day" : "days"} · €
                {stop.stayPerNight}/night · €{stop.stayTotal} total
              </div>
            </div>
          ))}

        {activeTab === "activities" &&
          trip.itinerary[0]?.activities.map((a) => (
            <div key={a.id} className="p-3 rounded-xl bg-[var(--card)]">
              <div className="text-sm">{a.name}</div>
              <div className="text-xs text-[var(--muted)]">{a.category}</div>
            </div>
          ))}
      </div>
    </aside>
  );
}
