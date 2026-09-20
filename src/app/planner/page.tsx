"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { useTripIntentStore } from "@/features/planner/store/tripIntentStore";
import { generateTripPlan } from "@/features/planner/engine";
import { intentFromShareParams } from "@/features/planner/lib/share";
import { intentFromHeroParams } from "@/features/planner/lib/heroPrefill";
import {
  StoredTrip,
  loadDraft,
  loadTrips,
  removeTrip,
  saveDraft,
  saveTrips,
  tripId,
  tripName,
  upsertTrip,
} from "@/features/planner/lib/tripStorage";

import TripWizard from "@/features/planner/components/wizard/TripWizard";
import PrintItinerary from "@/features/planner/components/PrintItinerary";
import PlanHub from "./_components/PlanHub";
import SavedTrips from "./_components/SavedTrips";
import { HubTab, HUB_TABS } from "./_components/HubTabs";

import { Booking, Bookings, TripIntent, TripPlan } from "@/features/planner/types";

import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import { fadeIn } from "@/components/motion";

function parseTab(value: string | null): HubTab {
  return HUB_TABS.some((t) => t.value === value) ? (value as HubTab) : "itinerary";
}

function PlannerPageContent() {
  const searchParams = useSearchParams();
  const { intent, patchIntent } = useTripIntentStore();

  // The page moves between answering the wizard and reviewing the plan.
  const [phase, setPhase] = useState<"wizard" | "revealed">("wizard");
  const [stepIndex, setStepIndex] = useState(0);

  const [trip, setTrip] = useState<TripPlan | null>(null);
  // The intent the current plan was generated with — replanning and sharing
  // must use this snapshot, not live form state the user may have edited.
  const [planIntent, setPlanIntent] = useState<TripIntent | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [initialTab, setInitialTab] = useState<HubTab>("itinerary");
  const [saved, setSaved] = useState<StoredTrip[]>([]);
  const [bookings, setBookings] = useState<Bookings>({});

  /** Show an existing plan as-is — restoring keeps the traveler's edits. */
  const openPlan = (source: TripIntent, plan: TripPlan, booked: Bookings = {}) => {
    setTrip(plan);
    setPlanIntent(source);
    setBookings(booked);
    setActiveDayId(plan.itinerary?.[0]?.id ?? null);
    setPhase("revealed");
    // The reveal replaces the wizard mid-scroll; start at the trip summary.
    window.scrollTo(0, 0);
  };

  const generateFrom = (source: TripIntent) => {
    setLoading(true);
    openPlan(source, generateTripPlan(source));
    setLoading(false);
  };

  // A share link carries a full intent — regenerate that exact plan and skip
  // the wizard (the engine is deterministic). Hero/destination links only
  // prefill the wizard's answers; everyone else starts at step 1.
  useEffect(() => {
    setInitialTab(parseTab(searchParams.get("tab")));
    setSaved(loadTrips());

    const shared = intentFromShareParams(searchParams);
    if (shared) {
      patchIntent(shared);
      generateFrom(shared);
      return;
    }
    // A hero link is an explicit "plan this", so it wins over what was here
    // before; otherwise pick up the trip the traveler was last looking at.
    const prefilled = intentFromHeroParams(searchParams, intent);
    if (prefilled) {
      patchIntent(prefilled);
      return;
    }
    const draft = loadDraft();
    if (draft) {
      patchIntent(draft.intent);
      openPlan(draft.intent, draft.plan, draft.bookings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Survive a refresh: whatever is on screen is what comes back.
  useEffect(() => {
    if (trip && planIntent) saveDraft({ intent: planIntent, plan: trip, bookings });
  }, [trip, planIntent, bookings]);

  const handleBooked = (booking: Booking) =>
    setBookings((current) => ({ ...current, [booking.activityId]: booking }));

  const currentId = trip && planIntent ? tripId(trip, planIntent) : null;

  // "Saved" has to mean *this* plan, not just this route on these dates —
  // otherwise editing a saved trip would leave no way to store the change.
  const isSaved = useMemo(() => {
    if (!trip || currentId === null) return false;
    const stored = saved.find((t) => t.id === currentId);
    return (
      stored !== undefined &&
      JSON.stringify(stored.plan) === JSON.stringify(trip) &&
      JSON.stringify(stored.bookings) === JSON.stringify(bookings)
    );
  }, [saved, trip, currentId, bookings]);

  const persist = (trips: StoredTrip[]) => {
    setSaved(trips);
    saveTrips(trips);
  };

  const handleSaveTrip = () => {
    if (!trip || !planIntent || !currentId) return;
    persist(
      upsertTrip(saved, {
        id: currentId,
        name: tripName(trip, planIntent),
        savedAt: Date.now(),
        intent: planIntent,
        plan: trip,
        bookings,
      }),
    );
  };

  const handleOpenTrip = (entry: StoredTrip) => {
    patchIntent(entry.intent);
    openPlan(entry.intent, entry.plan, entry.bookings);
  };

  const startEditing = () => {
    setStepIndex(0);
    setPhase("wizard");
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="pt-28 md:pt-32 pb-16 sm:pb-20 print:p-0">
        <Container size="wide" className="print:space-y-0">
          <div className="print:hidden">
            <AnimatePresence mode="wait" initial={false}>
              {phase === "wizard" ? (
                <motion.div
                  key="wizard"
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-8"
                >
                  <PageHeader
                    align="center"
                    title="Plan a trip"
                    description="Three quick questions, then your full itinerary."
                  />
                  <TripWizard
                    stepIndex={stepIndex}
                    onStepChange={setStepIndex}
                    onGenerate={() => generateFrom(intent)}
                    loading={loading}
                    onCancel={trip ? () => setPhase("revealed") : undefined}
                  />
                  <SavedTrips
                    trips={saved}
                    onOpen={handleOpenTrip}
                    onDelete={(id) => persist(removeTrip(saved, id))}
                  />
                </motion.div>
              ) : (
                trip &&
                planIntent && (
                  <motion.div
                    key="revealed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <PlanHub
                      trip={trip}
                      setTrip={setTrip}
                      planIntent={planIntent}
                      activeDayId={activeDayId}
                      setActiveDayId={setActiveDayId}
                      onEdit={startEditing}
                      initialTab={initialTab}
                      onSave={handleSaveTrip}
                      isSaved={isSaved}
                      bookings={bookings}
                      onBooked={handleBooked}
                    />
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>

          {/* Print / PDF layout */}
          {trip && planIntent && (
            <PrintItinerary
              plan={trip}
              pace={planIntent.vibe.pace}
              startDate={planIntent.startDate}
            />
          )}
        </Container>
      </div>
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
