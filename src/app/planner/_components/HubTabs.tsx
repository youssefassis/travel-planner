"use client";

import {
  BedDouble,
  Calendar,
  Luggage,
  Map,
  Plane,
  Sun,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { HubTab } from "../_lib/tabs";

const TAB_META: Record<HubTab, { label: string; Icon: LucideIcon }> = {
  overview: { label: "Overview", Icon: Map },
  today: { label: "Today", Icon: Sun },
  itinerary: { label: "Itinerary", Icon: Calendar },
  flights: { label: "Flights", Icon: Plane },
  stays: { label: "Stays", Icon: BedDouble },
  budget: { label: "Budget", Icon: Wallet },
  prepare: { label: "Prepare", Icon: Luggage },
};

/** The sticky tab bar for the trip hub. Scrolls horizontally on mobile. */
export default function HubTabs({
  tabs,
  active,
  onChange,
}: {
  /** Which sections this trip has right now (see _lib/tabs.ts). */
  tabs: HubTab[];
  active: HubTab;
  onChange: (tab: HubTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Trip sections"
      className="flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1"
    >
      {tabs.map((value) => {
        const { label, Icon } = TAB_META[value];
        const selected = value === active;
        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(value)}
            className={`inline-flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
              selected
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--card-subtle)]"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
