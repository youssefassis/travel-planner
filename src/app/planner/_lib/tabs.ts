import { TripProgress } from "@/features/planner/lib/today";

/**
 * The hub's sections, staged by the moment the traveler is in: Today only
 * exists while the trip runs, Prepare only between setting dates and
 * departure. Everything else is always there.
 */
export type HubTab =
  | "overview"
  | "today"
  | "itinerary"
  | "flights"
  | "stays"
  | "budget"
  | "prepare";

export const ALL_TABS: HubTab[] = [
  "overview",
  "today",
  "itinerary",
  "flights",
  "stays",
  "budget",
  "prepare",
];

export function visibleTabs(phase: TripProgress["phase"]): HubTab[] {
  return ALL_TABS.filter((tab) => {
    if (tab === "today") return phase === "during";
    if (tab === "prepare") return phase === "before";
    return true;
  });
}

/** The tab a visit lands on when the URL didn't ask for one. */
export function defaultTab(phase: TripProgress["phase"]): HubTab {
  return phase === "during" ? "today" : "overview";
}

/** A `?tab=` value from the URL, or null when absent/unknown. */
export function parseTab(value: string | null): HubTab | null {
  return ALL_TABS.includes(value as HubTab) ? (value as HubTab) : null;
}

/**
 * Where the hub actually opens: what the URL asked for if that section
 * exists right now, the phase's default otherwise.
 */
export function resolveTab(
  requested: HubTab | null,
  phase: TripProgress["phase"],
): HubTab {
  if (requested && visibleTabs(phase).includes(requested)) return requested;
  return defaultTab(phase);
}
