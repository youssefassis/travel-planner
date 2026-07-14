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

function formatDuration(durationHrs: number): string {
  const hours = Math.floor(durationHrs);
  const minutes = Math.round((durationHrs - hours) * 60);
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

function stopsLabel(stops: FlightOption["stops"]): string {
  return stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`;
}

const FlightCard = ({ flight, index }: { flight: FlightOption; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -4 }}
    className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 hover:shadow-lg transition-all"
  >
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
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
      <div className="flex flex-col items-end gap-3">
        <div>
          <p className="text-sm text-[var(--muted)] mb-1">Price per person</p>
          <p className="text-3xl font-serif font-bold text-[var(--primary)]">
            €{flight.price}
          </p>
        </div>
        <button className="btn btn-primary text-sm text-white">Book Now</button>
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
      <div className="pt-20 sm:pt-24 pb-16 sm:pb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[var(--fg)] mb-3 sm:mb-4">
              Find & Book Flights
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-[var(--muted)]">
              Explore the best flight options for your next adventure
            </p>
          </motion.div>

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
              <h2 className="text-2xl font-serif font-bold text-[var(--fg)] mb-6">
                Available Flights
              </h2>
              <div className="space-y-4">
                {searchResults.map((flight, idx) => (
                  <FlightCard key={flight.id} flight={flight} index={idx} />
                ))}
              </div>
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
        </div>
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
