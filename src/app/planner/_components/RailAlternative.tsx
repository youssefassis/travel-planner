"use client";

import { TrainFront } from "lucide-react";
import { legEmissionsKg } from "@/domain/carbon";
import { getCorridor } from "@/domain/corridors";
import { TransportLeg } from "@/features/planner/types";

/**
 * Where a flight has a train that genuinely runs, say so. It's slower and
 * that's the trade — but the traveller can only weigh it if they're told.
 */
export default function RailAlternative({ leg }: { leg: TransportLeg }) {
  if (leg.mode !== "flight") return null;

  const rail = getCorridor(leg.fromCityId, leg.toCityId)?.railAlternative;
  if (!rail) return null;

  const flying = legEmissionsKg(leg);
  const byTrain = legEmissionsKg({ mode: "train", distanceKm: leg.distanceKm });
  const times = Math.round(flying / Math.max(byTrain, 1));
  const longer = Math.round((rail.durationHrs - leg.durationHrs) * 10) / 10;

  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-[var(--muted)] mb-4">
      <TrainFront className="w-4 h-4 text-[var(--success)]" />
      <span>
        There&apos;s a train: <span className="text-[var(--fg)]">{rail.durationHrs}h</span>{" "}
        for about <span className="text-[var(--fg)]">€{rail.fare}</span> — {longer}h
        longer, and{" "}
        <span className="text-[var(--success)]">
          {times > 1 ? `a ${ordinal(times)} of the carbon` : "less carbon"}
        </span>
        .
      </span>
    </p>
  );
}

function ordinal(times: number): string {
  if (times <= 2) return "half";
  if (times === 3) return "third";
  if (times === 4) return "quarter";
  return `${times}th`;
}
