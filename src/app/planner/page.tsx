"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { useTripIntentStore } from "@/features/planner/store/tripIntentStore";
import {
  addActivity,
  addCity,
  generateTripPlan,
  makeRainFriendly,
  moveActivity,
  moveActivityToDay,
  removeActivity,
  removeCity,
  removeDay,
  swapActivity,
  unusedPoisForCity,
} from "@/features/planner/engine";
import { intentFromShareParams } from "@/features/planner/lib/share";
import { intentFromHeroParams } from "@/features/planner/lib/heroPrefill";

import TripWizard from "@/features/planner/components/wizard/TripWizard";
import TripSummaryHeader from "@/features/planner/components/TripSummaryHeader";
import MapView from "@/features/planner/components/MapView";
import BudgetOverlay from "@/features/planner/components/BudgetOverlay";
import RouteStrip from "@/features/planner/components/RouteStrip";
import DayByDay from "@/features/planner/components/DayByDay";
import DayDetails from "@/features/planner/components/DayDetails";
import BeforeYouGo from "@/features/planner/components/BeforeYouGo";
import ShareTripBar from "@/features/planner/components/ShareTripBar";
import PrintItinerary from "@/features/planner/components/PrintItinerary";
import BookActivityPanel, {
  BookingTarget,
} from "@/features/planner/components/BookActivityPanel";

import { Activity, TripIntent, TripPlan } from "@/features/planner/types";

import Container from "@/components/ui/Container";
import { fadeIn, fadeInUp, staggerChildren } from "@/components/motion";

function GroupHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-h3 text-[var(--fg)]">{children}</h2>;
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
  const [booking, setBooking] = useState<BookingTarget | null>(null);

  const generateFrom = (source: TripIntent) => {
    setLoading(true);

    const result = generateTripPlan(source);

    setTrip(result);
    setPlanIntent(source);
    setActiveDayId(result.itinerary?.[0]?.id ?? null);

    setLoading(false);
    setPhase("revealed");
    // The reveal replaces the wizard mid-scroll; start at the trip summary.
    window.scrollTo(0, 0);
  };

  // A share link carries a full intent — regenerate that exact plan and skip
  // the wizard (the engine is deterministic). Hero/destination links only
  // prefill the wizard's answers; everyone else starts at step 1.
  useEffect(() => {
    const shared = intentFromShareParams(searchParams);
    if (shared) {
      patchIntent(shared);
      generateFrom(shared);
      return;
    }
    const prefilled = intentFromHeroParams(searchParams, intent);
    if (prefilled) patchIntent(prefilled);
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

  const handleMoveActivity = (
    activityId: string,
    direction: "up" | "down"
  ): boolean => {
    if (!trip || !planIntent || !activeDayId) return false;
    const next = moveActivity(trip, planIntent, activeDayId, activityId, direction);
    if (!next) return false;
    setTrip(next);
    return true;
  };

  const handleMoveToDay = (activityId: string, toDayId: string): boolean => {
    if (!trip || !planIntent || !activeDayId) return false;
    const next = moveActivityToDay(trip, planIntent, activeDayId, activityId, toDayId);
    if (!next) return false;
    setTrip(next);
    return true;
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

  // Day removal renumbers day ids just like city edits do.
  const handleRemoveDay = (): boolean => {
    if (!trip || !planIntent || !activeDayId) return false;
    return applyCityEdit(removeDay(trip, planIntent, activeDayId));
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

  const startEditing = () => {
    setStepIndex(0);
    setPhase("wizard");
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="pt-28 md:pt-32 pb-20 print:p-0">
        <Container size="wide" className="space-y-6 print:space-y-0">
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
                  <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-h1 text-[var(--fg)]">Plan a trip</h1>
                    <p className="text-body-lg text-[var(--muted)] mt-2">
                      Three quick questions, then your full itinerary.
                    </p>
                  </div>
                  <TripWizard
                    stepIndex={stepIndex}
                    onStepChange={setStepIndex}
                    onGenerate={() => generateFrom(intent)}
                    loading={loading}
                    onCancel={trip ? () => setPhase("revealed") : undefined}
                  />
                </motion.div>
              ) : (
                trip &&
                planIntent && (
                  <motion.div
                    key="revealed"
                    variants={staggerChildren(0.08)}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <motion.div variants={fadeInUp}>
                      <TripSummaryHeader
                        plan={trip}
                        intent={planIntent}
                        onEdit={startEditing}
                      />
                    </motion.div>

                    {/* Itinerary leads; map/route/budget/share form a
                        compact context rail that pins while days scroll. */}
                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-8">
                      <motion.section variants={fadeInUp} className="space-y-4">
                        <GroupHeading>Day by day</GroupHeading>
                        <DayByDay
                          itinerary={itinerary}
                          activeDayId={activeDayId}
                          setActiveDayId={setActiveDayId}
                          legs={trip.legs}
                        >
                          <DayDetails
                            day={activeDay}
                            stops={trip.stops}
                            pace={planIntent.vibe.pace}
                            budgetTier={planIntent.vibe.budget}
                            availablePois={availablePois}
                            onSwap={handleSwap}
                            onRainDay={handleRainDay}
                            onBook={bookFromDay}
                            onRemove={handleRemoveActivity}
                            onAdd={handleAddActivity}
                            onMove={handleMoveActivity}
                            onMoveToDay={handleMoveToDay}
                            onRemoveDay={handleRemoveDay}
                          />
                        </DayByDay>
                        <BeforeYouGo
                          itinerary={itinerary}
                          onBook={bookFromChecklist}
                        />
                      </motion.section>

                      {/* Sticky lives on a plain child: framer's inline
                          transform on the animated wrapper would break it. */}
                      <motion.aside variants={fadeInUp}>
                        <div className="space-y-4 lg:sticky lg:top-24">
                        <MapView
                          itinerary={itinerary}
                          activeDayId={activeDayId}
                          onSelectDay={setActiveDayId}
                          stops={trip.stops}
                          legs={trip.legs}
                          className="h-[260px] lg:h-[300px]"
                        />
                        <RouteStrip
                          stops={trip.stops}
                          legs={trip.legs}
                          itinerary={itinerary}
                          setActiveDayId={setActiveDayId}
                          onRemoveCity={handleRemoveCity}
                          onAddCity={handleAddCity}
                        />
                        <BudgetOverlay budget={trip.budget} />
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
                          <ShareTripBar
                            plan={trip}
                            intent={planIntent}
                            pace={planIntent.vibe.pace}
                          />
                        </div>
                        </div>
                      </motion.aside>
                    </div>
                  </motion.div>
                )
              )}
            </AnimatePresence>
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
