"use client";

import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Option<T extends string> = {
  label: string;
  value: T;
};

type Props<T extends string> = {
  /** Small uppercase eyebrow above the value, e.g. "Who". */
  label: string;
  icon: ReactNode;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/**
 * A click-to-cycle option field (icon tile + eyebrow + animated value +
 * step dots), matching the hero search card's "When / Who / Budget" cells.
 */
export default function CycleField<T extends string>({
  label,
  icon,
  options,
  value,
  onChange,
  className = "",
}: Props<T>) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const current = options[index];

  const cycle = () => onChange(options[(index + 1) % options.length].value);

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`${label}: ${current.label}. Click to change.`}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-left transition-colors hover:border-[var(--primary)] ${className}`}
    >
      <span className="shrink-0 w-9 h-9 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
        {icon}
      </span>

      <span className="flex-1 min-w-0">
        <span className="block text-[10px] text-[var(--muted)] uppercase tracking-widest font-semibold mb-0.5">
          {label}
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={current.value}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.18 }}
            className="block text-sm font-medium text-[var(--fg)] truncate"
          >
            {current.label}
          </motion.span>
        </AnimatePresence>
      </span>

      <span className="shrink-0 flex gap-1">
        {options.map((option) => (
          <span
            key={option.value}
            className={`rounded-full transition-all duration-300 ${
              option.value === current.value
                ? "w-3 h-1.5 bg-[var(--primary)]"
                : "w-1.5 h-1.5 bg-[var(--border)]"
            }`}
          />
        ))}
      </span>
    </button>
  );
}
