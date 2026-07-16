"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import StayAdvisorForm from "@/features/stays/components/StayAdvisorForm";
import StayAdviceResults from "@/features/stays/components/StayAdviceResults";
import { roundBudget } from "@/features/stays/lib/adviseStays";
import { StayPreferences } from "@/features/stays/types";
import { BudgetTier } from "@/domain/types";
import { getCity } from "@/domain/cities";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import PlannerCallout from "@/components/ui/PlannerCallout";

function validCityId(id: string | null): string {
  return id && getCity(id) ? id : "";
}

function parseBudgetTier(value: string | null): BudgetTier | null {
  return value === "backpacker" || value === "comfort" || value === "luxury"
    ? value
    : null;
}

function parseNights(value: string | null): number | undefined {
  const parsed = value === null ? NaN : parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function prefsKey(p: StayPreferences): string {
  return [p.cityId, p.party, p.nights, p.budgetPerNight, p.styles.join(",")].join("|");
}

function StaysPageContent() {
  const searchParams = useSearchParams();
  const initialCityId = validCityId(searchParams.get("city"));
  const initialTier = parseBudgetTier(searchParams.get("budget"));
  const initialNights = parseNights(searchParams.get("nights"));

  const initialPrefs: StayPreferences = useMemo(() => {
    const city = initialCityId ? getCity(initialCityId) : undefined;
    return {
      cityId: initialCityId,
      party: "couple",
      nights: initialNights ?? 3,
      budgetPerNight: city
        ? roundBudget(city.stayPerNight[initialTier ?? "comfort"])
        : 150,
      styles: [],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [prefs, setPrefs] = useState<StayPreferences | null>(() =>
    initialCityId ? initialPrefs : null,
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="pt-28 md:pt-32 pb-16 sm:pb-20">
        <Container size="wide">
          <PageHeader
            title="Find stays"
            description="Answer a few questions — get neighborhoods and stays that fit how you travel."
          />

          <PlannerCallout variant={initialCityId ? "linked" : "standalone"} />

          {/* Advisor form */}
          <div className="mb-12 sm:mb-16">
            <StayAdvisorForm initial={initialPrefs} onAdvise={setPrefs} />
          </div>

          {prefs ? (
            <StayAdviceResults key={prefsKey(prefs)} prefs={prefs} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-[var(--muted)] text-lg">
                Tell us how you travel and we&apos;ll recommend where to stay
              </p>
            </motion.div>
          )}
        </Container>
      </div>
    </div>
  );
}

export default function StaysPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <StaysPageContent />
    </Suspense>
  );
}
