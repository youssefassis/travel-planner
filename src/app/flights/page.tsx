"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import FlightSearch, {
  FlightSearchFormData,
} from "@/features/flights/components/FlightSearch";
import { searchFlights } from "@/features/flights/lib/searchFlights";
import { FlightOption } from "@/features/flights/types";
import { getCity } from "@/domain/cities";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { fadeInUp, staggerChildren } from "@/components/motion";

function formatDuration(durationHrs: number): string {
  const hours = Math.floor(durationHrs);
  const minutes = Math.round((durationHrs - hours) * 60);
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

function stopsLabel(stops: FlightOption["stops"]): string {
  return stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`;
}

const FlightCard = ({ flight }: { flight: FlightOption }) => (
  <motion.div
    variants={fadeInUp}
    whileHover={{ y: -2 }}
    className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 hover:shadow-lg transition-all"
  >
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-[1.2fr_1.6fr_1fr_auto] lg:gap-6 items-center">
      {/* Airline & Duration */}
      <div>
        <p className="text-sm text-[var(--muted)] mb-2">Airline</p>
        <p className="font-semibold text-[var(--fg)]">{flight.airline}</p>
        <p className="text-xs text-[var(--muted)] mt-2">
          {formatDuration(flight.durationHrs)}
        </p>
      </div>

      {/* Time */}
      <div>
        <p className="text-sm text-[var(--muted)] mb-2">Departure → Arrival</p>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold text-[var(--fg)]">{flight.departureTime}</p>
            <p className="text-xs text-[var(--muted)]">Depart</p>
          </div>
          <div className="text-[var(--muted)]">→</div>
          <div>
            <p className="font-semibold text-[var(--fg)]">{flight.arrivalTime}</p>
            <p className="text-xs text-[var(--muted)]">Arrive</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div>
        <p className="text-sm text-[var(--muted)] mb-2">Details</p>
        <p className="font-medium text-[var(--fg)] text-sm">{stopsLabel(flight.stops)}</p>
        <p className="text-xs text-[var(--muted)] mt-1">
          {flight.from} → {flight.to}
        </p>
      </div>

      {/* Price & Button */}
      <div className="col-span-2 lg:col-span-1 flex items-center justify-between lg:flex-col lg:items-end gap-3 border-t border-[var(--border)] pt-4 lg:border-0 lg:pt-0">
        <div>
          <p className="text-sm text-[var(--muted)] mb-1">Price per person</p>
          <p className="text-3xl font-serif font-bold text-[var(--primary)]">
            €{flight.price}
          </p>
        </div>
        <Button size="md">Book Now</Button>
      </div>
    </div>
  </motion.div>
);

function validCityId(id: string | null): string {
  return id && getCity(id) ? id : "";
}

function FlightsPageContent() {
  const searchParams = useSearchParams();
  const initialFrom = validCityId(searchParams.get("from"));
  const initialTo = validCityId(searchParams.get("to"));

  const [searchResults, setSearchResults] = useState<FlightOption[] | null>(() =>
    initialFrom && initialTo && initialFrom !== initialTo
      ? searchFlights(initialFrom, initialTo)
      : null
  );

  const handleSearch = ({ fromCityId, toCityId }: FlightSearchFormData) => {
    setSearchResults(searchFlights(fromCityId, toCityId));
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="pt-28 md:pt-32 pb-16 sm:pb-20">
        <Container size="wide">
          {/* Header Section */}
          <PageHeader
            title="Find & book flights"
            description="Explore the best flight options for your next adventure"
          />

          {/* Search Form */}
          <div className="mb-12 sm:mb-16">
            <FlightSearch
              initialFromCityId={initialFrom}
              initialToCityId={initialTo}
              onSearch={handleSearch}
            />
          </div>

          {/* Results */}
          {searchResults && searchResults.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-h2 text-[var(--fg)] mb-6">Available Flights</h2>
              <motion.div
                className="space-y-4"
                initial="hidden"
                animate="visible"
                variants={staggerChildren(0.06)}
              >
                {searchResults.map((flight) => (
                  <FlightCard key={flight.id} flight={flight} />
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* No results */}
          {searchResults && searchResults.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-[var(--muted)] text-lg">
                No flights found for this route. Try different cities.
              </p>
            </motion.div>
          )}

          {/* Empty State */}
          {!searchResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-[var(--muted)] text-lg">
                Enter your flight details above to see available options
              </p>
            </motion.div>
          )}
        </Container>
      </div>
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
