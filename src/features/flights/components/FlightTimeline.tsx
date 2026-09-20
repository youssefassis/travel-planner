"use client";

import { Plane } from "lucide-react";
import { FlightOption } from "../types";
import { formatDuration } from "../lib/format";

/** Visual departure — duration — arrival strip with a layover marker. */
export default function FlightTimeline({ flight }: { flight: FlightOption }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-right shrink-0">
        <p className="font-semibold text-data text-[var(--fg)] text-sm leading-tight">
          {flight.departureTime}
        </p>
        <p className="text-xs text-[var(--muted)]">{flight.from}</p>
      </div>

      <div className="relative flex-1 min-w-[80px]">
        <p className="text-xs text-data text-[var(--muted)] text-center mb-1">
          {formatDuration(flight.durationHrs)}
          {flight.stops > 0 ? ` · ${flight.stops} stop` : " · direct"}
        </p>
        <div className="relative h-px bg-[var(--border)]">
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
          {flight.stops > 0 && (
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-[var(--muted)] bg-[var(--card)]" />
          )}
          <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
          <Plane className="absolute left-1/2 -translate-x-1/2 -top-[7px] w-3.5 h-3.5 text-[var(--muted)] bg-[var(--card)]" />
        </div>
      </div>

      <div className="shrink-0">
        <p className="font-semibold text-data text-[var(--fg)] text-sm leading-tight">
          {flight.arrivalTime}
        </p>
        <p className="text-xs text-[var(--muted)]">{flight.to}</p>
      </div>
    </div>
  );
}
