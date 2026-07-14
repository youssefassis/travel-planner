"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import FlightSearch, {
  FlightSearchFormData,
} from "@/features/flights/components/FlightSearch";
import FlightCard from "@/features/flights/components/FlightCard";
import RecommendationCard from "@/features/flights/components/RecommendationCard";
import BookingPanel from "@/features/flights/components/BookingPanel";
import { searchFlights } from "@/features/flights/lib/searchFlights";
import { recommendFlights } from "@/features/flights/lib/recommendFlights";
import {
  TimeOfDay,
  departureMinutes,
  matchesTimeOfDay,
} from "@/features/flights/lib/format";
import { FlightOption } from "@/features/flights/types";
import { getCity } from "@/domain/cities";
import Container from "@/components/ui/Container";
import FilterPills from "@/components/ui/FilterPills";
import PageHeader from "@/components/ui/PageHeader";
import PlannerCallout from "@/components/ui/PlannerCallout";
import ResultsSection from "@/components/ui/ResultsSection";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { staggerChildren } from "@/components/motion";

type SortBy = "price" | "duration" | "departure";

const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: "Cheapest", value: "price" },
  { label: "Fastest", value: "duration" },
  { label: "Earliest", value: "departure" },
];

const TIME_OPTIONS: { label: string; value: TimeOfDay }[] = [
  { label: "Any time", value: "any" },
  { label: "Morning", value: "morning" },
  { label: "Afternoon", value: "afternoon" },
  { label: "Evening", value: "evening" },
];

function validCityId(id: string | null): string {
  return id && getCity(id) ? id : "";
}

