"use client";

import { Minus, Plus } from "lucide-react";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  /** Renders the centered value, e.g. (v) => `${v} days`. Defaults to String(v). */
  format?: (value: number) => string;
  className?: string;
};

export default function Stepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  format,
  className = "",
}: Props) {
  const decrease = () => onChange(Math.max(min, value - step));
  const increase = () => onChange(Math.min(max, value + step));

  const stepButtonClasses =
    "w-8 h-8 shrink-0 flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-[var(--border)] disabled:hover:text-[var(--fg)]";

  return (
    <div
      className={`flex items-center justify-between gap-2 px-1.5 py-1.5 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] ${className}`}
    >
      <button
        type="button"
        onClick={decrease}
        disabled={value <= min}
        aria-label="Decrease"
        className={stepButtonClasses}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <span
        aria-live="polite"
        className="text-sm font-medium text-[var(--fg)] text-center truncate"
      >
        {format ? format(value) : String(value)}
      </span>

      <button
        type="button"
        onClick={increase}
        disabled={value >= max}
        aria-label="Increase"
        className={stepButtonClasses}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
