"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CITIES } from "@/domain/cities";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { fadeInUp } from "@/components/motion";

export type FlightSearchFormData = {
  fromCityId: string;
  toCityId: string;
};

type Props = {
  initialFromCityId?: string;
  initialToCityId?: string;
  onSearch: (data: FlightSearchFormData) => void;
};

const selectClasses =
  "w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-[var(--border)] bg-[var(--card-subtle)] text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] text-sm";

export default function FlightSearch({
  initialFromCityId = "",
  initialToCityId = "",
  onSearch,
}: Props) {
  const [fromCityId, setFromCityId] = useState(initialFromCityId);
  const [toCityId, setToCityId] = useState(initialToCityId);

  const sortedCities = useMemo(
    () => [...CITIES].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromCityId && toCityId && fromCityId !== toCityId) {
      onSearch({ fromCityId, toCityId });
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
      <Card as="form" padding="lg" onSubmit={handleSubmit}>
        <h2 className="text-h2 text-[var(--fg)] mb-6 sm:mb-8">Search Flights</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* From */}
          <div>
            <label htmlFor="flight-from" className="text-caption text-[var(--fg)] block mb-2">
              From
            </label>
            <select
              id="flight-from"
              name="from"
              value={fromCityId}
              onChange={(e) => setFromCityId(e.target.value)}
              className={selectClasses}
            >
              <option value="">Departure city</option>
              {sortedCities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}, {city.country}
                </option>
              ))}
            </select>
          </div>

          {/* To */}
          <div>
            <label htmlFor="flight-to" className="text-caption text-[var(--fg)] block mb-2">
              To
            </label>
            <select
              id="flight-to"
              name="to"
              value={toCityId}
              onChange={(e) => setToCityId(e.target.value)}
              className={selectClasses}
            >
              <option value="">Destination city</option>
              {sortedCities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}, {city.country}
                </option>
              ))}
            </select>
          </div>
        </div>

        {fromCityId && fromCityId === toCityId && (
          <p className="text-sm text-[var(--muted)] mb-4">
            Departure and destination must be different cities.
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!fromCityId || !toCityId || fromCityId === toCityId}
        >
          Search Flights
        </Button>
      </Card>
    </motion.div>
  );
}
