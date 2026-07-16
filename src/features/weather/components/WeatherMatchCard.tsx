"use client";

import { motion } from "framer-motion";
import { CalendarDays, Check, MapPin } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { fadeInUp } from "@/components/motion";
import { MONTH_FULL, TripWeatherMatch } from "../types";

type Props = {
  match: TripWeatherMatch;
  onSeeMonths: (cityId: string) => void;
};

/** Score → accent ring color, so higher fits read hotter. */
function scoreColor(score: number): string {
  if (score >= 80) return "hsl(150 60% 42%)";
  if (score >= 60) return "hsl(90 55% 45%)";
  if (score >= 40) return "hsl(42 90% 50%)";
  return "hsl(20 75% 55%)";
}

/** One ranked destination: the fit, the month evaluated, and the ways in. */
export default function WeatherMatchCard({ match, onSeeMonths }: Props) {
  const { city, monthIndex, score, verdict, reasons } = match;

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -2 }}
      className="flex flex-col bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 transition-all hover:shadow-lg"
    >
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

      <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 border-t border-[var(--border)]">
        <Button asLink href={`/planner?destination=${city.id}`} size="sm">
          Plan a trip
        </Button>
        <button
          type="button"
          onClick={() => onSeeMonths(city.id)}
          className="text-sm font-medium text-[var(--primary)] hover:underline underline-offset-2"
        >
          Best months
        </button>
        <span className="text-[var(--border)]" aria-hidden>
          ·
        </span>
        <Link
          href={`/stays?city=${city.id}`}
          className="text-sm font-medium text-[var(--muted)] hover:text-[var(--fg)]"
        >
          Stays
        </Link>
        <Link
          href={`/flights?to=${city.id}`}
          className="text-sm font-medium text-[var(--muted)] hover:text-[var(--fg)]"
        >
          Flights
        </Link>
      </div>
    </motion.div>
  );
}
