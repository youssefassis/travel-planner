"use client";

import { TripPlan, TransportMode } from "../types";
import { useTripIntentStore } from "../store/tripIntentStore";
import Button from "@/components/ui/Button";

export type SuggestionsTab = "budget" | "cities" | "activities";

type Props = {
  trip: TripPlan | null;
  activeTab: SuggestionsTab;
  setActiveTab: (t: SuggestionsTab) => void;
  activeDayId: string | null;
};

const TABS: SuggestionsTab[] = ["budget", "cities", "activities"];

const MODE_LABELS: Record<TransportMode, string> = {
  car: "Car",
  bus: "Bus",
  train: "Train",
  flight: "Flight",
};

export default function SuggestionsPanel({
  trip,
  activeTab,
  setActiveTab,
  activeDayId,
}: Props) {
  const { intent } = useTripIntentStore();

  if (!trip) return null;

  const activeDay =
    trip.itinerary.find((d) => d.id === activeDayId) ?? trip.itinerary[0];

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

        {activeTab === "cities" && (
          <>
            {trip.legs.length > 0 && (
              <div className="p-3 rounded-xl bg-[var(--card)] space-y-2">
                {trip.legs.map((leg) => (
                  <div
                    key={leg.id}
                    className="flex flex-col gap-0.5 text-sm border-b border-[var(--border)] last:border-b-0 pb-2 last:pb-0"
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {leg.from} → {leg.to}
                      </span>
                      <span className="text-xs text-[var(--muted)] capitalize">
                        {MODE_LABELS[leg.mode]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                      <span>
                        {leg.durationHrs}h · €{leg.cost}
                      </span>
                      {leg.mode === "flight" && (
                        <Button
                          asLink
                          href={`/flights?from=${leg.fromCityId}&to=${leg.toCityId}`}
                          variant="accent"
                          size="sm"
                          className="!p-0 normal-case tracking-normal"
                        >
                          Find flights →
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {trip.stops.map((stop) => (
              <div key={stop.cityId} className="p-3 rounded-xl bg-[var(--card)]">
                <div className="text-sm font-medium">{stop.city}</div>
                <div className="text-xs text-[var(--muted)]">
                  {stop.days} {stop.days === 1 ? "day" : "days"} · €
                  {stop.stayPerNight}/night · €{stop.stayTotal} total
                </div>
                <Button
                  asLink
                  href={`/stays?city=${stop.cityId}&budget=${intent.vibe.budget}&nights=${stop.days}`}
                  variant="accent"
                  size="sm"
                  className="!p-0 !text-xs normal-case tracking-normal"
                >
                  Find stays →
                </Button>
              </div>
            ))}
          </>
        )}

        {activeTab === "activities" && activeDay && (
          <>
            <div className="text-xs text-[var(--muted)]">
              {activeDay.label} · {activeDay.city}
            </div>
            {activeDay.activities.map((a) => (
              <div key={a.id} className="p-3 rounded-xl bg-[var(--card)]">
                <div className="text-sm">{a.name}</div>
                <div className="flex justify-between text-xs text-[var(--muted)]">
                  <span>{a.category}</span>
                  <span>{a.price > 0 ? `€${a.price}` : "Free"}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </aside>
  );
}
