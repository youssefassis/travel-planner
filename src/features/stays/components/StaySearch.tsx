"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { BudgetTier } from "@/domain/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CityAutocomplete from "@/components/ui/CityAutocomplete";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Stepper from "@/components/ui/Stepper";
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

const BUDGET_OPTIONS: { label: string; value: BudgetTier }[] = [
  { label: "Backpacker", value: "backpacker" },
  { label: "Comfort", value: "comfort" },
  { label: "Luxury", value: "luxury" },
];

export default function StaySearch({
  initialCityId = "",
  initialBudget = "comfort",
  initialNights,
  onSearch,
}: Props) {
  const [cityId, setCityId] = useState(initialCityId);
  const [budget, setBudget] = useState<BudgetTier>(initialBudget);
  // 0 means "any number of nights" (the field is optional).
  const [nights, setNights] = useState(initialNights ?? 0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!cityId) return;
    onSearch({
      cityId,
      budget,
      nights: nights > 0 ? nights : undefined,
    });
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
      <Card as="form" padding="lg" onSubmit={handleSubmit}>
        <h2 className="text-h2 text-[var(--fg)] mb-6 sm:mb-8">Search Accommodations</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end mb-6 sm:mb-8">
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
            <span className="text-caption text-[var(--fg)] block mb-2">Budget</span>
            <SegmentedControl
              options={BUDGET_OPTIONS}
              value={budget}
              onChange={setBudget}
            />
          </div>

          {/* Nights */}
          <div>
            <span className="text-caption text-[var(--fg)] block mb-2">Nights</span>
            <Stepper
              value={nights}
              onChange={setNights}
              min={0}
              max={60}
              format={(v) => (v === 0 ? "Any" : `${v} ${v === 1 ? "night" : "nights"}`)}
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
