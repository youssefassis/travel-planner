"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Button from "@/components/ui/Button";
import FilterPills from "@/components/ui/FilterPills";
import MotionCard from "@/components/ui/MotionCard";
import Price from "@/components/ui/Price";
import ResultsHeader from "@/components/ui/ResultsHeader";
import ResultsSection from "@/components/ui/ResultsSection";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { staggerChildren } from "@/components/motion";
import { getCity } from "@/domain/cities";
import { adviseStays } from "../lib/adviseStays";
import { getStays } from "../lib/stays";
import { StayOption, StayPreferences, StayType } from "../types";
import NeighborhoodCard from "./NeighborhoodCard";
import StayPickCard from "./StayPickCard";
import StayTypeAvatar from "./StayTypeAvatar";
import ReservePanel from "./ReservePanel";

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
    <MotionCard hover>
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
          <Star className="w-3.5 h-3.5 fill-[var(--rating)] text-[var(--rating)] shrink-0" />
          <span className="font-semibold text-[var(--fg)]">{stay.rating.toFixed(1)}</span>
          <span className="text-xs text-[var(--muted)]">
            ({stay.reviewCount}) · {stay.praise[0]}
          </span>
        </div>

        <div className="flex items-center justify-between lg:flex-col lg:items-end gap-2 border-t border-[var(--border)] pt-4 lg:border-0 lg:pt-0">
          <Price
            amount={`€${stay.pricePerNight}`}
            align="right"
            sub={`/night · €${total} total incl. taxes`}
          />
          <Button size="sm" onClick={() => onReserve(stay)}>
            Reserve
          </Button>
        </div>
      </div>
    </MotionCard>
  );
};

/**
 * The advisor results for one city: recommended neighborhoods, tailored stay
 * picks, and a collapsible full inventory with the reservation flow. Driven
 * purely by prefs, so the standalone stays page and the hub's Stays tab share it.
 */
export default function StayAdviceResults({ prefs }: { prefs: StayPreferences }) {
  const [reserving, setReserving] = useState<StayOption | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("price-asc");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("any");

  const advice = useMemo(() => adviseStays(prefs), [prefs]);
  const allStays = useMemo(() => getStays(prefs.cityId), [prefs]);

  const listResults = useMemo(() => {
    const filtered =
      typeFilter === "any" ? allStays : allStays.filter((s) => s.type === typeFilter);
    return [...filtered].sort((a, b) => {
      if (sortBy === "price-desc") return b.pricePerNight - a.pricePerNight;
      if (sortBy === "rating") return b.rating - a.rating;
      return a.pricePerNight - b.pricePerNight;
    });
  }, [allStays, typeFilter, sortBy]);

  const cityName = getCity(prefs.cityId)?.name ?? "";

  if (advice.picks.length === 0) {
    return (
      <p className="text-center py-10 text-[var(--muted)]">
        No stays found for {cityName || "this city"}.
      </p>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Neighborhoods */}
        <div className="mb-10">
          <ResultsHeader
            title="Neighborhoods for you"
            blurb={`Where in ${cityName} fits your style`}
          />
          <motion.div
            key={`nb-${prefs.cityId}`}
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
          <ResultsHeader
            title="Our picks"
            blurb={`${prefs.nights} ${prefs.nights === 1 ? "night" : "nights"} · up to €${prefs.budgetPerNight}/night · totals include taxes & fees`}
          />
          <motion.div
            key={`picks-${prefs.cityId}-${prefs.budgetPerNight}`}
            initial="hidden"
            animate="visible"
            variants={staggerChildren(0.08)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {advice.picks.map((pick) => (
              <StayPickCard
                key={pick.stay.id}
                pick={pick}
                nights={prefs.nights}
                onReserve={setReserving}
              />
            ))}
          </motion.div>
        </div>

        {/* Full inventory — collapsed so the picks stay the star */}
        <ResultsSection
          title={`All stays in ${cityName}`}
          count={listResults.length}
          total={allStays.length}
          toolbar={
            <>
              <SegmentedControl options={SORT_OPTIONS} value={sortBy} onChange={setSortBy} />
              <FilterPills
                ariaLabel="Filter by stay type"
                options={TYPE_FILTERS}
                value={typeFilter}
                onChange={setTypeFilter}
              />
            </>
          }
        >
          {listResults.length > 0 ? (
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
                  nights={prefs.nights}
                  onReserve={setReserving}
                />
              ))}
            </motion.div>
          ) : (
            <p className="text-center py-10 text-[var(--muted)]">
              No stays of this type here — try another type.
            </p>
          )}
        </ResultsSection>
      </motion.div>

      {reserving && (
        <ReservePanel
          stay={reserving}
          nights={prefs.nights}
          onClose={() => setReserving(null)}
        />
      )}
    </>
  );
}
