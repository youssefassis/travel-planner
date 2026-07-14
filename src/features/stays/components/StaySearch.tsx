"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BudgetTier } from "@/domain/types";
import { CITIES } from "@/domain/cities";

export type StaySearchFormData = {
  cityId: string;
  budget: BudgetTier;
  nights?: number;
};

type Props = {
  initialCityId?: string;
  initialBudget?: BudgetTier;
  initialNights?: number;
  onSearch: (data: StaySearchFormData) => void;
};

const fieldClasses =
  "w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-[var(--border)] bg-[var(--card-subtle)] text-[var(--fg)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] text-sm";

export default function StaySearch({
  initialCityId = "",
  initialBudget = "comfort",
  initialNights,
  onSearch,
}: Props) {
  const [cityId, setCityId] = useState(initialCityId);
  const [budget, setBudget] = useState<BudgetTier>(initialBudget);
  const [nights, setNights] = useState(
    initialNights !== undefined ? String(initialNights) : ""
  );

  const sortedCities = useMemo(
    () => [...CITIES].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityId) return;
    const parsedNights = parseInt(nights, 10);
    onSearch({
      cityId,
      budget,
      nights: Number.isFinite(parsedNights) && parsedNights > 0 ? parsedNights : undefined,
    });
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* City */}
        <div>
          <label
            htmlFor="stay-city"
            className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wide block mb-2"
          >
            City
          </label>
          <select
            id="stay-city"
            name="city"
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            className={fieldClasses}
          >
            <option value="">Where to?</option>
            {sortedCities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}, {city.country}
              </option>
            ))}
          </select>
        </div>

        {/* Budget */}
        <div>
          <label
            htmlFor="stay-budget"
            className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wide block mb-2"
          >
            Budget
          </label>
          <select
            id="stay-budget"
            name="budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value as BudgetTier)}
            className={fieldClasses}
          >
            <option value="backpacker">Backpacker</option>
            <option value="comfort">Comfort</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>

        {/* Nights */}
        <div>
          <label
            htmlFor="stay-nights"
            className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wide block mb-2"
          >
            Nights (optional)
          </label>
          <input
            id="stay-nights"
            type="number"
            name="nights"
            value={nights}
            onChange={(e) => setNights(e.target.value)}
            min="1"
            max="60"
            placeholder="How many nights?"
            className={fieldClasses}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!cityId}
        className="w-full btn btn-primary btn-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Search Accommodations
      </button>
    </motion.form>
  );
}
