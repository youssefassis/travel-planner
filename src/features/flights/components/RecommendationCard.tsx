"use client";

import { motion } from "framer-motion";
import { Check, TrendingDown, TrendingUp, Minus } from "lucide-react";
import Button from "@/components/ui/Button";
import { fadeInUp } from "@/components/motion";
import { FlightOption, FlightPick } from "../types";
import AirlineAvatar from "./AirlineAvatar";
import FlightTimeline from "./FlightTimeline";

const SIGNAL_STYLES = {
  book: { icon: TrendingDown, classes: "text-emerald-600 dark:text-emerald-400" },
  fair: { icon: Minus, classes: "text-[var(--muted)]" },
  monitor: { icon: TrendingUp, classes: "text-amber-600 dark:text-amber-400" },
} as const;

type Props = {
  pick: FlightPick;
  travelers: number;
  onSelect: (flight: FlightOption) => void;
};

/** A tailored pick: the flight, its trade-offs, true cost, and fare advice. */
export default function RecommendationCard({ pick, travelers, onSelect }: Props) {
  const { flight, tag, reasons, signal } = pick;
  const Signal = SIGNAL_STYLES[signal.level];
  const totalWithBag = (flight.price + flight.bagFee) * travelers;

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -2 }}
      className="flex flex-col bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 transition-all hover:shadow-lg"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="text-caption px-2.5 py-1 rounded-full bg-[var(--primary)] text-white">
          {tag}
        </span>
        <div className="flex items-center gap-2 min-w-0">
          <AirlineAvatar airline={flight.airline} />
          <span className="text-sm font-medium text-[var(--fg)] truncate">
            {flight.airline}
          </span>
        </div>
      </div>

      <FlightTimeline flight={flight} />

      <ul className="mt-4 space-y-1.5">
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

      <p className={`flex items-start gap-2 text-xs mt-3 ${Signal.classes}`}>
        <Signal.icon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        {signal.text}
      </p>

      <div className="flex items-end justify-between gap-3 mt-4 pt-4 border-t border-[var(--border)]">
        <div>
          <p className="text-2xl font-serif font-bold text-[var(--primary)] leading-none">
            €{totalWithBag}
          </p>
          <p className="text-xs text-[var(--muted)] mt-1">
            total{travelers > 1 ? ` for ${travelers}` : ""} · incl. 1 checked bag
          </p>
        </div>
        <Button size="sm" onClick={() => onSelect(flight)}>
          Select
        </Button>
      </div>
    </motion.div>
  );
}
