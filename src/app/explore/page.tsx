"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Shuffle } from "lucide-react";

import { City } from "@/domain/types";
import { getCity } from "@/domain/cities";
import { filterCities, pickDestination } from "@/features/discover/lib/pickDestination";
import { DEFAULT_FILTERS, DiscoverFilters } from "@/features/discover/types";
import GlobeSpinner from "@/features/discover/components/GlobeSpinner";
import FilterBar from "@/features/discover/components/FilterBar";
import DestinationReveal from "@/features/discover/components/DestinationReveal";

import WeatherSearchForm from "@/features/weather/components/WeatherSearchForm";
import WeatherMatchCard from "@/features/weather/components/WeatherMatchCard";
import CityClimateReport from "@/features/weather/components/CityClimateReport";
import { suggestTrips } from "@/features/weather/lib/suggestTrips";
import { rateCityMonths } from "@/features/weather/lib/bestTime";
import {
  MONTH_FULL,
  WarmthTarget,
  WeatherPrefs,
  WeatherQuery,
} from "@/features/weather/types";

import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import ResultsHeader from "@/components/ui/ResultsHeader";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { fadeInUp, staggerChildren } from "@/components/motion";

type Panel = "spin" | "weather";

const PANEL_OPTIONS: { label: string; value: Panel }[] = [
  { label: "Spin the globe", value: "spin" },
  { label: "Match the weather", value: "weather" },
];

const DEFAULT_PREFS: WeatherPrefs = {
  warmth: "any",
  dry: false,
  sunny: false,
  monthIndex: null,
};

function parseWarmth(value: string | null): WarmthTarget {
  return value === "warm" || value === "mild" || value === "cool" ? value : "any";
}

function parseMonth(value: string | null): number | null {
  const parsed = value === null ? NaN : parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 11 ? parsed : null;
}

const isOn = (value: string | null): boolean => value === "1" || value === "true";

function conditionsHeading(prefs: WeatherPrefs): string {
  const warmthWord = prefs.warmth === "any" ? "great" : prefs.warmth;
  const parts = [warmthWord, prefs.dry && "dry", prefs.sunny && "sunny"].filter(
    Boolean,
  ) as string[];
  const when = prefs.monthIndex !== null ? ` in ${MONTH_FULL[prefs.monthIndex]}` : "";
  return `Where to go for ${parts.join(", ")} weather${when}`;
}

/** Read deep-link params (from /weather redirects) into an initial state. */
function readInitial(params: URLSearchParams): {
  panel: Panel;
  prefs: WeatherPrefs;
  search: WeatherQuery;
} {
  const cityParam = params.get("city");
  if (cityParam && getCity(cityParam)) {
    return {
      panel: "weather",
      prefs: DEFAULT_PREFS,
      search: { mode: "city", cityId: cityParam },
    };
  }
  const hasWeatherParams =
    params.has("warmth") || params.has("dry") || params.has("sunny") || params.has("month");
  const prefs: WeatherPrefs = {
    warmth: parseWarmth(params.get("warmth")),
    dry: isOn(params.get("dry")),
    sunny: isOn(params.get("sunny")),
    monthIndex: parseMonth(params.get("month")),
  };
  return {
    panel: hasWeatherParams ? "weather" : "spin",
    prefs,
    search: { mode: "conditions", prefs },
  };
}

function ExplorePageContent() {
  const searchParams = useSearchParams();
  const initial = useMemo(
    () => readInitial(searchParams),
    // Params are read once on mount, mirroring the other route pages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [panel, setPanel] = useState<Panel>(initial.panel);

  /* ── Spin the globe ──────────────────────────────────────────── */
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

  const spinLabel = spinning
    ? "Spinning…"
    : spinToken === 0
      ? "Spin the globe"
      : "Spin again";

  /* ── Match the weather ───────────────────────────────────────── */
  const [weatherInitCity, setWeatherInitCity] = useState(
    initial.search.mode === "city" ? initial.search.cityId : "",
  );
  const [formKey, setFormKey] = useState(0);
  const [search, setSearch] = useState<WeatherQuery>(initial.search);
  const resultsRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(
    () => (search.mode === "conditions" ? suggestTrips(search.prefs) : null),
    [search],
  );
  const report = useMemo(
    () => (search.mode === "city" ? rateCityMonths(search.cityId) : null),
    [search],
  );

  const handleSeeMonths = (cityId: string) => {
    setPanel("weather");
    setWeatherInitCity(cityId);
    setFormKey((k) => k + 1);
    setSearch({ mode: "city", cityId });
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="pt-28 md:pt-32 pb-16 sm:pb-20">
        <Container size="wide">
          <PageHeader
            title="Where to next?"
            description="Not sure yet? Spin the globe for a surprise, or chase the weather you want — then turn it into a full trip."
          />

          <div className="mb-10 max-w-md">
            <SegmentedControl options={PANEL_OPTIONS} value={panel} onChange={setPanel} />
          </div>

          {panel === "spin" ? (
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-6 lg:gap-8 items-start">
              <div className="space-y-4">
                <GlobeSpinner
                  pool={pool}
                  spinToken={spinToken}
                  winner={winner}
                  onLanded={(city) => {
                    setRevealed(city);
                    setSpinning(false);
                  }}
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
                    <DestinationReveal
                      key={revealed.id}
                      city={revealed}
                      onSeeMonths={handleSeeMonths}
                    />
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
          ) : (
            <>
              <div className="mb-12 sm:mb-16">
                <WeatherSearchForm
                  key={formKey}
                  lockedMode="conditions"
                  initialMode="conditions"
                  initialPrefs={initial.prefs}
                  initialCityId={weatherInitCity}
                  onSearch={setSearch}
                />
              </div>

              <div ref={resultsRef} className="scroll-mt-28">
                {search.mode === "conditions" && matches && matches.length > 0 && (
                  <>
                    <ResultsHeader
                      title={conditionsHeading(search.prefs)}
                      blurb="Ranked by how well each destination's climate fits."
                    />
                    <motion.div
                      key={JSON.stringify(search.prefs)}
                      initial="hidden"
                      animate="visible"
                      variants={staggerChildren(0.06)}
                      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                    >
                      {matches.map((match) => (
                        <WeatherMatchCard
                          key={match.city.id}
                          match={match}
                          onSeeMonths={handleSeeMonths}
                        />
                      ))}
                    </motion.div>
                  </>
                )}

                {search.mode === "city" &&
                  (report ? (
                    <CityClimateReport report={report} />
                  ) : (
                    <p className="text-center py-16 text-[var(--muted)]">
                      No climate data for this city yet — try another.
                    </p>
                  ))}
              </div>
            </>
          )}
        </Container>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <ExplorePageContent />
    </Suspense>
  );
}
