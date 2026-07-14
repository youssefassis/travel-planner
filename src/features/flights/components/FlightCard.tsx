"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { fadeInUp } from "@/components/motion";
import { FlightOption } from "../types";
import AirlineAvatar from "./AirlineAvatar";
import FlightTimeline from "./FlightTimeline";

type Props = {
  flight: FlightOption;
  travelers: number;
  badges?: string[];
  selected?: boolean;
  onSelect: (flight: FlightOption) => void;
};

export default function FlightCard({
  flight,
  travelers,
  badges = [],
  selected = false,
  onSelect,
}: Props) {
  const totalWithBag = (flight.price + flight.bagFee) * travelers;

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -2 }}
      className={`bg-[var(--card)] border rounded-xl p-5 transition-all hover:shadow-lg ${
        selected
          ? "border-transparent ring-2 ring-[var(--primary)]"
          : "border-[var(--border)]"
      }`}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1.6fr_auto] lg:gap-6 items-center">
        {/* Airline */}
        <div className="flex items-center gap-3">
          <AirlineAvatar airline={flight.airline} />
          <div className="min-w-0">
            <p className="font-semibold text-[var(--fg)] text-sm truncate">
              {flight.airline}
            </p>
            {badges.length > 0 && (
              <span className="inline-flex gap-1.5 mt-1">
                {badges.map((badge) => (
                  <span
                    key={badge}
                    className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]"
                  >
                    {badge}
                  </span>
                ))}
              </span>
            )}
          </div>
        </div>

        {/* Timeline */}
        <FlightTimeline flight={flight} />

        {/* Price & select */}
        <div className="flex items-center justify-between lg:flex-col lg:items-end gap-2 border-t border-[var(--border)] pt-4 lg:border-0 lg:pt-0">
          <div className="lg:text-right">
            <p className="text-2xl font-serif font-bold text-[var(--primary)] leading-none">
              €{flight.price}
            </p>
            <p className="text-xs text-[var(--muted)] mt-1">
              €{totalWithBag} total
              {travelers > 1 ? ` · ${travelers} travelers` : ""} · incl. 1 bag
            </p>
          </div>
          <Button size="sm" variant={selected ? "secondary" : "primary"} onClick={() => onSelect(flight)}>
            {selected ? "Selected" : "Select"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
