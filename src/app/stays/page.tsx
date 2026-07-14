"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import StayAdvisorForm from "@/features/stays/components/StayAdvisorForm";
import NeighborhoodCard from "@/features/stays/components/NeighborhoodCard";
import StayPickCard from "@/features/stays/components/StayPickCard";
import StayTypeAvatar from "@/features/stays/components/StayTypeAvatar";
import ReservePanel from "@/features/stays/components/ReservePanel";
import { adviseStays } from "@/features/stays/lib/adviseStays";
import { getStays } from "@/features/stays/lib/stays";
import { StayOption, StayPreferences, StayType } from "@/features/stays/types";
import { BudgetTier } from "@/domain/types";
import { getCity } from "@/domain/cities";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { fadeInUp, staggerChildren } from "@/components/motion";

type SortBy = "price-asc" | "price-desc" | "rating";
type TypeFilter = "any" | StayType;

const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: "Cheapest", value: "price-asc" },
  { label: "Priciest", value: "price-desc" },
  { label: "Top rated", value: "rating" },
];

const TYPE_FILTERS: { label: string; value: TypeFilter }[] = [
  { label: "All types", value: "any" },
  { label: "Hotels", value: "hotel" },
  { label: "Apartments", value: "apartment" },
  { label: "Hostels", value: "hostel" },
];

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

/** Round a €/night budget to the stepper's €10 grid. */
function roundBudget(value: number): number {
  return Math.min(600, Math.max(30, Math.round(value / 10) * 10));
}

const StayListRow = ({
  stay,
  nights,
  onReserve,
}: {
  stay: StayOption;
  nights: number;
  onReserve: (stay: StayOption) => void;
}) => {
  const total = (stay.pricePerNight + stay.cityTaxPerNight) * nights + stay.serviceFee;
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -2 }}
      className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 transition-all hover:shadow-lg"
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr_auto] lg:gap-6 items-center">
        <div className="flex items-center gap-3 min-w-0">
          <StayTypeAvatar type={stay.type} />
          <div className="min-w-0">
            <p className="font-semibold text-[var(--fg)] text-sm truncate">{stay.name}</p>
            <p className="text-xs text-[var(--muted)]">
              {stay.neighborhood} · {stay.walkToCenterMin} min to center
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
          <span className="font-semibold text-[var(--fg)]">{stay.rating.toFixed(1)}</span>
          <span className="text-xs text-[var(--muted)]">
            ({stay.reviewCount}) · {stay.praise[0]}
          </span>
        </div>

        <div className="flex items-center justify-between lg:flex-col lg:items-end gap-2 border-t border-[var(--border)] pt-4 lg:border-0 lg:pt-0">
          <div className="lg:text-right">
            <p className="text-2xl font-serif font-bold text-[var(--primary)] leading-none">
              €{stay.pricePerNight}
            </p>
            <p className="text-xs text-[var(--muted)] mt-1">
              /night · €{total} total incl. taxes
            </p>
          </div>
          <Button size="sm" onClick={() => onReserve(stay)}>
            Reserve
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

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
    initialCityId ? initialPrefs : null
  );
  const [reserving, setReserving] = useState<StayOption | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("price-asc");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("any");

  const advice = useMemo(() => (prefs ? adviseStays(prefs) : null), [prefs]);
  const allStays = useMemo(
    () => (prefs ? getStays(prefs.cityId) : null),
    [prefs]
  );

  const listResults = useMemo(() => {
    if (!allStays) return null;
    const filtered =
      typeFilter === "any" ? allStays : allStays.filter((s) => s.type === typeFilter);
    return [...filtered].sort((a, b) => {
      if (sortBy === "price-desc") return b.pricePerNight - a.pricePerNight;
      if (sortBy === "rating") return b.rating - a.rating;
      return a.pricePerNight - b.pricePerNight;
    });
  }, [allStays, typeFilter, sortBy]);

  const handleAdvise = (next: StayPreferences) => {
    setPrefs(next);
    setTypeFilter("any");
    setReserving(null);
  };

  const cityName = prefs ? getCity(prefs.cityId)?.name : "";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="pt-28 md:pt-32 pb-16 sm:pb-20">
        <Container size="wide">
          <PageHeader
            title="Find & book stays"
            description="Answer a few questions — get the neighborhoods and stays that fit the way you travel."
          />

          {/* Advisor form */}
          <div className="mb-12 sm:mb-16">
            <StayAdvisorForm initial={initialPrefs} onAdvise={handleAdvise} />
          </div>

          {advice && advice.picks.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Neighborhoods */}
              <div className="mb-10">
                <h2 className="text-h2 text-[var(--fg)] mb-1">
                  Neighborhoods for you
                </h2>
                <p className="text-small text-[var(--muted)] mb-6">
                  Where in {cityName} fits your style
                </p>
                <motion.div
                  key={`nb-${prefs?.cityId}`}
                  initial="hidden"
                  animate="visible"
                  variants={staggerChildren(0.08)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {advice.neighborhoods.map((pick) => (
                    <NeighborhoodCard key={pick.neighborhood.id} pick={pick} />
                  ))}
                </motion.div>
              </div>

              {/* Picks */}
              <div className="mb-12">
                <h2 className="text-h2 text-[var(--fg)] mb-1">Where we&apos;d stay</h2>
                <p className="text-small text-[var(--muted)] mb-6">
                  {prefs?.nights} {prefs?.nights === 1 ? "night" : "nights"} · up to €
                  {prefs?.budgetPerNight}/night · totals include taxes &amp; fees
                </p>
                <motion.div
                  key={`picks-${prefs?.cityId}-${prefs?.budgetPerNight}`}
                  initial="hidden"
                  animate="visible"
                  variants={staggerChildren(0.08)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {advice.picks.map((pick) => (
                    <StayPickCard
                      key={pick.stay.id}
                      pick={pick}
                      nights={prefs?.nights ?? 1}
                      onReserve={setReserving}
                    />
                  ))}
                </motion.div>
              </div>

              {/* Full inventory */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h3 className="text-h3 text-[var(--fg)]">
                  Every stay in {cityName}
                  <span className="ml-2 text-small font-normal text-[var(--muted)]">
                    {listResults?.length ?? 0} of {allStays?.length ?? 0}
                  </span>
                </h3>
                <div className="w-full lg:w-auto lg:min-w-[300px]">
                  <SegmentedControl options={SORT_OPTIONS} value={sortBy} onChange={setSortBy} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {TYPE_FILTERS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTypeFilter(option.value)}
                    className={`py-1.5 px-3 rounded-full text-xs font-medium transition-all ${
                      typeFilter === option.value
                        ? "bg-[var(--primary)] text-white shadow-sm"
                        : "bg-[var(--card-subtle)] text-[var(--fg)] hover:bg-[var(--border)]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {listResults && listResults.length > 0 ? (
                <motion.div
                  key={`list-${sortBy}-${typeFilter}`}
                  className="space-y-4"
                  initial="hidden"
                  animate="visible"
                  variants={staggerChildren(0.05)}
                >
                  {listResults.map((stay) => (
                    <StayListRow
                      key={stay.id}
                      stay={stay}
                      nights={prefs?.nights ?? 1}
                      onReserve={setReserving}
                    />
                  ))}
                </motion.div>
              ) : (
                <p className="text-center py-10 text-[var(--muted)]">
                  No stays of this type here — try another type.
                </p>
              )}
            </motion.div>
          )}

          {/* Empty state */}
          {!advice && (
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

      {reserving && prefs && (
        <ReservePanel
          stay={reserving}
          nights={prefs.nights}
          onClose={() => setReserving(null)}
        />
      )}
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
