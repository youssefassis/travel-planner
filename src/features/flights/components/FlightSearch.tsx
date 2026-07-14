"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export type FlightSearchFormData = {
  from: string;
  to: string;
  departureDate: string;
  returnDate: string;
  passengers: number;
  cabinClass: "economy" | "business" | "first";
};

type Props = {
  onSearch: (data: FlightSearchFormData) => void;
  isLoading?: boolean;
};

export default function FlightSearch({ onSearch, isLoading = false }: Props) {
  const [form, setForm] = useState<FlightSearchFormData>({
    from: "",
    to: "",
    departureDate: "",
    returnDate: "",
    passengers: 1,
    cabinClass: "economy",
  });

  const [isRoundTrip, setIsRoundTrip] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "passengers" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.from && form.to && form.departureDate) {
      onSearch(form);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="card bg-[var(--card)] border border-[var(--border)]"
    >
      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--fg)] mb-6 sm:mb-8">
        Search Flights
      </h2>

      {/* Trip Type Toggle */}
      <div className="flex gap-4 mb-6 sm:mb-8">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={isRoundTrip}
            onChange={() => setIsRoundTrip(true)}
            className="w-4 h-4 cursor-pointer"
          />
          <span className="text-[var(--fg)] font-medium text-sm">Round trip</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={!isRoundTrip}
            onChange={() => setIsRoundTrip(false)}
            className="w-4 h-4 cursor-pointer"
          />
          <span className="text-[var(--fg)] font-medium text-sm">One way</span>
        </label>
      </div>

      {/* Main search fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* From */}
        <div>
          <label className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wide block mb-2">
            From
          </label>
          <input
            type="text"
            name="from"
            value={form.from}
            onChange={handleChange}
            placeholder="Departure"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-[var(--border)] bg-[var(--card-subtle)] text-[var(--fg)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] text-sm"
          />
        </div>

        {/* To */}
        <div>
          <label className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wide block mb-2">
            To
          </label>
          <input
            type="text"
            name="to"
            value={form.to}
            onChange={handleChange}
            placeholder="Destination"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-[var(--border)] bg-[var(--card-subtle)] text-[var(--fg)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] text-sm"
          />
        </div>

        {/* Departure Date */}
        <div>
          <label className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wide block mb-2">
            Depart
          </label>
          <input
            type="date"
            name="departureDate"
            value={form.departureDate}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-[var(--border)] bg-[var(--card-subtle)] text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] text-sm"
          />
        </div>

        {/* Return Date (conditional) */}
        {isRoundTrip && (
          <div>
            <label className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wide block mb-2">
              Return
            </label>
            <input
              type="date"
              name="returnDate"
              value={form.returnDate}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-[var(--border)] bg-[var(--card-subtle)] text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] text-sm"
            />
          </div>
        )}
      </div>

      {/* Secondary options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Passengers */}
        <div>
          <label className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wide block mb-2">
            Passengers
          </label>
          <select
            name="passengers"
            value={form.passengers}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-[var(--border)] bg-[var(--card-subtle)] text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] text-sm"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? "Passenger" : "Passengers"}
              </option>
            ))}
          </select>
        </div>

        {/* Cabin Class */}
        <div>
          <label className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wide block mb-2">
            Class
          </label>
          <select
            name="cabinClass"
            value={form.cabinClass}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-[var(--border)] bg-[var(--card-subtle)] text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] text-sm"
          >
            <option value="economy">Economy</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn btn-primary btn-lg text-white font-semibold"
      >
        {isLoading ? "Searching..." : "Search Flights"}
      </button>
    </motion.form>
  );
}
