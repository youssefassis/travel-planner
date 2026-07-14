"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTripIntentStore } from "../store/tripIntentStore";
import { citiesByCountry } from "@/domain/cities";
import { BudgetTier, Climate, Interest, Pace, Region } from "@/domain/types";
import { TripIntent, TripMode } from "../types";
import Button from "@/components/ui/Button";
import CityAutocomplete from "@/components/ui/CityAutocomplete";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Stepper from "@/components/ui/Stepper";
import { fadeIn } from "@/components/motion";

const FilterCard = ({
  label,
  action,
  children,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-caption text-[var(--fg)]">{label}</span>
      {action}
    </div>
    {children}
  </div>
);

const Chip = ({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`py-1.5 px-3 rounded-full font-medium transition-all text-xs ${
      selected
        ? "bg-[var(--primary)] text-white shadow-sm"
        : "bg-[var(--card-subtle)] text-[var(--fg)] hover:bg-[var(--border)]"
    }`}
  >
    {label}
  </button>
);

const MODE_OPTIONS: { label: string; value: TripMode }[] = [
  { label: "Surprise me", value: "surprise" },
  { label: "Pick my cities", value: "custom" },
];

const COMPANION_OPTIONS: { label: string; value: TripIntent["companions"] }[] = [
  { label: "Solo", value: "solo" },
  { label: "Couple", value: "couple" },
  { label: "Group", value: "group" },
];

const PACE_OPTIONS: { label: string; value: Pace }[] = [
  { label: "Chill", value: "chill" },
  { label: "Balanced", value: "balanced" },
  { label: "Intense", value: "intense" },
];

const BUDGET_OPTIONS: { label: string; value: BudgetTier }[] = [
  { label: "Backpacker", value: "backpacker" },
  { label: "Comfort", value: "comfort" },
  { label: "Luxury", value: "luxury" },
];

const INTEREST_OPTIONS: Interest[] = [
  "culture",
  "food",
  "nature",
  "nightlife",
  "beach",
  "history",
  "art",
  "adventure",
];

const CLIMATE_OPTIONS: (Climate | "any")[] = ["any", "cold", "temperate", "warm"];

const REGION_LABELS: Record<Region, string> = {
  iberia: "Iberia",
  france: "France",
  "british-isles": "British Isles",
  benelux: "Benelux",
  central: "Central Europe",
  italy: "Italy",
  nordics: "Nordics",
  balkans: "Balkans",
  east: "Eastern Europe",
};

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function PlannerSidebar({
  onGenerate,
  loading,
}: {
  onGenerate: () => void;
  loading: boolean;
}) {
  const { intent, patchIntent } = useTripIntentStore();
  const [expanded, setExpanded] = useState(false);

  const companions = intent.companions || "solo";
  const pace = intent.vibe?.pace || "balanced";
  const budget = intent.vibe?.budget || "comfort";
  const interests = intent.interests ?? [];
  const selectedCityIds = intent.selectedCityIds ?? [];
  const citiesByCountryMap = citiesByCountry();
  const countries = Object.keys(citiesByCountryMap).sort((a, b) =>
    a.localeCompare(b),
  );

  const toggleInterest = (interest: Interest) => {
    const next = interests.includes(interest)
      ? interests.filter((i) => i !== interest)
      : [...interests, interest];
    patchIntent({ interests: next });
  };

  const toggleCity = (cityId: string) => {
    const next = selectedCityIds.includes(cityId)
      ? selectedCityIds.filter((id) => id !== cityId)
      : [...selectedCityIds, cityId];
    patchIntent({ selectedCityIds: next });
  };

  const generateDisabled =
    loading || (intent.mode === "custom" && selectedCityIds.length === 0);

  return (
    <aside className="h-fit sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto space-y-4">
      {/* Mobile disclosure toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="md:hidden w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-left"
      >
        <span className="text-h3 text-[var(--fg)]">Trip preferences</span>
        <ChevronDown
          size={18}
          className={`text-[var(--muted)] transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className={`${expanded ? "block" : "hidden"} md:block space-y-4`}
      >
        {/* Mode */}
        <FilterCard label="Trip Mode">
          <SegmentedControl
            size="sm"
            options={MODE_OPTIONS}
            value={intent.mode}
            onChange={(mode) => patchIntent({ mode })}
          />
        </FilterCard>

        {/* Origin city */}
        <FilterCard label="Origin City">
          <CityAutocomplete
            id="origin-city"
            value={intent.originCityId}
            onChange={(cityId) => patchIntent({ originCityId: cityId })}
            placeholder="Search a city..."
          />
        </FilterCard>

        {/* Duration */}
        <FilterCard label="Trip Duration">
          <Stepper
            value={intent.duration ?? 7}
            onChange={(duration) => patchIntent({ duration })}
            min={1}
            max={30}
            format={(v) => `${v} ${v === 1 ? "day" : "days"}`}
          />
        </FilterCard>

        {/* Companions */}
        <FilterCard label="Travel Style">
          <SegmentedControl
            size="sm"
            options={COMPANION_OPTIONS}
            value={companions}
            onChange={(value) => patchIntent({ companions: value })}
          />
        </FilterCard>

        {/* Pace */}
        <FilterCard label="Travel Pace">
          <SegmentedControl
            size="sm"
            options={PACE_OPTIONS}
            value={pace}
            onChange={(value) =>
              patchIntent({ vibe: { ...intent.vibe, pace: value } })
            }
          />
        </FilterCard>

        {/* Budget */}
        <FilterCard label="Budget Tier">
          <SegmentedControl
            size="sm"
            options={BUDGET_OPTIONS}
            value={budget}
            onChange={(value) =>
              patchIntent({ vibe: { ...intent.vibe, budget: value } })
            }
          />
        </FilterCard>

        {/* Interests */}
        <FilterCard
          label="Interests"
          action={
            interests.length > 0 ? (
              <button
                type="button"
                onClick={() => patchIntent({ interests: [] })}
                className="text-xs text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
              >
                Clear
              </button>
            ) : undefined
          }
        >
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <Chip
                key={interest}
                label={capitalize(interest)}
                selected={interests.includes(interest)}
                onClick={() => toggleInterest(interest)}
              />
            ))}
          </div>
        </FilterCard>

        {/* Climate + Region (surprise mode only) */}
        {intent.mode === "surprise" && (
          <>
            <FilterCard label="Climate">
              <div className="flex flex-wrap gap-2">
                {CLIMATE_OPTIONS.map((climate) => (
                  <Chip
                    key={climate}
                    label={capitalize(climate)}
                    selected={(intent.vibe?.climate ?? "any") === climate}
                    onClick={() =>
                      patchIntent({ vibe: { ...intent.vibe, climate } })
                    }
                  />
                ))}
              </div>
            </FilterCard>

            <FilterCard label="Region">
              <div className="flex flex-wrap gap-2">
                <Chip
                  label="Any"
                  selected={(intent.region ?? "any") === "any"}
                  onClick={() => patchIntent({ region: "any" })}
                />
                {(Object.keys(REGION_LABELS) as Region[]).map((region) => (
                  <Chip
                    key={region}
                    label={REGION_LABELS[region]}
                    selected={intent.region === region}
                    onClick={() => patchIntent({ region })}
                  />
                ))}
              </div>
            </FilterCard>
          </>
        )}

        {/* City picker (custom mode only) */}
        {intent.mode === "custom" && (
          <FilterCard
            label={
              selectedCityIds.length > 0
                ? `Cities · ${selectedCityIds.length} selected`
                : "Cities"
            }
            action={
              selectedCityIds.length > 0 ? (
                <button
                  type="button"
                  onClick={() => patchIntent({ selectedCityIds: [] })}
                  className="text-xs text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
                >
                  Clear
                </button>
              ) : undefined
            }
          >
            <div className="max-h-64 overflow-y-auto space-y-4 pr-1">
              {countries.map((country) => (
                <div key={country}>
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">
                    {country}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {citiesByCountryMap[country].map((city) => (
                      <Chip
                        key={city.id}
                        label={city.name}
                        selected={selectedCityIds.includes(city.id)}
                        onClick={() => toggleCity(city.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FilterCard>
        )}
      </motion.div>

      {/* CTA Button — always visible regardless of mobile collapse state */}
      <Button
        variant="primary"
        size="lg"
        className="w-full mt-8"
        onClick={onGenerate}
        disabled={generateDisabled}
      >
        {loading ? "Generating..." : "Generate Itinerary"}
      </Button>
    </aside>
  );
}
