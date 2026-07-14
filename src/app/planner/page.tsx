"use client";

import { useEffect, useState, useMemo } from "react";

import { useTripIntentStore } from "@/features/planner/store/tripIntentStore";
import { generateTripPlan } from "@/features/planner/engine";

import PlannerSidebar from "@/features/planner/components/PlannerSidebar";
import PlannerCanvas from "@/features/planner/components/PlannerCanvas";
import SuggestionsPanel, {
  SuggestionsTab,
} from "@/features/planner/components/SuggestionsPanel";

import { TripPlan } from "@/features/planner/types";

import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";

export default function PlannerPage() {
  const { intent } = useTripIntentStore();

  const [trip, setTrip] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SuggestionsTab>("budget");

  const generate = () => {
    setLoading(true);

    const result = generateTripPlan(intent);

    setTrip(result);
    setActiveDayId(result.itinerary?.[0]?.id ?? null);

    setLoading(false);
  };

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const itinerary = useMemo(() => trip?.itinerary ?? [], [trip]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="pt-28 md:pt-32 pb-20">
        <Container size="wide">
          <PageHeader
            title="Trip planner"
            description="Tune your preferences and generate a multi-city itinerary."
          />

          {trip && trip.notes.length > 0 && (
            <Card padding="md" className="mb-6 space-y-1">
              {trip.notes.map((note, i) => (
                <p key={i} className="text-sm text-[var(--muted)]">
                  {note}
                </p>
              ))}
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_340px] gap-6">
            {/* LEFT: FILTERS */}
            <PlannerSidebar onGenerate={generate} loading={loading} />

            {/* CENTER: MAP + ITINERARY */}
            <PlannerCanvas
              itinerary={itinerary}
              activeDayId={activeDayId}
              setActiveDayId={setActiveDayId}
              loading={loading}
              stops={trip?.stops ?? []}
              legs={trip?.legs ?? []}
            />

            {/* RIGHT: SUGGESTIONS */}
            <div className="md:col-span-2 xl:col-span-1">
              <SuggestionsPanel
                trip={trip}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                activeDayId={activeDayId}
              />
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
