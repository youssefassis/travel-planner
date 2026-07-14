"use client";

import { TripPlan } from "../types";

type Props = {
  trip: TripPlan | null;
  activeTab: "flights" | "stays" | "activities";
  setActiveTab: (t: "flights" | "stays" | "activities") => void;
};

export default function SuggestionsPanel({ trip, activeTab, setActiveTab }: Props) {
  if (!trip) return null;

  return (
    <aside className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 text-sm">
        {["flights", "stays", "activities"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
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
        {activeTab === "flights" &&
          (trip.flights ?? []).map((f) => (
            <div key={f.id} className="p-3 rounded-xl bg-[var(--card)]">
              <div className="text-sm font-medium">${f.price}</div>
              <div className="text-xs text-[var(--muted)]">{f.duration}</div>
            </div>
          ))}

        {activeTab === "stays" &&
          (trip.stays ?? []).map((s) => (
            <div key={s.id} className="p-3 rounded-xl bg-[var(--card)]">
              <div className="text-sm font-medium">{s.name}</div>
              <div className="text-xs text-[var(--muted)]">
                ${s.pricePerNight}/night
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
