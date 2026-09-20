"use client";

import { useMemo } from "react";
import { ArrowRight, CalendarDays, Leaf, MapPin, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ResultsHeader from "@/components/ui/ResultsHeader";
import {
  PlanVariant,
  planEmissionsKg,
  planVariants,
} from "@/features/planner/engine";
import { TripIntent, TripPlan } from "@/features/planner/types";

type Props = {
  trip: TripPlan;
  intent: TripIntent;
  /** Swap the current plan for this one. */
  onAdopt: (variant: PlanVariant) => void;
};

/**
 * Other ways to take the same trip, laid out on the Overview rather than
 * hidden behind a button — each variant changes exactly one thing, so the
 * trade stays legible. Renders nothing when the plan has no real alternative.
 */
export default function VariantsPanel({ trip, intent, onAdopt }: Props) {
  const variants = useMemo(() => planVariants(trip, intent), [trip, intent]);

  if (variants.length === 0) return null;

  return (
    <section>
      <ResultsHeader
        title="Other ways to take this trip"
        blurb={`Against your plan now — €${trip.budget.total} per person, ${
          trip.itinerary.length
        } days, ${Math.round(planEmissionsKg(trip))} kg CO₂e. Each changes one thing.`}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {variants.map((variant) => (
          <Card key={variant.id} padding="lg" className="flex flex-col gap-4">
            <div>
              <h3 className="text-h3 text-[var(--fg)] mb-1">{variant.label}</h3>
              <p className="text-small text-[var(--muted)]">{variant.rationale}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Delta Icon={Wallet} value={variant.delta.total} unit="€" />
              <Delta Icon={CalendarDays} value={variant.delta.days} unit=" days" />
              <Delta Icon={MapPin} value={variant.delta.cities} unit=" cities" />
              <Delta Icon={Leaf} value={variant.delta.co2} unit=" kg CO₂e" />
            </div>

            <div className="mt-auto flex items-center justify-between gap-3">
              <span className="text-small text-[var(--muted)] truncate">
                {variant.plan.stops.map((stop) => stop.city).join(" → ")}
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onAdopt(variant)}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                iconPosition="right"
              >
                Use this
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

/** A signed change. Less of anything is good here, so less reads as positive. */
function Delta({
  Icon,
  value,
  unit,
}: {
  Icon: LucideIcon;
  value: number;
  unit: string;
}) {
  if (value === 0) return null;

  const better = value < 0;
  const sign = value > 0 ? "+" : "−";
  const shown = Math.abs(value);
  const amount = unit === "€" ? `${sign}€${shown}` : `${sign}${shown}${unit}`;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-caption ${
        better
          ? "bg-[var(--success-bg)] text-[var(--success)]"
          : "bg-[var(--card-subtle)] text-[var(--muted)]"
      }`}
    >
      <Icon className="w-3 h-3" />
      {amount}
    </span>
  );
}
