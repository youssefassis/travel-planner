"use client";

import { Leaf } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { legEmissionsKg, savingVsFlying, totalEmissionsKg } from "@/domain/carbon";
import { allLegs } from "../engine";
import { TripPlan } from "../types";
import TransportModeIcon from "./TransportModeIcon";

/** Round the way a rough figure deserves: no false precision. */
function kg(value: number): string {
  return value >= 100 ? `${Math.round(value / 10) * 10}` : `${Math.round(value)}`;
}

/**
 * What the journeys cost in carbon, per traveler. Shown beside the money
 * because it's the same decision: the route you pick is the footprint you get.
 */
export default function FootprintCard({ plan }: { plan: TripPlan }) {
  const legs = allLegs(plan);
  if (legs.length === 0) return null;

  const total = totalEmissionsKg(legs);
  const saving = savingVsFlying(legs);
  const heaviest = Math.max(...legs.map(legEmissionsKg), 1);

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between gap-3 mb-1">
        <h3 className="text-h3 text-[var(--fg)] flex items-center gap-2">
          <Leaf className="w-4 h-4 text-[var(--success)]" />
          Carbon footprint
        </h3>
        {saving >= 0.15 && (
          <Badge tone="success">{Math.round(saving * 100)}% below flying</Badge>
        )}
      </div>

      <p className="text-small text-[var(--muted)] mb-4">
        Roughly <span className="text-[var(--fg)] font-medium">{kg(total)} kg CO₂e</span>{" "}
        per traveller, for the journeys between cities.
      </p>

      <ul className="space-y-3">
        {legs.map((leg) => {
          const emissions = legEmissionsKg(leg);
          return (
            <li key={leg.id}>
              <div className="flex items-center justify-between gap-3 text-sm mb-1">
                <span className="flex items-center gap-2 min-w-0 text-[var(--fg)]">
                  <TransportModeIcon mode={leg.mode} size={16} />
                  <span className="truncate">
                    {leg.from} → {leg.to}
                  </span>
                </span>
                <span className="text-[var(--muted)] shrink-0">
                  {kg(emissions)} kg
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--card-subtle)] overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    leg.mode === "flight"
                      ? "bg-[var(--warning)]"
                      : "bg-[var(--success)]"
                  }`}
                  style={{ width: `${(emissions / heaviest) * 100}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-caption text-[var(--muted)] mt-4">
        European averages per passenger-kilometre; a car assumes two people in
        it. Approximate, like every figure here.
      </p>
    </Card>
  );
}
