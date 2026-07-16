"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import WeatherSearchForm from "@/features/weather/components/WeatherSearchForm";
import WeatherMatchCard from "@/features/weather/components/WeatherMatchCard";
import CityClimateReport from "@/features/weather/components/CityClimateReport";
import { suggestTrips } from "@/features/weather/lib/suggestTrips";
import { rateCityMonths } from "@/features/weather/lib/bestTime";
import {
  MONTH_FULL,
  WarmthTarget,
  WeatherMode,
  WeatherPrefs,
  WeatherQuery,
} from "@/features/weather/types";
import { getCity } from "@/domain/cities";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import PlannerCallout from "@/components/ui/PlannerCallout";
import { staggerChildren } from "@/components/motion";

const DEFAULT_PREFS: WeatherPrefs = {
  warmth: "any",
  dry: false,
  sunny: false,
  monthIndex: null,
};

type FormInit = { mode: WeatherMode; prefs: WeatherPrefs; cityId: string };

function parseWarmth(value: string | null): WarmthTarget {
  return value === "warm" || value === "mild" || value === "cool" ? value : "any";
}

function parseMonth(value: string | null): number | null {
  const parsed = value === null ? NaN : parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 11 ? parsed : null;
}

const isOn = (value: string | null): boolean => value === "1" || value === "true";

/** Read the deep-link params into an initial form state + first search. */
function readParams(params: URLSearchParams): { init: FormInit; search: WeatherQuery } {
  const cityParam = params.get("city");
  if (cityParam && getCity(cityParam)) {
    return {
      init: { mode: "city", prefs: DEFAULT_PREFS, cityId: cityParam },
      search: { mode: "city", cityId: cityParam },
    };
  }
  const prefs: WeatherPrefs = {
    warmth: parseWarmth(params.get("warmth")),
    dry: isOn(params.get("dry")),
    sunny: isOn(params.get("sunny")),
    monthIndex: parseMonth(params.get("month")),
  };
  return {
    init: { mode: "conditions", prefs, cityId: "" },
    search: { mode: "conditions", prefs },
  };
}

function conditionsHeading(prefs: WeatherPrefs): string {
  const warmthWord =
    prefs.warmth === "any" ? "great" : prefs.warmth;
  const parts = [warmthWord, prefs.dry && "dry", prefs.sunny && "sunny"].filter(
    Boolean
  ) as string[];
  const when = prefs.monthIndex !== null ? ` in ${MONTH_FULL[prefs.monthIndex]}` : "";
  return `Where to go for ${parts.join(", ")} weather${when}`;
}

function WeatherPageContent() {
  const searchParams = useSearchParams();
  const cameFromPlan = Boolean(searchParams.get("city"));
  const { init, search: firstSearch } = useMemo(
    () => readParams(searchParams),
    // Params are read once on mount, mirroring the flights/stays pages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [formInit, setFormInit] = useState<FormInit>(init);
  const [formKey, setFormKey] = useState(0);
  const [search, setSearch] = useState<WeatherQuery>(firstSearch);
  const resultsRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(
    () => (search.mode === "conditions" ? suggestTrips(search.prefs) : null),
    [search]
  );
  const report = useMemo(
    () => (search.mode === "city" ? rateCityMonths(search.cityId) : null),
    [search]
  );

  const handleSearch = (query: WeatherQuery) => setSearch(query);

  const handleSeeMonths = (cityId: string) => {
    setFormInit({ mode: "city", prefs: DEFAULT_PREFS, cityId });
    setFormKey((k) => k + 1);
    setSearch({ mode: "city", cityId });
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="pt-28 md:pt-32 pb-16 sm:pb-20">
        <Container size="wide">
          <PageHeader
            title="Trips by weather"
            description="Chase the conditions you want — or find the best time to visit a city."
          />

          <PlannerCallout variant={cameFromPlan ? "linked" : "standalone"} />

          <div className="mb-12 sm:mb-16">
            <WeatherSearchForm
              key={formKey}
              initialMode={formInit.mode}
              initialPrefs={formInit.prefs}
              initialCityId={formInit.cityId}
              onSearch={handleSearch}
            />
          </div>

          <div ref={resultsRef} className="scroll-mt-28">
            {search.mode === "conditions" && matches && matches.length > 0 && (
              <>
                <h2 className="text-h2 text-[var(--fg)] mb-1">
                  {conditionsHeading(search.prefs)}
                </h2>
                <p className="text-small text-[var(--muted)] mb-6">
                  Ranked by how well each destination&apos;s climate fits.
                </p>
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
        </Container>
      </div>
    </div>
  );
}

export default function WeatherPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <WeatherPageContent />
    </Suspense>
  );
}
