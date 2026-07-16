"use client";

import { Interest, Region } from "@/domain/types";
import Card from "@/components/ui/Card";
import { DiscoverFilters } from "../types";

type Props = {
  filters: DiscoverFilters;
  onChange: (filters: DiscoverFilters) => void;
  /** How many cities currently match — shown as live feedback. */
  poolSize: number;
};

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

const cap = (v: string) => v.charAt(0).toUpperCase() + v.slice(1);

function Pill({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`py-1.5 px-3 rounded-full font-medium text-xs transition-all ${
        selected
          ? "bg-[var(--primary)] text-white shadow-sm"
          : "bg-[var(--card-subtle)] text-[var(--fg)] hover:bg-[var(--border)]"
      }`}
    >
      {children}
    </button>
  );
}

export default function FilterBar({ filters, onChange, poolSize }: Props) {
  const toggleInterest = (interest: Interest) => {
    const interests = filters.interests.includes(interest)
      ? filters.interests.filter((i) => i !== interest)
      : [...filters.interests, interest];
    onChange({ ...filters, interests });
  };

  const setRegion = (region: Region | "any") => onChange({ ...filters, region });

  return (
    <Card padding="lg">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h2 className="text-h3 text-[var(--fg)]">Narrow it down (or don&apos;t)</h2>
        <span className="text-caption text-[var(--muted)]">
          {poolSize} {poolSize === 1 ? "destination" : "destinations"} in play
        </span>
      </div>

      <div className="mb-5">
        <span className="text-caption text-[var(--fg)] block mb-2">In the mood for</span>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((interest) => (
            <Pill
              key={interest}
              selected={filters.interests.includes(interest)}
              onClick={() => toggleInterest(interest)}
            >
              {cap(interest)}
            </Pill>
          ))}
        </div>
      </div>

      <div>
        <span className="text-caption text-[var(--fg)] block mb-2">Region</span>
        <div className="flex flex-wrap gap-2">
          <Pill selected={filters.region === "any"} onClick={() => setRegion("any")}>
            Anywhere
          </Pill>
          {(Object.keys(REGION_LABELS) as Region[]).map((region) => (
            <Pill
              key={region}
              selected={filters.region === region}
              onClick={() => setRegion(region)}
            >
              {REGION_LABELS[region]}
            </Pill>
          ))}
        </div>
      </div>
    </Card>
  );
}
