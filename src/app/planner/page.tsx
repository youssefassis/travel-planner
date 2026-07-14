"use client";

import { useEffect, useMemo, useState } from "react";

import { useTripIntentStore } from "@/features/planner/store/tripIntentStore";
import { generateTripPlan } from "@/features/planner/engine";

import TripCommandBar from "@/features/planner/components/TripCommandBar";
import MapView from "@/features/planner/components/MapView";
import BudgetOverlay from "@/features/planner/components/BudgetOverlay";
import RouteStrip from "@/features/planner/components/RouteStrip";
import DayTimeline from "@/features/planner/components/DayTimeline";
import DayDetails from "@/features/planner/components/DayDetails";

import { TripPlan } from "@/features/planner/types";

import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";

export default function PlannerPage() {
  const { intent } = useTripIntentStore();

  const [trip, setTrip] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeDayId, setActiveDayId] = useState<string | null>(null);

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
  const activeDay = itinerary.find((day) => day.id === activeDayId) ?? null;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="pt-28 md:pt-32 pb-20">
        <Container size="wide" className="space-y-6">
          <PageHeader
            title="Trip planner"
            description="Tune your preferences and generate a multi-city itinerary."
          />

          {/* Trip brief + generate */}
          <TripCommandBar onGenerate={generate} loading={loading} />

          {/* Engine notes */}
          {trip && trip.notes.length > 0 && (
            <Card padding="md" className="space-y-1">
              {trip.notes.map((note, i) => (
                <p key={i} className="text-sm text-[var(--muted)]">
                  {note}
                </p>
              ))}
            </Card>
          )}

          {/* Full-width map with docked budget */}
          <div className="relative">
            <MapView
              itinerary={itinerary}
              activeDayId={activeDayId}
              onSelectDay={setActiveDayId}
              stops={trip?.stops ?? []}
              legs={trip?.legs ?? []}
            />
            {trip && <BudgetOverlay budget={trip.budget} />}
          </div>

          {/* Route overview */}
          <RouteStrip
            stops={trip?.stops ?? []}
            legs={trip?.legs ?? []}
            itinerary={itinerary}
            setActiveDayId={setActiveDayId}
          />

          {/* Day-by-day timeline */}
          <DayTimeline
            itinerary={itinerary}
            activeDayId={activeDayId}
            setActiveDayId={setActiveDayId}
          />

          {/* Selected day */}
          <DayDetails
            day={activeDay}
            stops={trip?.stops ?? []}
            budgetTier={intent.vibe?.budget ?? "comfort"}
          />
        </Container>
      </div>
    </div>
  );
}
