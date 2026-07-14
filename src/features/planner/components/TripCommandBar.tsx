"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Users, Wallet } from "lucide-react";
import { useTripIntentStore } from "../store/tripIntentStore";
import { citiesByCountry } from "@/domain/cities";
import { BudgetTier, Climate, Interest, Pace, Region } from "@/domain/types";
import { TripIntent, TripMode } from "../types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import CityAutocomplete from "@/components/ui/CityAutocomplete";
import CycleField from "@/components/ui/CycleField";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Stepper from "@/components/ui/Stepper";

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

const FilterGroup = ({
  label,
  action,
  children,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <span className="text-caption text-[var(--fg)]">{label}</span>
      {action}
    </div>
    {children}
  </div>
);

export default function TripCommandBar({
  onGenerate,
  loading,
}: {
  onGenerate: () => void;
  loading: boolean;
}) {
  const { intent, patchIntent } = useTripIntentStore();
  const [filtersOpen, setFiltersOpen] = useState(false);

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
    <Card padding="lg">
      {/* Primary controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-3 sm:gap-4 items-end">
        <div>
          <label htmlFor="origin-city" className="text-caption text-[var(--fg)] block mb-2">
            From
          </label>
          <CityAutocomplete
            id="origin-city"
            value={intent.originCityId}
            onChange={(cityId) => patchIntent({ originCityId: cityId })}
            placeholder="Origin city"
          />
        </div>

        <div>
          <span className="text-caption text-[var(--fg)] block mb-2">Duration</span>
          <Stepper
            value={intent.duration ?? 7}
            onChange={(duration) => patchIntent({ duration })}
            min={1}
            max={30}
            format={(v) => `${v} ${v === 1 ? "day" : "days"}`}
          />
        </div>

        <CycleField
          label="Who"
          icon={<Users className="w-4 h-4" />}
          options={COMPANION_OPTIONS}
          value={companions}
          onChange={(value) => patchIntent({ companions: value })}
        />

        <CycleField
          label="Budget"
          icon={<Wallet className="w-4 h-4" />}
          options={BUDGET_OPTIONS}
          value={budget}
          onChange={(value) =>
            patchIntent({ vibe: { ...intent.vibe, budget: value } })
          }
        />

        <Button
          variant="primary"
          size="lg"
          className="w-full xl:w-auto"
          onClick={onGenerate}
          disabled={generateDisabled}
        >
          {loading ? "Generating..." : "Generate"}
        </Button>
      </div>

      {/* Mode + more filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-[var(--border)]">
        <SegmentedControl
          size="sm"
          options={MODE_OPTIONS}
          value={intent.mode}
          onChange={(mode) => patchIntent({ mode })}
          className="w-full sm:w-auto"
        />
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
        >
          More filters
          {(interests.length > 0 ||
            (intent.vibe?.climate ?? "any") !== "any" ||
            (intent.region ?? "any") !== "any") && (
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
          )}
          <ChevronDown
            size={16}
            className={`transition-transform ${filtersOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Collapsible advanced filters */}
      <AnimatePresence initial={false}>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mt-5">
              <FilterGroup label="Travel Pace">
                <SegmentedControl
                  size="sm"
                  options={PACE_OPTIONS}
                  value={pace}
                  onChange={(value) =>
                    patchIntent({ vibe: { ...intent.vibe, pace: value } })
                  }
                  className="max-w-xs"
                />
              </FilterGroup>

              <FilterGroup
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
              </FilterGroup>

              {intent.mode === "surprise" && (
                <>
                  <FilterGroup label="Climate">
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
                  </FilterGroup>

                  <FilterGroup label="Region">
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
                  </FilterGroup>
                </>
              )}

              {intent.mode === "custom" && (
                <FilterGroup
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
                  <div className="max-h-56 overflow-y-auto space-y-3 pr-1 md:col-span-2">
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
                </FilterGroup>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
