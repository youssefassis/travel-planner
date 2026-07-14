"use client";

import { motion } from "framer-motion";
import { useTripIntentStore } from "../store/tripIntentStore";

const FilterCard = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5"
  >
    <label className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wide block mb-4">
      {label}
    </label>
    {children}
  </motion.div>
);

const SegmentButton = ({
  label,
  value,
  selected,
  onClick,
}: {
  label: string;
  value: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all text-sm ${
      selected
        ? "bg-[var(--primary)] text-white shadow-md"
        : "bg-[var(--card-subtle)] text-[var(--fg)] hover:bg-[var(--border)]"
    }`}
  >
    {label}
  </button>
);

export default function PlannerSidebar() {
  const { intent, patchIntent } = useTripIntentStore();

  const companions = intent.companions || "solo";
  const pace = intent.vibe?.pace || "balanced";

  return (
    <aside className="h-fit sticky top-24 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-serif font-bold">
          ✈
        </div>
        <div>
          <h3 className="font-serif font-bold text-[var(--fg)]">Build Your Trip</h3>
          <p className="text-xs text-[var(--muted)]">Customize preferences</p>
        </div>
      </motion.div>

      {/* Duration */}
      <FilterCard label="Trip Duration">
        <div className="space-y-3">
          <input
            type="number"
            min="1"
            max="30"
            value={intent.duration ?? 5}
            onChange={(e) => patchIntent({ ...intent, duration: Number(e.target.value) })}
            className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--card-subtle)] text-[var(--fg)] focus:outline-none focus:border-[var(--primary)]"
          />
          <p className="text-sm text-[var(--muted)]">{intent.duration ?? 5} days</p>
        </div>
      </FilterCard>

      {/* Companions */}
      <FilterCard label="Travel Style">
        <div className="flex gap-2">
          {[
            { label: "Solo", value: "solo" },
            { label: "Couple", value: "couple" },
            { label: "Group", value: "group" },
          ].map((option) => (
            <SegmentButton
              key={option.value}
              label={option.label}
              value={option.value}
              selected={companions === option.value}
              onClick={() => patchIntent({ ...intent, companions: option.value as any })}
            />
          ))}
        </div>
      </FilterCard>

      {/* Pace */}
      <FilterCard label="Travel Pace">
        <div className="flex gap-2">
          {[
            { label: "Chill", value: "chill" },
            { label: "Balanced", value: "balanced" },
            { label: "Intense", value: "intense" },
          ].map((option) => (
            <SegmentButton
              key={option.value}
              label={option.label}
              value={option.value}
              selected={pace === option.value}
              onClick={() =>
                patchIntent({
                  ...intent,
                  vibe: { ...intent.vibe, pace: option.value as any },
                })
              }
            />
          ))}
        </div>
      </FilterCard>

      {/* CTA Button */}
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-8 btn btn-primary text-white font-semibold py-3 shadow-lg"
      >
        Generate Itinerary
      </motion.button>
    </aside>
  );
}
