"use client";

import { useState } from "react";
import {
  ArrowRight,
  CloudRain,
  Footprints,
  RefreshCw,
  Star,
  Ticket,
  UtensilsCrossed,
} from "lucide-react";
import { BudgetTier, Pace } from "@/domain/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Activity, CityStay, DayLoad, ItineraryDay, ScheduleItem } from "../types";
import { buildDaySchedule, formatClock } from "../engine";

const LOAD_STYLES: Record<DayLoad, string> = {
  relaxed: "bg-[var(--card-subtle)] text-[var(--muted)]",
  balanced: "bg-[var(--primary)]/10 text-[var(--primary)]",
  packed: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

type Props = {
  day: ItineraryDay | null;
  stops: CityStay[];
  pace: Pace;
  budgetTier: BudgetTier;
  /** Returns false when no alternative was available. */
  onSwap: (activityId: string) => boolean;
  /** Returns false when the day is already rain-proof. */
  onRainDay: () => boolean;
  /** Open the booking flow for an activity at its scheduled time. */
  onBook: (activity: Activity, startMin: number | null) => void;
};

function isBookable(activity: Activity): boolean {
  return activity.bookAhead || activity.category === "food";
}

const TimeCell = ({ item }: { item: ScheduleItem }) => (
  <div className="shrink-0 w-24 sm:w-32 text-xs text-[var(--muted)] pt-0.5">
    <span className="block font-medium text-[var(--fg)]">
      {formatClock(item.startMin)}
    </span>
    {formatClock(item.endMin)}
  </div>
);

const ActivityChips = ({ activity }: { activity: Activity }) => (
  <>
    {activity.mustSee && (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
        <Star className="w-2.5 h-2.5" /> Must-see
      </span>
    )}
    {activity.bookAhead && (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
        <Ticket className="w-2.5 h-2.5" /> Book ahead
      </span>
    )}
  </>
);

export default function DayDetails({
  day,
  stops,
  pace,
  budgetTier,
  onSwap,
  onRainDay,
  onBook,
}: Props) {
  const [message, setMessage] = useState<string | null>(null);

  if (!day) return null;

  const stop = stops.find((s) => s.cityId === day.cityId);
  const schedule = buildDaySchedule(day, pace);

  const handleSwap = (activityId: string) => {
    setMessage(
      onSwap(activityId) ? null : `No unvisited alternatives left in ${day.city}.`
    );
  };

  const handleRain = () => {
    setMessage(
      onRainDay()
        ? null
        : "This day is already indoors-friendly — nothing to swap."
    );
  };

  const BookButton = ({
    activity,
    startMin,
  }: {
    activity: Activity;
    startMin: number;
  }) =>
    isBookable(activity) ? (
      <Button
        size="sm"
        variant="outline"
        onClick={() => onBook(activity, startMin)}
        className="shrink-0"
      >
        {activity.category === "food" ? "Reserve" : "Book"}
      </Button>
    ) : null;

  return (
    <Card padding="lg">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="text-h3 text-[var(--fg)]">
            {day.label} · {day.city}
          </h3>
          <p className="text-small text-[var(--muted)] mt-0.5">
            {schedule.loadNote} · ~{schedule.busyHrs}h on your feet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-caption px-2.5 py-1 rounded-full ${LOAD_STYLES[schedule.load]}`}
          >
            {schedule.load}
          </span>
          <Button
            variant="secondary"
            size="sm"
            icon={<CloudRain className="w-3.5 h-3.5" />}
            iconPosition="left"
            onClick={handleRain}
          >
            Rainy day?
          </Button>
        </div>
      </div>

      {message && (
        <p className="text-xs text-[var(--muted)] mb-3">{message}</p>
      )}

      {/* Timed schedule */}
      <div className="divide-y divide-[var(--border)]">
        {schedule.items.map((item) =>
          item.kind === "meal" ? (
            <div
              key={`${item.label}-${item.startMin}`}
              className="flex items-start gap-3 py-3"
            >
              <TimeCell item={item} />
              <span className="shrink-0 w-7 h-7 rounded-full bg-[var(--card-subtle)] text-[var(--muted)] flex items-center justify-center">
                <UtensilsCrossed className="w-3.5 h-3.5" />
              </span>
              {item.activity ? (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-[var(--fg)]">
                        {item.label} · {item.activity.name}
                      </span>
                      <ActivityChips activity={item.activity} />
                    </div>
                    <p className="text-xs text-[var(--muted)]">
                      {item.activity.price > 0
                        ? `≈ €${item.activity.price} per person`
                        : "Free"}
                    </p>
                    <p className="text-xs text-[var(--muted)] italic mt-0.5">
                      {item.activity.why}
                    </p>
                  </div>
                  <BookButton activity={item.activity} startMin={item.startMin} />
                </>
              ) : (
                <p className="text-sm text-[var(--muted)] pt-1">
                  {item.label} — somewhere local nearby
                </p>
              )}
            </div>
          ) : (
            <div key={item.activity.id} className="flex items-start gap-3 py-3">
              <TimeCell item={item} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-[var(--fg)]">
                    {item.activity.name}
                  </span>
                  <ActivityChips activity={item.activity} />
                </div>
                <p className="text-xs text-[var(--muted)]">
                  <span className="capitalize">{item.activity.category}</span> ·{" "}
                  {item.activity.durationHrs}h ·{" "}
                  {item.activity.price > 0 ? `€${item.activity.price}` : "Free"}
                  {item.walkMin > 0 && (
                    <span className="inline-flex items-center gap-1 ml-2">
                      <Footprints className="w-3 h-3" /> {item.walkMin} min walk
                    </span>
                  )}
                </p>
                <p className="text-xs text-[var(--muted)] italic mt-0.5">
                  {item.activity.why}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-1.5">
                <BookButton activity={item.activity} startMin={item.startMin} />
                <button
                  type="button"
                  onClick={() => handleSwap(item.activity.id)}
                  aria-label={`Swap ${item.activity.name} for something else`}
                  title="Swap for something else"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--card-subtle)] hover:text-[var(--primary)] transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-[var(--border)]">
        {stop ? (
          <p className="text-small text-[var(--muted)]">
            {stop.days} {stop.days === 1 ? "day" : "days"} in {stop.city} · stay ≈ €
            {stop.stayPerNight}/night
          </p>
        ) : (
          <span />
        )}
        <Button
          asLink
          href={`/stays?city=${day.cityId}&budget=${budgetTier}${
            stop ? `&nights=${stop.days}` : ""
          }`}
          variant="accent"
          size="sm"
          icon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Find stays in {day.city}
        </Button>
      </div>
    </Card>
  );
}
