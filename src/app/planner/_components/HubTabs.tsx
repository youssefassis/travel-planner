"use client";

import { Calendar, Plane, BedDouble, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type HubTab = "itinerary" | "flights" | "stays" | "budget";

export const HUB_TABS: { value: HubTab; label: string; Icon: LucideIcon }[] = [
  { value: "itinerary", label: "Itinerary", Icon: Calendar },
  { value: "flights", label: "Flights", Icon: Plane },
  { value: "stays", label: "Stays", Icon: BedDouble },
  { value: "budget", label: "Budget", Icon: Wallet },
];

/** The sticky tab bar for the trip hub. Scrolls horizontally on mobile. */
export default function HubTabs({
  active,
  onChange,
}: {
  active: HubTab;
  onChange: (tab: HubTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Trip sections"
      className="flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1"
    >
      {HUB_TABS.map(({ value, label, Icon }) => {
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
