"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CityAutocomplete from "@/components/ui/CityAutocomplete";
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

export default function FlightSearch({
  initialFromCityId = "",
  initialToCityId = "",
  onSearch,
}: Props) {
  const [fromCityId, setFromCityId] = useState(initialFromCityId);
  const [toCityId, setToCityId] = useState(initialToCityId);

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
            <CityAutocomplete
              id="flight-from"
              value={fromCityId}
              onChange={setFromCityId}
              placeholder="Departure city"
            />
          </div>

          {/* To */}
          <div>
            <label htmlFor="flight-to" className="text-caption text-[var(--fg)] block mb-2">
              To
            </label>
            <CityAutocomplete
              id="flight-to"
              value={toCityId}
              onChange={setToCityId}
              placeholder="Destination city"
            />
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
