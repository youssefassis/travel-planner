"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { BudgetBreakdown } from "../types";

/** Compact trip-budget sidebar card; expands to the breakdown. */
export default function BudgetOverlay({ budget }: { budget: BudgetBreakdown }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full px-4 py-3 text-left"
      >
        <span className="text-caption text-[var(--muted)] block mb-0.5">
          Trip budget
        </span>
        <span className="flex items-center gap-2">
          <span className="text-xl font-serif font-bold text-[var(--primary)]">
            €{budget.total}
          </span>
          <span className="text-xs text-[var(--muted)]">€{budget.perDay}/day</span>
          <ChevronDown
            size={14}
            className={`ml-auto text-[var(--muted)] transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-1.5 border-t border-[var(--border)] pt-2.5">
          {(
            [
              ["Transport", budget.transport],
              ["Stays", budget.stays],
              ["Activities", budget.activities],
              ["Food", budget.food],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="flex justify-between gap-6 text-sm">
              <span className="text-[var(--muted)]">{label}</span>
              <span className="text-[var(--fg)]">€{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
