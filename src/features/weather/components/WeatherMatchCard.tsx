"use client";

import { CalendarDays, Check, MapPin } from "lucide-react";
import Button from "@/components/ui/Button";
import MotionCard from "@/components/ui/MotionCard";
import { MONTH_FULL, TripWeatherMatch } from "../types";

type Props = {
  match: TripWeatherMatch;
  onSeeMonths: (cityId: string) => void;
};

/** Score → ring color (great / ok / poor), so higher fits read hotter. */
function scoreColor(score: number): string {
  if (score >= 75) return "var(--success)";
  if (score >= 50) return "var(--warning)";
  return "var(--danger)";
}

/** One ranked destination: the fit, the month evaluated, and the ways in. */
export default function WeatherMatchCard({ match, onSeeMonths }: Props) {
  const { city, monthIndex, score, verdict, reasons } = match;

  return (
    <MotionCard hover className="flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-h3 text-[var(--fg)] truncate">{city.name}</h3>
          <p className="flex items-center gap-1 text-xs text-[var(--muted)]">
            <MapPin className="w-3 h-3" />
            {city.country}
          </p>
        </div>
        <div
          className="flex flex-col items-center justify-center w-14 h-14 rounded-full text-white shrink-0"
          style={{ background: scoreColor(score) }}
          aria-label={`Weather fit ${score} out of 100`}
        >
          <span className="text-lg font-bold leading-none">{score}</span>
          <span className="text-[9px] uppercase tracking-wide opacity-90">fit</span>
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-sm font-semibold text-[var(--fg)] mb-3">
        <CalendarDays className="w-4 h-4 text-[var(--primary)]" />
        {verdict} · {MONTH_FULL[monthIndex]}
      </p>

      <ul className="space-y-1.5 mb-4">
        {reasons.map((reason) => (
          <li
            key={reason}
            className="flex items-start gap-2 text-small text-[var(--muted)]"
          >
            <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--primary)]" />
            {reason}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3 mt-auto pt-4 border-t border-[var(--border)]">
        <Button
          asLink
          href={`/planner?destination=${city.id}&month=${monthIndex}`}
          size="sm"
        >
          Plan this trip
        </Button>
        <button
          type="button"
          onClick={() => onSeeMonths(city.id)}
          className="text-sm font-medium text-[var(--primary)] hover:underline underline-offset-2"
        >
          Best months
        </button>
      </div>
    </MotionCard>
  );
}
