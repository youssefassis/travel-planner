"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export type StaySearchFormData = {
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  stayType: "hotel" | "airbnb" | "both";
  maxPricePerNight: number;
};

type Props = {
  onSearch: (data: StaySearchFormData) => void;
  isLoading?: boolean;
};

export default function StaySearch({ onSearch, isLoading = false }: Props) {
  const [form, setForm] = useState<StaySearchFormData>({
    destination: "",
    checkInDate: "",
    checkOutDate: "",
    guests: 1,
    stayType: "both",
    maxPricePerNight: 500,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "guests" || name === "maxPricePerNight" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.destination && form.checkInDate && form.checkOutDate) {
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
        Search Accommodations
      </h2>

      {/* Main search fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Destination */}
        <div>
          <label className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wide block mb-2">
            Destination
          </label>
          <input
            type="text"
            name="destination"
            value={form.destination}
            onChange={handleChange}
            placeholder="Where to?"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-[var(--border)] bg-[var(--card-subtle)] text-[var(--fg)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] text-sm"
          />
        </div>

        {/* Check-in Date */}
        <div>
          <label className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wide block mb-2">
            Check-in
          </label>
          <input
            type="date"
            name="checkInDate"
            value={form.checkInDate}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-[var(--border)] bg-[var(--card-subtle)] text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] text-sm"
          />
        </div>

        {/* Check-out Date */}
        <div>
          <label className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wide block mb-2">
            Check-out
          </label>
          <input
            type="date"
            name="checkOutDate"
            value={form.checkOutDate}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-[var(--border)] bg-[var(--card-subtle)] text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] text-sm"
          />
        </div>

        {/* Guests */}
        <div>
          <label className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wide block mb-2">
            Guests
          </label>
          <select
            name="guests"
            value={form.guests}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-[var(--border)] bg-[var(--card-subtle)] text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] text-sm"
          >
            {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? "Guest" : "Guests"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Secondary options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Stay Type */}
        <div>
          <label className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wide block mb-2">
            Type
          </label>
          <select
            name="stayType"
            value={form.stayType}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-[var(--border)] bg-[var(--card-subtle)] text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] text-sm"
          >
            <option value="both">Any</option>
            <option value="hotel">Hotels</option>
            <option value="airbnb">Rentals</option>
          </select>
        </div>

        {/* Max Price */}
        <div>
          <label className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wide block mb-2">
            Max: ${form.maxPricePerNight}/night
          </label>
          <input
            type="range"
            name="maxPricePerNight"
            value={form.maxPricePerNight}
            onChange={handleChange}
            min="50"
            max="1000"
            step="50"
            className="w-full h-2 rounded-lg bg-[var(--border)] appearance-none cursor-pointer accent-[var(--primary)]"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn btn-primary btn-lg text-white font-semibold"
      >
        {isLoading ? "Searching..." : "Search Accommodations"}
      </button>
    </motion.form>
  );
}
