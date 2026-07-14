"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import FlightSearch, {
  FlightSearchFormData,
} from "@/features/flights/components/FlightSearch";

const mockFlights = [
  {
    id: "1",
    airline: "SkyWings",
    departure: "08:00 AM",
    arrival: "02:30 PM",
    duration: "6h 30m",
    stops: "Direct",
    price: 450,
    baggage: "2 bags included",
  },
  {
    id: "2",
    airline: "AirGlobal",
    departure: "10:15 AM",
    arrival: "05:45 PM",
    duration: "7h 30m",
    stops: "1 stop",
    price: 380,
    baggage: "1 bag included",
  },
  {
    id: "3",
    airline: "JetStream",
    departure: "01:30 PM",
    arrival: "08:00 PM",
    duration: "6h 30m",
    stops: "Direct",
    price: 520,
    baggage: "2 bags + lounge",
  },
  {
    id: "4",
    airline: "VoyageAir",
    departure: "04:00 PM",
    arrival: "10:15 PM",
    duration: "6h 15m",
    stops: "Direct",
    price: 490,
    baggage: "2 bags included",
  },
];

const FlightCard = ({
  flight,
  index,
}: {
  flight: (typeof mockFlights)[0];
  index: number;
}) => (
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
        <p className="text-xs text-[var(--muted)] mt-2">{flight.duration}</p>
      </div>

      {/* Time */}
      <div>
        <p className="text-sm text-[var(--muted)] mb-2">Departure → Arrival</p>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold text-[var(--fg)]">{flight.departure}</p>
            <p className="text-xs text-[var(--muted)]">Depart</p>
          </div>
          <div className="text-[var(--muted)]">→</div>
          <div>
            <p className="font-semibold text-[var(--fg)]">{flight.arrival}</p>
            <p className="text-xs text-[var(--muted)]">Arrive</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div>
        <p className="text-sm text-[var(--muted)] mb-2">Details</p>
        <p className="font-medium text-[var(--fg)] text-sm">{flight.stops}</p>
        <p className="text-xs text-[var(--muted)] mt-1">{flight.baggage}</p>
      </div>

      {/* Price & Button */}
      <div className="flex flex-col items-end gap-3">
        <div>
          <p className="text-sm text-[var(--muted)] mb-1">Price per person</p>
          <p className="text-3xl font-serif font-bold text-[var(--primary)]">
            ${flight.price}
          </p>
        </div>
        <button className="btn btn-primary text-sm text-white">Book Now</button>
      </div>
    </div>
  </motion.div>
);

export default function FlightsPage() {
  const [searchResults, setSearchResults] = useState<typeof mockFlights | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (data: FlightSearchFormData) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSearchResults(mockFlights);
    setIsLoading(false);
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
            <FlightSearch onSearch={handleSearch} isLoading={isLoading} />
          </div>

          {/* Results */}
          {searchResults && (
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

          {/* Empty State */}
          {!searchResults && !isLoading && (
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
