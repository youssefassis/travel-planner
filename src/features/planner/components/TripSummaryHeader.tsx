"use client";

import { ReactNode } from "react";
import { Pencil } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { MONTH_NAMES } from "@/domain/climate";
import { TripIntent, TripPlan } from "../types";
import {
  BUDGET_OPTIONS,
  COMPANION_OPTIONS,
  PACE_OPTIONS,
  REGION_LABELS,
  capitalize,
  labelFor,
} from "../lib/options";

/** The wizard's answers collapsed into a read-only trip banner. */
export default function TripSummaryHeader({
  plan,
  intent,
  onEdit,
  actions,
}: {
  plan: TripPlan;
  intent: TripIntent;
  onEdit: () => void;
  /** Trip-wide actions (e.g. share/export) shown in a footer row. */
  actions?: ReactNode;
}) {
  const route = plan.stops.map((stop) => stop.city).join(" → ");
  const days = plan.itinerary.length;

  const chips: string[] = [
    labelFor(COMPANION_OPTIONS, intent.companions),
    labelFor(BUDGET_OPTIONS, intent.vibe.budget),
    `${labelFor(PACE_OPTIONS, intent.vibe.pace)} pace`,
  ];
  if (intent.travelMonth != null) chips.push(`In ${MONTH_NAMES[intent.travelMonth]}`);
  if (intent.mode === "surprise") {
    chips.push("Surprise route");
    if (intent.region && intent.region !== "any")
      chips.push(REGION_LABELS[intent.region]);
    if (intent.vibe.climate && intent.vibe.climate !== "any")
      chips.push(`${capitalize(intent.vibe.climate)} climate`);
  }
  chips.push(...intent.interests.map(capitalize));

  return (
    <Card padding="lg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-h1 text-[var(--fg)]">
            {route} · {days} {days === 1 ? "day" : "days"}
          </h1>
          <div className="flex flex-wrap gap-2 mt-3">
            {chips.map((chip) => (
              <span
                key={chip}
                className="py-1 px-3 rounded-full text-xs font-medium bg-[var(--card-subtle)] text-[var(--muted)] border border-[var(--border)]"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
        <Button
          variant="outline"
          icon={<Pencil size={14} />}
          iconPosition="left"
          onClick={onEdit}
        >
          Edit trip
        </Button>
      </div>

      {plan.notes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-1">
          {plan.notes.map((note, i) => (
            <p key={i} className="text-sm text-[var(--muted)]">
              {note}
            </p>
          ))}
        </div>
      )}

      {actions && (
        <div className="mt-4 pt-4 border-t border-[var(--border)]">{actions}</div>
      )}
    </Card>
  );
}
