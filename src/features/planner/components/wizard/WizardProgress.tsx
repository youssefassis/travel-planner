"use client";

import { Check } from "lucide-react";
import { WIZARD_STEPS } from "../../lib/wizard";

/** Numbered step pills with connectors — the wizard's "you are here". */
export default function WizardProgress({
  currentIndex,
  isStepEnterable,
  onSelectStep,
}: {
  currentIndex: number;
  isStepEnterable: (index: number) => boolean;
  onSelectStep: (index: number) => void;
}) {
  return (
    <ol className="flex items-center justify-center gap-2 sm:gap-3">
      {WIZARD_STEPS.map((step, index) => {
        const isCurrent = index === currentIndex;
        const isDone = index < currentIndex;
        const clickable = !isCurrent && isStepEnterable(index);

        return (
          <li key={step.id} className="flex items-center gap-2 sm:gap-3">
            {index > 0 && (
              <span
                aria-hidden
                className={`h-px w-6 sm:w-10 ${
                  isDone || isCurrent ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                }`}
              />
            )}
            <button
              type="button"
              aria-current={isCurrent ? "step" : undefined}
              disabled={!clickable}
              onClick={() => clickable && onSelectStep(index)}
              className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 transition-all ${
                clickable ? "cursor-pointer hover:bg-[var(--card-subtle)]" : ""
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                  isCurrent
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : isDone
                      ? "bg-[var(--primary)]/15 text-[var(--primary)]"
                      : "bg-[var(--card-subtle)] text-[var(--muted)] border border-[var(--border)]"
                }`}
              >
                {isDone ? <Check size={13} strokeWidth={3} /> : index + 1}
              </span>
              <span
                className={`text-sm font-medium hidden sm:inline ${
                  isCurrent ? "text-[var(--fg)]" : "text-[var(--muted)]"
                }`}
              >
                {step.title}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
