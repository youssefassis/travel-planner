"use client";

import { motion } from "framer-motion";
import { Check, MessageSquareQuote, Scale, Star } from "lucide-react";
import Button from "@/components/ui/Button";
import { fadeInUp } from "@/components/motion";
import { StayOption, StayPick } from "../types";
import StayTypeAvatar from "./StayTypeAvatar";

type Props = {
  pick: StayPick;
  nights: number;
  onReserve: (stay: StayOption) => void;
};

/** One advisor pick: the stay, why, what guests say, and the true total. */
export default function StayPickCard({ pick, nights, onReserve }: Props) {
  const { stay, tag, reasons, reviewSummary, tradeOff, totalCost } = pick;

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
        <span className="flex items-center gap-1 text-sm font-semibold text-[var(--fg)]">
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          {stay.rating.toFixed(1)}
          <span className="font-normal text-xs text-[var(--muted)]">
            ({stay.reviewCount})
          </span>
        </span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <StayTypeAvatar type={stay.type} />
        <div className="min-w-0">
          <h3 className="text-h3 text-[var(--fg)] truncate">{stay.name}</h3>
          <p className="text-xs text-[var(--muted)]">
            {stay.neighborhood} · {stay.walkToCenterMin} min to center
          </p>
        </div>
      </div>

      <ul className="space-y-1.5 mb-3">
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

      <p className="flex items-start gap-2 text-xs text-[var(--muted)] italic mb-3">
        <MessageSquareQuote className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--primary)]" />
        {reviewSummary}
      </p>

      {tradeOff && (
        <p className="flex items-start gap-2 text-xs text-[var(--fg)] mb-3">
          <Scale className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--primary)]" />
          {tradeOff}
        </p>
      )}

      <div className="flex items-end justify-between gap-3 mt-auto pt-4 border-t border-[var(--border)]">
        <div>
          <p className="text-2xl font-serif font-bold text-[var(--primary)] leading-none">
            €{totalCost.total}
          </p>
          <p className="text-xs text-[var(--muted)] mt-1">
            {`${nights} ${nights === 1 ? "night" : "nights"} · incl. €${
              totalCost.taxes + totalCost.fees
            } taxes & fees`}
          </p>
        </div>
        <Button size="sm" onClick={() => onReserve(stay)}>
          Reserve
        </Button>
      </div>
    </motion.div>
  );
}
