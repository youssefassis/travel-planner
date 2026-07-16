"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { useTripIntentStore } from "@/features/planner/store/tripIntentStore";
import { generateTripPlan } from "@/features/planner/engine";
import { intentFromShareParams } from "@/features/planner/lib/share";
import { intentFromHeroParams } from "@/features/planner/lib/heroPrefill";

import TripWizard from "@/features/planner/components/wizard/TripWizard";
import PrintItinerary from "@/features/planner/components/PrintItinerary";
import PlanHub from "./_components/PlanHub";
import { HubTab, HUB_TABS } from "./_components/HubTabs";

import { TripIntent, TripPlan } from "@/features/planner/types";

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
    setInitialTab(parseTab(searchParams.get("tab")));
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
                    />
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
