"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BudgetTier } from "@/domain/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CityAutocomplete from "@/components/ui/CityAutocomplete";
import { fadeInUp } from "@/components/motion";

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
  "w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--fg)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] text-sm";

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
    <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
      <Card as="form" padding="lg" onSubmit={handleSubmit}>
        <h2 className="text-h2 text-[var(--fg)] mb-6 sm:mb-8">Search Accommodations</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* City */}
          <div>
            <label htmlFor="stay-city" className="text-caption text-[var(--fg)] block mb-2">
              City
            </label>
            <CityAutocomplete
              id="stay-city"
              value={cityId}
              onChange={setCityId}
              placeholder="Where to?"
            />
          </div>

          {/* Budget */}
          <div>
            <label htmlFor="stay-budget" className="text-caption text-[var(--fg)] block mb-2">
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
            <label htmlFor="stay-nights" className="text-caption text-[var(--fg)] block mb-2">
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

        <Button type="submit" size="lg" className="w-full" disabled={!cityId}>
          Search Accommodations
        </Button>
      </Card>
    </motion.div>
  );
}
