"use client";

import { Plane, BedDouble, Ticket, UtensilsCrossed } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Price from "@/components/ui/Price";
import { allLegs } from "../engine/transport";
import { Bookings, TripPlan } from "../types";
import FootprintCard from "./FootprintCard";
import TransportModeIcon from "./TransportModeIcon";

type Props = {
  plan: TripPlan;
  /** What's already reserved, so committed spend reads differently. */
  bookings?: Bookings;
  onGoToFlights?: () => void;
  onGoToStays?: () => void;
};

const CATEGORY_META: { key: keyof CategoryValues; label: string; Icon: LucideIcon }[] = [
  { key: "transport", label: "Transport", Icon: Plane },
  { key: "stays", label: "Stays", Icon: BedDouble },
  { key: "activities", label: "Activities", Icon: Ticket },
  { key: "food", label: "Food", Icon: UtensilsCrossed },
];

type CategoryValues = {
  transport: number;
  stays: number;
  activities: number;
  food: number;
};

/** The full budget picture: totals, category split, and the per-city and
 *  per-leg figures that add up to it. */
export default function BudgetBreakdownView({
  plan,
  bookings = {},
  onGoToFlights,
  onGoToStays,
}: Props) {
  const { budget, stops, notes } = plan;
  // Home legs included — the flights there and back are part of the trip.
  const legs = allLegs(plan);
  const booked = Object.values(bookings).reduce((sum, b) => sum + b.price, 0);
  const categoryMax = Math.max(
    budget.transport,
    budget.stays,
    budget.activities,
    budget.food,
    1,
  );

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-caption text-[var(--muted)] block mb-1">
              Estimated trip budget · per person
            </span>
            <Price
              amount={`€${budget.total}`}
              sub={
                budget.travelers > 1
                  ? `≈ €${budget.perDay} per day · €${budget.partyTotal} for ${budget.travelers} travellers`
                  : `≈ €${budget.perDay} per day`
              }
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {onGoToFlights && (
              <Button variant="secondary" size="sm" onClick={onGoToFlights}>
                Optimize flights
              </Button>
            )}
            {onGoToStays && (
              <Button variant="secondary" size="sm" onClick={onGoToStays}>
                Optimize stays
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {CATEGORY_META.map(({ key, label, Icon }) => {
            const value = budget[key];
            const pct = Math.round((value / budget.total) * 100);
            return (
              <div key={key}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-2 text-[var(--fg)]">
                    <Icon className="w-4 h-4 text-[var(--primary)]" />
                    {label}
                  </span>
                  <span className="text-[var(--muted)]">
                    €{value} · {pct}%
                    {key === "activities" && booked > 0 && (
                      <span className="text-[var(--success)]"> · €{booked} booked</span>
                    )}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--card-subtle)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--primary)]"
                    style={{ width: `${(value / categoryMax) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stays per city */}
        <Card padding="lg">
          <h3 className="text-h3 text-[var(--fg)] mb-4">Stays by city</h3>
          <ul className="space-y-3">
            {stops.map((stop) => (
              <li
                key={stop.cityId}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[var(--fg)] truncate">{stop.city}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {stop.days} {stop.days === 1 ? "night" : "nights"} · €
                    {stop.stayPerNight}/night
                  </p>
                </div>
                <span className="text-[var(--fg)] shrink-0">€{stop.stayTotal}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Transport per leg */}
        <Card padding="lg">
          <h3 className="text-h3 text-[var(--fg)] mb-4">Transport by leg</h3>
          {legs.length > 0 ? (
            <ul className="space-y-3">
              {legs.map((leg) => (
                <li
                  key={leg.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <TransportModeIcon mode={leg.mode} size={16} />
                    <span className="text-[var(--fg)] truncate">
                      {leg.from} → {leg.to}
                    </span>
                    <span className="text-xs text-[var(--muted)] shrink-0">
                      {leg.durationHrs}h
                    </span>
                  </div>
                  <span className="text-[var(--fg)] shrink-0">€{leg.cost}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              A stay in your home city — no transport to budget for.
            </p>
          )}
        </Card>
      </div>

      <FootprintCard plan={plan} />

      {notes.length > 0 && (
        <Card padding="lg">
          <h3 className="text-h3 text-[var(--fg)] mb-3">Good to know</h3>
          <ul className="space-y-1.5">
            {notes.map((note, i) => (
              <li key={i} className="text-sm text-[var(--muted)]">
                {note}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