function formatDateLabel(dateISO: string): string {
  if (!dateISO) return "flexible dates";
  const date = new Date(`${dateISO}T12:00:00`);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function FlightsPageContent() {
  const searchParams = useSearchParams();
  const initialFrom = validCityId(searchParams.get("from"));
  const initialTo = validCityId(searchParams.get("to"));

  const [search, setSearch] = useState<FlightSearchFormData | null>(() =>
    initialFrom && initialTo && initialFrom !== initialTo
      ? {
          fromCityId: initialFrom,
          toCityId: initialTo,
          travelers: 1,
          stops: "any",
          tripType: "oneway",
          departDate: "",
          returnDate: "",
        }
      : null
  );
  const [selectedOutbound, setSelectedOutbound] = useState<FlightOption | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<FlightOption | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const [sortBy, setSortBy] = useState<SortBy>("price");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("any");
  const [airline, setAirline] = useState<string>("all");

  const handleSearch = (data: FlightSearchFormData) => {
    setSearch(data);
    setSelectedOutbound(null);
    setSelectedReturn(null);
    setBookingOpen(false);
    setTimeOfDay("any");
    setAirline("all");
  };

  // Which leg is the user currently choosing?
  const phase: "outbound" | "return" =
    search?.tripType === "round" && selectedOutbound ? "return" : "outbound";

  const phaseOptions = useMemo(() => {
    if (!search) return null;
    const raw =
      phase === "outbound"
        ? searchFlights(search.fromCityId, search.toCityId, search.departDate)
        : searchFlights(search.toCityId, search.fromCityId, search.returnDate);
    return search.stops === "direct" ? raw.filter((f) => f.stops === 0) : raw;
  }, [search, phase]);

  const picks = useMemo(
    () => (phaseOptions ? recommendFlights(phaseOptions) : []),
    [phaseOptions]
  );

  const airlines = useMemo(
    () => (phaseOptions ? [...new Set(phaseOptions.map((f) => f.airline))].sort() : []),
    [phaseOptions]
  );

  const listResults = useMemo(() => {
    if (!phaseOptions) return null;
    const filtered = phaseOptions.filter(
      (f) =>
        matchesTimeOfDay(f.departureTime, timeOfDay) &&
        (airline === "all" || f.airline === airline)
    );
    return [...filtered].sort((a, b) => {
      if (sortBy === "duration") return a.durationHrs - b.durationHrs;
      if (sortBy === "departure")
        return departureMinutes(a.departureTime) - departureMinutes(b.departureTime);
      return a.price - b.price;
    });
  }, [phaseOptions, timeOfDay, airline, sortBy]);

  const cheapestId = phaseOptions?.length
    ? phaseOptions.reduce((a, b) => (a.price <= b.price ? a : b)).id
    : null;
  const fastestId = phaseOptions?.length
    ? phaseOptions.reduce((a, b) => (a.durationHrs <= b.durationHrs ? a : b)).id
    : null;

  const selectFlight = (flight: FlightOption) => {
    if (phase === "outbound") {
      setSelectedOutbound(flight);
      if (search?.tripType !== "round") setBookingOpen(true);
    } else {
      setSelectedReturn(flight);
      setBookingOpen(true);
    }
    setTimeOfDay("any");
    setAirline("all");
  };

  const changeOutbound = () => {
    setSelectedOutbound(null);
    setSelectedReturn(null);
    setBookingOpen(false);
  };

  const phaseHeading = search
    ? phase === "outbound"
      ? `${getCity(search.fromCityId)?.name} → ${getCity(search.toCityId)?.name} · ${formatDateLabel(search.departDate)}`
      : `${getCity(search.toCityId)?.name} → ${getCity(search.fromCityId)?.name} · ${formatDateLabel(search.returnDate)}`
    : "";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="pt-28 md:pt-32 pb-16 sm:pb-20">
        <Container size="wide">
          <PageHeader
            title="Find flights"
            description="Our picks with the trade-offs explained — decide, don't dig."
          />

          <PlannerCallout
            variant={initialFrom && initialTo ? "linked" : "standalone"}
          />

          {/* Search Form */}
          <div className="mb-12 sm:mb-16">
            <FlightSearch
              initialFromCityId={initialFrom}
              initialToCityId={initialTo}
              onSearch={handleSearch}
            />
          </div>

          {/* Selected outbound summary (round trips) */}
          {search?.tripType === "round" && selectedOutbound && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center justify-between gap-3 mb-8 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]"
            >
              <p className="text-sm text-[var(--fg)]">
                <span className="text-caption text-[var(--muted)] mr-2">Outbound</span>
                {selectedOutbound.from} → {selectedOutbound.to} ·{" "}
                {selectedOutbound.departureTime} · {selectedOutbound.airline} · €
                {selectedOutbound.price}
              </p>
              <button
                type="button"
                onClick={changeOutbound}
                className="flex items-center gap-1.5 text-sm text-[var(--primary)] hover:underline underline-offset-2"
              >
                <Pencil className="w-3.5 h-3.5" />
                Change
              </button>
            </motion.div>
          )}

          {/* Results */}
          {phaseOptions && phaseOptions.length > 0 && (
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Top picks */}
              <div className="mb-10">
                <h2 className="text-h2 text-[var(--fg)] mb-1">
                  {phase === "outbound" ? "Our picks" : "Return picks"}
                </h2>
                <p className="text-small text-[var(--muted)] mb-6">{phaseHeading}</p>
                <motion.div
                  key={`picks-${phase}`}
                  initial="hidden"
                  animate="visible"
                  variants={staggerChildren(0.07)}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                >
                  {picks.map((pick) => (
                    <RecommendationCard
                      key={pick.flight.id}
                      pick={pick}
                      travelers={search?.travelers ?? 1}
                      onSelect={selectFlight}
                    />
                  ))}
                </motion.div>
              </div>

              {/* Full inventory — collapsed so the picks stay the star */}
              <ResultsSection
                title="All flights"
                count={listResults?.length ?? 0}
                total={phaseOptions.length}
                toolbar={
                  <>
                    <SegmentedControl
                      options={SORT_OPTIONS}
                      value={sortBy}
                      onChange={setSortBy}
                    />
                    <SegmentedControl
                      size="sm"
                      options={TIME_OPTIONS}
                      value={timeOfDay}
                      onChange={setTimeOfDay}
                      className="w-full sm:w-auto"
                    />
                    <FilterPills
                      ariaLabel="Filter by airline"
                      options={[
                        { label: "All airlines", value: "all" },
                        ...airlines.map((name) => ({ label: name, value: name })),
                      ]}
                      value={airline}
                      onChange={setAirline}
                    />
                  </>
                }
              >
                {listResults && listResults.length > 0 ? (
                  <motion.div
                    key={`list-${phase}-${sortBy}-${timeOfDay}-${airline}`}
                    className="space-y-4"
                    initial="hidden"
                    animate="visible"
                    variants={staggerChildren(0.05)}
                  >
                    {listResults.map((flight) => {
                      const badges = [
                        flight.id === cheapestId ? "Cheapest" : null,
                        flight.id === fastestId ? "Fastest" : null,
                      ].filter((b): b is string => b !== null);
                      return (
                        <FlightCard
                          key={flight.id}
                          flight={flight}
                          travelers={search?.travelers ?? 1}
                          badges={badges}
                          selected={
                            flight.id === selectedOutbound?.id ||
                            flight.id === selectedReturn?.id
                          }
                          onSelect={selectFlight}
                        />
                      );
                    })}
                  </motion.div>
                ) : (
                  <p className="text-center py-10 text-[var(--muted)]">
                    No flights match these filters — loosen the time or airline filter.
                  </p>
                )}
              </ResultsSection>
            </motion.div>
          )}

          {/* No results at all */}
          {phaseOptions && phaseOptions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-[var(--muted)] text-lg">
                {search?.stops === "direct"
                  ? "No direct flights on this route — try allowing stops."
                  : "No flights found for this route. Try different cities."}
              </p>
            </motion.div>
          )}

          {/* Empty State */}
          {!phaseOptions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-[var(--muted)] text-lg">
                Enter your flight details above to see tailored recommendations
              </p>
            </motion.div>
          )}
        </Container>
      </div>

      {/* Booking review */}
      {bookingOpen && selectedOutbound && (
        <BookingPanel
          outbound={selectedOutbound}
          inbound={search?.tripType === "round" ? selectedReturn : null}
          travelers={search?.travelers ?? 1}
          onClose={() => {
            setBookingOpen(false);
            setSelectedOutbound(null);
            setSelectedReturn(null);
          }}
        />
      )}
    </div>
  );
}

export default function FlightsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <FlightsPageContent />
    </Suspense>
  );
}
