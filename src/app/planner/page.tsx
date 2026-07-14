"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useTripIntentStore } from "@/features/planner/store/tripIntentStore";
import {
  addActivity,
  addCity,
  generateTripPlan,
  makeRainFriendly,
  removeActivity,
  removeCity,
  swapActivity,
  unusedPoisForCity,
} from "@/features/planner/engine";
import { intentFromShareParams } from "@/features/planner/lib/share";

import TripCommandBar from "@/features/planner/components/TripCommandBar";
import MapView from "@/features/planner/components/MapView";
import BudgetOverlay from "@/features/planner/components/BudgetOverlay";
import RouteStrip from "@/features/planner/components/RouteStrip";
import DayTimeline from "@/features/planner/components/DayTimeline";
import DayDetails from "@/features/planner/components/DayDetails";
import BeforeYouGo from "@/features/planner/components/BeforeYouGo";
import ShareTripBar from "@/features/planner/components/ShareTripBar";
import PrintItinerary from "@/features/planner/components/PrintItinerary";
import BookActivityPanel, {
  BookingTarget,
} from "@/features/planner/components/BookActivityPanel";

import { Activity, TripIntent, TripPlan } from "@/features/planner/types";

import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";

function PlannerPageContent() {
  const searchParams = useSearchParams();
  const { intent, patchIntent } = useTripIntentStore();

  const [trip, setTrip] = useState<TripPlan | null>(null);
  // The intent the current plan was generated with — replanning and sharing
  // must use this snapshot, not live form state the user may have edited.
  const [planIntent, setPlanIntent] = useState<TripIntent | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingTarget | null>(null);

  const generateFrom = (source: TripIntent) => {
    setLoading(true);

    const result = generateTripPlan(source);

    setTrip(result);
    setPlanIntent(source);
    setActiveDayId(result.itinerary?.[0]?.id ?? null);

    setLoading(false);
  };

  const generate = () => generateFrom(intent);

  // First draft on load — from a shared link's intent when present, so the
  // recipient sees the exact plan that was shared (the engine is
  // deterministic), otherwise from the traveler's own preferences.
  useEffect(() => {
    const shared = intentFromShareParams(searchParams);
    if (shared) {
      patchIntent(shared);
      generateFrom(shared);
    } else {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const itinerary = useMemo(() => trip?.itinerary ?? [], [trip]);
  const activeDay = itinerary.find((day) => day.id === activeDayId) ?? null;

  const handleSwap = (activityId: string): boolean => {
    if (!trip || !planIntent || !activeDayId) return false;
    const next = swapActivity(trip, planIntent, activeDayId, activityId);
    if (!next) return false;
    setTrip(next);
    return true;
  };

  const handleRainDay = (): boolean => {
    if (!trip || !planIntent || !activeDayId) return false;
    const next = makeRainFriendly(trip, planIntent, activeDayId);
    if (!next) return false;
    setTrip(next);
    return true;
  };

  const handleRemoveActivity = (activityId: string) => {
    if (!trip || !planIntent || !activeDayId) return;
    const next = removeActivity(trip, planIntent, activeDayId, activityId);
    if (next) setTrip(next);
  };

  const handleAddActivity = (poiId: string) => {
    if (!trip || !planIntent || !activeDayId) return;
    const next = addActivity(trip, planIntent, activeDayId, poiId);
    if (next) setTrip(next);
  };

  // City edits renumber every day id — keep the selection on the same city
  // when it survives, otherwise fall back to the first day.
  const applyCityEdit = (next: TripPlan | null): boolean => {
    if (!next) return false;
    const stillThere = next.itinerary.some((d) => d.id === activeDayId);
    const sameCity = activeDay
      ? next.itinerary.find((d) => d.cityId === activeDay.cityId)
      : undefined;
    setTrip(next);
    if (!stillThere) {
      setActiveDayId(sameCity?.id ?? next.itinerary[0]?.id ?? null);
    }
    return true;
  };

  const handleAddCity = (cityId: string): boolean => {
    if (!trip || !planIntent) return false;
    return applyCityEdit(addCity(trip, planIntent, cityId));
  };

  const handleRemoveCity = (cityId: string): boolean => {
    if (!trip || !planIntent) return false;
    return applyCityEdit(removeCity(trip, planIntent, cityId));
  };

  const availablePois = useMemo(
    () => (trip && activeDay ? unusedPoisForCity(trip, activeDay.cityId) : []),
    [trip, activeDay]
  );

  // Table for 1/2/4 depending on who's traveling.
  const partySize =
    planIntent?.companions === "couple" ? 2 : planIntent?.companions === "group" ? 4 : 1;

  const bookFromDay = (activity: Activity, startMin: number | null) => {
    setBooking({ activity, dayLabel: activeDay?.label ?? "", startMin });
  };

  const bookFromChecklist = (activity: Activity, dayLabel: string) => {
    setBooking({ activity, dayLabel, startMin: null });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="pt-28 md:pt-32 pb-20 print:p-0">
        <Container size="wide" className="space-y-6 print:space-y-0">
          <div className="print:hidden space-y-6">
            <PageHeader
              title="Trip planner"
              description="A first draft in seconds — then review, swap, and adapt it like a travel companion."
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

            {/* Route overview + share */}
            <RouteStrip
              stops={trip?.stops ?? []}
              legs={trip?.legs ?? []}
              itinerary={itinerary}
              setActiveDayId={setActiveDayId}
              onRemoveCity={handleRemoveCity}
              onAddCity={handleAddCity}
            />
            {trip && planIntent && (
              <ShareTripBar plan={trip} intent={planIntent} pace={planIntent.vibe.pace} />
            )}

            {/* Day-by-day timeline */}
            <DayTimeline
              itinerary={itinerary}
              activeDayId={activeDayId}
              setActiveDayId={setActiveDayId}
            />

            {/* Selected day — timed companion schedule */}
            <DayDetails
              key={activeDayId ?? "no-day"}
              day={activeDay}
              stops={trip?.stops ?? []}
              pace={planIntent?.vibe.pace ?? "balanced"}
              budgetTier={planIntent?.vibe.budget ?? "comfort"}
              availablePois={availablePois}
              onSwap={handleSwap}
              onRainDay={handleRainDay}
              onBook={bookFromDay}
              onRemove={handleRemoveActivity}
              onAdd={handleAddActivity}
            />

            {/* Trip-wide booking checklist */}
            <BeforeYouGo itinerary={itinerary} onBook={bookFromChecklist} />
          </div>

          {/* Print / PDF layout */}
          {trip && planIntent && (
            <PrintItinerary plan={trip} pace={planIntent.vibe.pace} />
          )}
        </Container>
      </div>

      {/* Attraction / restaurant booking */}
      {booking && (
        <BookActivityPanel
          target={booking}
          partySize={partySize}
          onClose={() => setBooking(null)}
        />
      )}
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <PlannerPageContent />
    </Suspense>
  );
}
