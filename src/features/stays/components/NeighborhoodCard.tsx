"use client";

import { motion } from "framer-motion";
import { Check, MapPin } from "lucide-react";
import { fadeInUp } from "@/components/motion";
import { NeighborhoodPick } from "../types";

/** One recommended area and why it fits the traveler's style. */
export default function NeighborhoodCard({ pick }: { pick: NeighborhoodPick }) {
  const { neighborhood, reasons, avgPricePerNight, stayCount } = pick;

  return (
    <motion.div
      variants={fadeInUp}
      className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className="text-h3 text-[var(--fg)] flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[var(--primary)]" />
          {neighborhood.name}
        </h3>
        {avgPricePerNight > 0 && (
          <span className="text-xs text-[var(--muted)] whitespace-nowrap mt-1.5">
            ≈ €{avgPricePerNight}/night
          </span>
        )}
      </div>
      <p className="text-small text-[var(--muted)] mb-4">{neighborhood.tagline}</p>

      <ul className="space-y-1.5">
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

      {stayCount > 0 && (
        <p className="text-xs text-[var(--muted)] mt-4 pt-3 border-t border-[var(--border)]">
          {stayCount} {stayCount === 1 ? "stay" : "stays"} available in this area
        </p>
      )}
    </motion.div>
  );
}
