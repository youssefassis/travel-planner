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
import { fadeIn } from "@/components/motion";

const FilterCard = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
    <label className="text-caption text-[var(--fg)] block mb-4">{label}</label>
    {children}
  </div>
);

const SegmentButton = ({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all text-sm ${
      selected
        ? "bg-[var(--primary)] text-white shadow-md"
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

const COMPANION_OPTIONS: { label: string; value: TripIntent["companions"] }[] =
  [
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

const CLIMATE_OPTIONS: Climate[] = ["cold", "temperate", "warm"];

const REGION_OPTIONS: Region[] = [
  "iberia",
  "france",
  "british-isles",
  "benelux",
  "central",
  "italy",
  "nordics",
  "balkans",
  "east",
];

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
    const selected = intent.selectedCityIds ?? [];
    const next = selected.includes(cityId)
      ? selected.filter((id) => id !== cityId)
      : [...selected, cityId];
    patchIntent({ selectedCityIds: next });
  };

  const generateDisabled =
    loading ||
    (intent.mode === "custom" && intent.selectedCityIds.length === 0);

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
          <div className="flex gap-2">
            {MODE_OPTIONS.map((option) => (
              <SegmentButton
                key={option.value}
                label={option.label}
                selected={intent.mode === option.value}
                onClick={() => patchIntent({ mode: option.value })}
              />
            ))}
          </div>
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
          <div className="space-y-3">
            <input
              type="number"
              min="1"
              max="30"
              value={intent.duration ?? 5}
              onChange={(e) =>
                patchIntent({ duration: Number(e.target.value) })
              }
              className="w-full px-4 py-2 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--fg)] focus:outline-none focus:border-[var(--primary)]"
            />
            <p className="text-sm text-[var(--muted)]">
              {intent.duration ?? 5} days
            </p>
          </div>
        </FilterCard>

        {/* Companions */}
        <FilterCard label="Travel Style">
          <div className="flex gap-2">
            {COMPANION_OPTIONS.map((option) => (
              <SegmentButton
                key={option.value}
                label={option.label}
                selected={companions === option.value}
                onClick={() => patchIntent({ companions: option.value })}
              />
            ))}
          </div>
        </FilterCard>

        {/* Pace */}
        <FilterCard label="Travel Pace">
          <div className="flex gap-2">
            {PACE_OPTIONS.map((option) => (
              <SegmentButton
                key={option.value}
                label={option.label}
                selected={pace === option.value}
                onClick={() =>
                  patchIntent({
                    vibe: { ...intent.vibe, pace: option.value },
                  })
                }
              />
            ))}
          </div>
        </FilterCard>

        {/* Budget */}
        <FilterCard label="Budget Tier">
          <div className="flex gap-2">
            {BUDGET_OPTIONS.map((option) => (
              <SegmentButton
                key={option.value}
                label={option.label}
                selected={budget === option.value}
                onClick={() =>
                  patchIntent({
                    vibe: { ...intent.vibe, budget: option.value },
                  })
                }
              />
            ))}
          </div>
        </FilterCard>

        {/* Interests */}
        <FilterCard label="Interests">
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => {
              const selected = interests.includes(interest);
              return (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`py-1.5 px-3 rounded-full font-medium transition-all text-xs ${
                    selected
                      ? "bg-[var(--primary)] text-white shadow-md"
                      : "bg-[var(--card-subtle)] text-[var(--fg)] hover:bg-[var(--border)]"
                  }`}
                >
                  {capitalize(interest)}
                </button>
              );
            })}
          </div>
        </FilterCard>

        {/* Climate + Region (surprise mode only) */}
        {intent.mode === "surprise" && (
          <>
            <FilterCard label="Climate">
              <select
                value={intent.vibe?.climate ?? "any"}
                onChange={(e) =>
                  patchIntent({
                    vibe: {
                      ...intent.vibe,
                      climate: e.target.value as Climate | "any",
                    },
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--fg)] focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="any">Any</option>
                {CLIMATE_OPTIONS.map((climate) => (
                  <option key={climate} value={climate}>
                    {capitalize(climate)}
                  </option>
                ))}
              </select>
            </FilterCard>

            <FilterCard label="Region">
              <select
                value={intent.region ?? "any"}
                onChange={(e) =>
                  patchIntent({ region: e.target.value as Region | "any" })
                }
                className="w-full px-4 py-2 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--fg)] focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="any">Any</option>
                {REGION_OPTIONS.map((region) => (
                  <option key={region} value={region}>
                    {capitalize(region)}
                  </option>
                ))}
              </select>
            </FilterCard>
          </>
        )}

        {/* City picker (custom mode only) */}
        {intent.mode === "custom" && (
          <FilterCard label="Cities">
            <div className="max-h-64 overflow-y-auto space-y-4 pr-1">
              {countries.map((country) => (
                <div key={country}>
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">
                    {country}
                  </p>
                  <div className="space-y-1.5">
                    {citiesByCountryMap[country].map((city) => (
                      <label
                        key={city.id}
                        className="flex items-center gap-2 text-sm text-[var(--fg)] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={intent.selectedCityIds.includes(city.id)}
                          onChange={() => toggleCity(city.id)}
                          className="accent-[var(--primary)]"
                        />
                        {city.name}
                      </label>
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
