"use client";

import { useEffect, useState, useMemo } from "react";

import { useTripIntentStore } from "@/features/itinerary/store/tripIntentStore";
import { generateTripPlan } from "@/features/itinerary/lib";

import PlannerSidebar from "@/features/itinerary/components/PlannerSidebar";
import PlannerCanvas from "@/features/itinerary/components/PlannerCanvas";
import SuggestionsPanel from "@/features/itinerary/components/SuggestionsPanel";

import { TripPlan } from "@/features/itinerary/types";

type ActiveTab = "flights" | "stays" | "activities";

export default function PlannerPage() {
  const { intent } = useTripIntentStore();

  const [trip, setTrip] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("flights");

  const generate = async () => {
    setLoading(true);

    const result = await generateTripPlan(intent);

    setTrip(result);
    setActiveDayId(result.itinerary?.[0]?.id ?? null);

    setLoading(false);
  };

  useEffect(() => {
    generate();
  }, [intent.duration, intent.query, intent.companions, intent.vibe]);

  const itinerary = useMemo(() => trip?.itinerary ?? [], [trip]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="pt-24 pb-20">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-[280px_1fr_340px] gap-6">
          {/* LEFT: FILTERS */}
          <PlannerSidebar />

          {/* CENTER: MAP + ITINERARY */}
          <PlannerCanvas
            itinerary={itinerary}
            activeDayId={activeDayId}
            setActiveDayId={setActiveDayId}
            loading={loading}
          />

          {/* RIGHT: SUGGESTIONS */}
          <SuggestionsPanel
            trip={trip}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>
    </div>
  );
}
