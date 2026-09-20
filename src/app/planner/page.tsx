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
  saveDraft,
  saveTrips,
  tripId,
  tripName,
  upsertTrip,
} from "@/features/planner/lib/tripStorage";
import { refreshTripShelf } from "@/features/planner/lib/useTripShelf";

import Link from "next/link";
import TripWizard from "@/features/planner/components/wizard/TripWizard";
import PrintItinerary from "@/features/planner/components/PrintItinerary";
import PlanHub from "./_components/PlanHub";
import { BookMode, HubTab, parseBookMode, parseTab } from "./_lib/tabs";

import { Booking, Bookings, TripIntent, TripPlan } from "@/features/planner/types";

import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import { fadeIn } from "@/components/motion";

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
  const [initialTab, setInitialTab] = useState<HubTab | null>(null);
  const [initialBookMode, setInitialBookMode] = useState<BookMode>("flights");
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
    setInitialBookMode(parseBookMode(searchParams.get("tab")));
    const stored = loadTrips();
    setSaved(stored);

    const shared = intentFromShareParams(searchParams);
    if (shared) {
      patchIntent(shared);
      generateFrom(shared);
      return;
    }
    // /trips hands off a saved trip by id — open it exactly as stored.
    const tripParam = searchParams.get("trip");
    const savedTrip = tripParam
      ? stored.find((trip) => trip.id === tripParam)
      : undefined;
    if (savedTrip) {
      patchIntent(savedTrip.intent);
      openPlan(savedTrip.intent, savedTrip.plan, savedTrip.bookings);
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
    if (trip && planIntent) {
      saveDraft({ intent: planIntent, plan: trip, bookings });
      refreshTripShelf();
    }
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
    refreshTripShelf();
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

  // Adopting an alternative replaces the plan and the intent behind it, so a
  // later edit or share reproduces the version the traveller chose.
  const handleAdoptVariant = (plan: TripPlan, source: TripIntent) => {
    patchIntent(source);
    openPlan(source, plan, bookings);
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
                  {saved.length > 0 && (
                    <p className="text-center text-sm text-[var(--muted)]">
                      Looking for a trip you already planned?{" "}
                      <Link
                        href="/trips"
                        className="font-medium text-[var(--primary)] hover:underline underline-offset-2"
                      >
                        Your trips →
                      </Link>
                    </p>
                  )}
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
                      initialBookMode={initialBookMode}
                      onSave={handleSaveTrip}
                      isSaved={isSaved}
                      bookings={bookings}
                      onBooked={handleBooked}
                      onAdoptVariant={handleAdoptVariant}
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
