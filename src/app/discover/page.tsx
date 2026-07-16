"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Shuffle } from "lucide-react";
import { City } from "@/domain/types";
import { filterCities, pickDestination } from "@/features/discover/lib/pickDestination";
import { DEFAULT_FILTERS, DiscoverFilters } from "@/features/discover/types";
import GlobeSpinner from "@/features/discover/components/GlobeSpinner";
import FilterBar from "@/features/discover/components/FilterBar";
import DestinationReveal from "@/features/discover/components/DestinationReveal";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import PlannerCallout from "@/components/ui/PlannerCallout";
import { fadeInUp } from "@/components/motion";

export default function DiscoverPage() {
  const [filters, setFilters] = useState<DiscoverFilters>(DEFAULT_FILTERS);
  const [spinToken, setSpinToken] = useState(0);
  const [winner, setWinner] = useState<City | null>(null);
  const [revealed, setRevealed] = useState<City | null>(null);
  const [spinning, setSpinning] = useState(false);

  const pool = useMemo(() => filterCities(filters), [filters]);
  const empty = pool.length === 0;

  const handleSpin = () => {
    const pick = pickDestination(pool);
    if (!pick) return;
    setRevealed(null);
    setWinner(pick);
    setSpinning(true);
    setSpinToken((t) => t + 1);
  };

  const handleLanded = (city: City) => {
    setRevealed(city);
    setSpinning(false);
  };

  const spinLabel = spinning
    ? "Spinning…"
    : spinToken === 0
      ? "Spin the globe"
      : "Spin again";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="pt-28 md:pt-32 pb-16 sm:pb-20">
        <Container size="wide">
          <PageHeader
            title="Spin for a destination"
            description="Can't decide where to go? Set a mood, give the globe a spin, and let Europe choose for you."
          />

          <PlannerCallout variant="standalone" />

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-6 lg:gap-8 items-start">
            <div className="space-y-4">
              <GlobeSpinner
                pool={pool}
                spinToken={spinToken}
                winner={winner}
                onLanded={handleLanded}
              />
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleSpin}
                  disabled={empty || spinning}
                  icon={<Shuffle className="w-4 h-4" />}
                  iconPosition="left"
                >
                  {spinLabel}
                </Button>
              </div>
              {empty && (
                <p className="text-center text-small text-[var(--muted)]">
                  Nothing matches those filters — loosen them to fill the globe.
                </p>
              )}
            </div>

            <div className="space-y-6">
              <FilterBar filters={filters} onChange={setFilters} poolSize={pool.length} />

              <AnimatePresence mode="wait">
                {revealed ? (
                  <DestinationReveal key={revealed.id} city={revealed} />
                ) : (
                  <motion.p
                    key="hint"
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    className="text-center text-[var(--muted)] py-8"
                  >
                    {spinning
                      ? "Rounding the globe…"
                      : "Your destination will appear here once the globe lands."}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
