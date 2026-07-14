"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, Plane, Users } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CityAutocomplete from "@/components/ui/CityAutocomplete";
import CycleField from "@/components/ui/CycleField";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { fadeInUp } from "@/components/motion";

export type StopsPreference = "any" | "direct";
export type TripType = "oneway" | "round";

export type FlightSearchFormData = {
  fromCityId: string;
  toCityId: string;
  travelers: number;
  stops: StopsPreference;
  tripType: TripType;
  departDate: string; // YYYY-MM-DD, "" = flexible
  returnDate: string; // YYYY-MM-DD, only for round trips
};

type Props = {
  initialFromCityId?: string;
  initialToCityId?: string;
  onSearch: (data: FlightSearchFormData) => void;
};

const TRIP_TYPE_OPTIONS: { label: string; value: TripType }[] = [
  { label: "One-way", value: "oneway" },
  { label: "Round trip", value: "round" },
];

const TRAVELER_OPTIONS = [
  { label: "1 Traveler", value: "1" },
  { label: "2 Travelers", value: "2" },
  { label: "3 Travelers", value: "3" },
  { label: "4 Travelers", value: "4" },
];

const STOPS_OPTIONS: { label: string; value: StopsPreference }[] = [
  { label: "Any stops", value: "any" },
  { label: "Direct only", value: "direct" },
];

export default function FlightSearch({
  initialFromCityId = "",
  initialToCityId = "",
  onSearch,
}: Props) {
  const [fromCityId, setFromCityId] = useState(initialFromCityId);
  const [toCityId, setToCityId] = useState(initialToCityId);
  const [travelers, setTravelers] = useState("1");
  const [stops, setStops] = useState<StopsPreference>("any");
  const [tripType, setTripType] = useState<TripType>("oneway");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const swapCities = () => {
    setFromCityId(toCityId);
    setToCityId(fromCityId);
  };

  const datesInvalid =
    tripType === "round" && departDate !== "" && returnDate !== "" && returnDate < departDate;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!fromCityId || !toCityId || fromCityId === toCityId || datesInvalid) return;
    onSearch({
      fromCityId,
      toCityId,
      travelers: parseInt(travelers, 10),
      stops,
      tripType,
      departDate,
      returnDate: tripType === "round" ? returnDate : "",
    });
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
      <Card as="form" padding="lg" onSubmit={handleSubmit}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8">
          <h2 className="text-h2 text-[var(--fg)]">Search Flights</h2>
          <SegmentedControl
            size="sm"
            options={TRIP_TYPE_OPTIONS}
            value={tripType}
            onChange={setTripType}
            className="w-full sm:w-auto"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 items-end mb-4 sm:mb-5">
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

          {/* Swap */}
          <button
            type="button"
            onClick={swapCities}
            aria-label="Swap departure and destination"
            className="justify-self-center w-10 h-10 mb-0.5 flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] transition-all hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-95 rotate-90 sm:rotate-0"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

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

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-end mb-6 sm:mb-8 ${
            tripType === "round" ? "lg:grid-cols-4" : "lg:grid-cols-3"
          }`}
        >
          <div>
            <label htmlFor="flight-depart" className="text-caption text-[var(--fg)] block mb-2">
              Departure
            </label>
            <input
              id="flight-depart"
              type="date"
              value={departDate}
              min={today}
              onChange={(e) => setDepartDate(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--fg)] text-sm focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          {tripType === "round" && (
            <div>
              <label htmlFor="flight-return" className="text-caption text-[var(--fg)] block mb-2">
                Return
              </label>
              <input
                id="flight-return"
                type="date"
                value={returnDate}
                min={departDate || today}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--fg)] text-sm focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          )}

          <CycleField
            label="Who"
            icon={<Users className="w-4 h-4" />}
            options={TRAVELER_OPTIONS}
            value={travelers}
            onChange={setTravelers}
          />
          <CycleField
            label="Stops"
            icon={<Plane className="w-4 h-4" />}
            options={STOPS_OPTIONS}
            value={stops}
            onChange={setStops}
          />
        </div>

        {fromCityId && fromCityId === toCityId && (
          <p className="text-sm text-[var(--muted)] mb-4">
            Departure and destination must be different cities.
          </p>
        )}
        {datesInvalid && (
          <p className="text-sm text-[var(--muted)] mb-4">
            The return date must be after the departure date.
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!fromCityId || !toCityId || fromCityId === toCityId || datesInvalid}
        >
          Search Flights
        </Button>
      </Card>
    </motion.div>
  );
}
