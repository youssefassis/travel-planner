"use client";

import { useMemo } from "react";
import { ArrowRight, Leaf, MapPin, CalendarDays, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal, { ModalHeader } from "@/components/ui/Modal";
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
  onClose: () => void;
};

/** Other ways to take the same trip, each changing one thing. */
export default function CompareVariants({ trip, intent, onAdopt, onClose }: Props) {
  const variants = useMemo(() => planVariants(trip, intent), [trip, intent]);

  return (
    <Modal onClose={onClose} ariaLabel="Compare alternative plans" size="lg">
      <ModalHeader title="Other ways to do this" onClose={onClose} />

      <Card padding="md" className="mb-5">
        <span className="text-caption text-[var(--muted)] block mb-1">
          Your plan now
        </span>
        <p className="text-sm text-[var(--fg)]">
          {trip.stops.map((stop) => stop.city).join(" → ")}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-[var(--muted)]">
          <span>€{trip.budget.total} per person</span>
          <span>{trip.itinerary.length} days</span>
          <span>
            {trip.stops.length} {trip.stops.length === 1 ? "city" : "cities"}
          </span>
          <span>{Math.round(planEmissionsKg(trip))} kg CO₂e</span>
        </div>
      </Card>

      {variants.length === 0 ? (
        <p className="text-[var(--muted)] py-6 text-center">
          Nothing obvious to change — this is already the cheapest, slowest
          version of the route.
        </p>
      ) : (
        <div className="space-y-4">
          {variants.map((variant) => (
            <Card key={variant.id} padding="lg">
              <h3 className="text-h3 text-[var(--fg)] mb-1">{variant.label}</h3>
              <p className="text-small text-[var(--muted)] mb-4">
                {variant.rationale}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                <Delta Icon={Wallet} value={variant.delta.total} unit="€" />
                <Delta Icon={CalendarDays} value={variant.delta.days} unit=" days" />
                <Delta Icon={MapPin} value={variant.delta.cities} unit=" cities" />
                <Delta Icon={Leaf} value={variant.delta.co2} unit=" kg CO₂e" />
              </div>

              <div className="flex items-center justify-between gap-3">
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
      )}
    </Modal>
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
