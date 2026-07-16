"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import FilterPills from "@/components/ui/FilterPills";
import ResultsHeader from "@/components/ui/ResultsHeader";
import ResultsSection from "@/components/ui/ResultsSection";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { staggerChildren } from "@/components/motion";
import { getCity } from "@/domain/cities";
import { FlightSearchFormData } from "./FlightSearch";
import FlightCard from "./FlightCard";
import RecommendationCard from "./RecommendationCard";
import BookingPanel from "./BookingPanel";
import { searchFlights } from "../lib/searchFlights";
import { recommendFlights } from "../lib/recommendFlights";
import { TimeOfDay, departureMinutes, matchesTimeOfDay } from "../lib/format";
import { FlightOption } from "../types";

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

function formatDateLabel(dateISO: string): string {
  if (!dateISO) return "flexible dates";
  const date = new Date(`${dateISO}T12:00:00`);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

type Props = {
  /** The route + party to price. One-way legs pass tripType "oneway". */
  search: FlightSearchFormData;
  /** Overrides the "Our picks" subtitle (e.g. the hub's plan estimate). */
  heading?: string;
};

/**
 * The results half of a flight search: tailored picks, a collapsible full
 * inventory with sort/time/airline filters, and the booking flow. Handles
 * round trips as an outbound→return phase flow. Route-agnostic, so both the
 * standalone flights page and the trip hub's per-leg tab reuse it.
 */
export default function FlightLegResults({ search, heading }: Props) {
  const [selectedOutbound, setSelectedOutbound] = useState<FlightOption | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<FlightOption | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const [sortBy, setSortBy] = useState<SortBy>("price");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("any");
  const [airline, setAirline] = useState<string>("all");

  // Which leg is the user currently choosing?
  const phase: "outbound" | "return" =
    search.tripType === "round" && selectedOutbound ? "return" : "outbound";

  const phaseOptions = useMemo(() => {
    const raw =
      phase === "outbound"
        ? searchFlights(search.fromCityId, search.toCityId, search.departDate)
        : searchFlights(search.toCityId, search.fromCityId, search.returnDate);
    return search.stops === "direct" ? raw.filter((f) => f.stops === 0) : raw;
  }, [search, phase]);

  const picks = useMemo(() => recommendFlights(phaseOptions), [phaseOptions]);

  const airlines = useMemo(
    () => [...new Set(phaseOptions.map((f) => f.airline))].sort(),
    [phaseOptions],
  );

  const listResults = useMemo(() => {
    const filtered = phaseOptions.filter(
      (f) =>
        matchesTimeOfDay(f.departureTime, timeOfDay) &&
        (airline === "all" || f.airline === airline),
    );
    return [...filtered].sort((a, b) => {
      if (sortBy === "duration") return a.durationHrs - b.durationHrs;
      if (sortBy === "departure")
        return departureMinutes(a.departureTime) - departureMinutes(b.departureTime);
      return a.price - b.price;
    });
  }, [phaseOptions, timeOfDay, airline, sortBy]);

  const cheapestId = phaseOptions.length
    ? phaseOptions.reduce((a, b) => (a.price <= b.price ? a : b)).id
    : null;
  const fastestId = phaseOptions.length
    ? phaseOptions.reduce((a, b) => (a.durationHrs <= b.durationHrs ? a : b)).id
    : null;

  const selectFlight = (flight: FlightOption) => {
    if (phase === "outbound") {
      setSelectedOutbound(flight);
      if (search.tripType !== "round") setBookingOpen(true);
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

  const defaultHeading =
    phase === "outbound"
      ? `${getCity(search.fromCityId)?.name} → ${getCity(search.toCityId)?.name} · ${formatDateLabel(search.departDate)}`
      : `${getCity(search.toCityId)?.name} → ${getCity(search.fromCityId)?.name} · ${formatDateLabel(search.returnDate)}`;

  return (
    <>
      {/* Selected outbound summary (round trips) */}
      {search.tripType === "round" && selectedOutbound && (
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

      {phaseOptions.length > 0 && (
        <motion.div key={phase} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Top picks */}
          <div className="mb-10">
            <ResultsHeader
              title={phase === "outbound" ? "Our picks" : "Return picks"}
              blurb={phase === "outbound" ? (heading ?? defaultHeading) : defaultHeading}
            />
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
                  travelers={search.travelers}
                  onSelect={selectFlight}
                />
              ))}
            </motion.div>
          </div>

          {/* Full inventory — collapsed so the picks stay the star */}
          <ResultsSection
            title="All flights"
            count={listResults.length}
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
            {listResults.length > 0 ? (
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
                      travelers={search.travelers}
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

      {phaseOptions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <p className="text-[var(--muted)] text-lg">
            {search.stops === "direct"
              ? "No direct flights on this route — try allowing stops."
              : "No flights found for this route. Try different cities."}
          </p>
        </motion.div>
      )}

      {/* Booking review */}
      {bookingOpen && selectedOutbound && (
        <BookingPanel
          outbound={selectedOutbound}
          inbound={search.tripType === "round" ? selectedReturn : null}
          travelers={search.travelers}
          onClose={() => {
            setBookingOpen(false);
            setSelectedOutbound(null);
            setSelectedReturn(null);
          }}
        />
      )}
    </>
  );
}
