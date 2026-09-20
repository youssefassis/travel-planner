"use client";

import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Card from "@/components/ui/Card";
import { DUR, EASE_OUT } from "@/components/motion";
import { ItineraryDay, TransportLeg } from "../types";
import DayTimeline from "./DayTimeline";

const arrowClasses =
  "shrink-0 w-9 h-9 flex items-center justify-center rounded-full border border-[var(--border)] text-[var(--fg)] transition-colors hover:border-[var(--primary)]/40 hover:text-[var(--primary)] disabled:opacity-30 disabled:cursor-default disabled:hover:border-[var(--border)] disabled:hover:text-[var(--fg)]";

/**
 * One card for the whole day-by-day experience: the day strip with
 * back/next controls on top, the selected day's details flowing below it.
 */
export default function DayByDay({
  itinerary,
  activeDayId,
  setActiveDayId,
  legs,
  startDate,
  children,
}: {
  itinerary: ItineraryDay[];
  activeDayId: string | null;
  setActiveDayId: (id: string) => void;
  legs: TransportLeg[];
  /** First day of the trip; when set, the strip shows real dates. */
  startDate?: string;
  /** The selected day's content — re-animated on every day change. */
  children: ReactNode;
}) {
  const index = itinerary.findIndex((d) => d.id === activeDayId);
  const step = (delta: number) => {
    const target = itinerary[index + delta];
    if (target) setActiveDayId(target.id);
  };

  return (
    <Card padding="none">
      <div className="flex items-center gap-3 px-4 sm:px-5 pt-4 pb-2 border-b border-[var(--border)]">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={index <= 0}
          aria-label="Previous day"
          className={arrowClasses}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <DayTimeline
            itinerary={itinerary}
            activeDayId={activeDayId}
            setActiveDayId={setActiveDayId}
            legs={legs}
            startDate={startDate}
          />
        </div>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={index === -1 || index === itinerary.length - 1}
          aria-label="Next day"
          className={arrowClasses}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeDayId ?? "no-day"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: DUR.base, ease: EASE_OUT }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </Card>
  );
}
