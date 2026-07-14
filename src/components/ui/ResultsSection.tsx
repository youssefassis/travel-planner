"use client";

import { ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * A collapsed-by-default disclosure for exhaustive result lists, so curated
 * picks stay the star and the full inventory is one click away.
 */
export default function ResultsSection({
  title,
  count,
  total,
  defaultOpen = false,
  toolbar,
  children,
}: {
  title: string;
  count: number;
  total: number;
  defaultOpen?: boolean;
  /** Sort + filter controls, shown only while open. */
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-2 text-left cursor-pointer group"
      >
        <h3 className="text-h3 text-[var(--fg)]">
          {title}
          <span className="ml-2 text-small font-normal text-[var(--muted)]">
            {count} of {total}
          </span>
        </h3>
        <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--muted)] group-hover:text-[var(--fg)] transition-colors">
          {open ? "Hide" : "Show all"}
          <ChevronDown
            size={16}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open && (
        <div className="mt-3">
          {toolbar && (
            <div className="flex flex-wrap items-center gap-3 mb-6">{toolbar}</div>
          )}
          {children}
        </div>
      )}
    </section>
  );
}
