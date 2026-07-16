"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  CloudRain,
  Footprints,
  Plus,
  RefreshCw,
  Star,
  Sun,
  Ticket,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { BudgetTier, Pace, Poi } from "@/domain/types";
import { getMonthNormal, MONTH_NAMES, tempWord } from "@/domain/climate";
import Button from "@/components/ui/Button";
import { Activity, CityStay, DayLoad, ItineraryDay, ScheduleItem } from "../types";
import { buildDaySchedule, formatClock, isReorderable } from "../engine";

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
  /** Selected travel month (0-11); when set, shows the city's expected weather. */
  travelMonth?: number;
  /** What "Add a stop" can offer — the city's POIs not yet in the plan. */
  availablePois: Poi[];
  /** Returns false when no alternative was available. */
  onSwap: (activityId: string) => boolean;
  /** Returns false when the day is already rain-proof. */
  onRainDay: () => boolean;
  /** Open the booking flow for an activity at its scheduled time. */
  onBook: (activity: Activity, startMin: number | null) => void;
  /** Remove one stop (or a planned meal) from this day. */
  onRemove: (activityId: string) => void;
  /** Add one of `availablePois` to this day. */
  onAdd: (poiId: string) => void;
  /** Move an activity one slot up/down. Returns false at the edges. */
  onMove: (activityId: string, direction: "up" | "down") => boolean;
  /** Move an activity to another day of the same city. */
  onMoveToDay: (activityId: string, toDayId: string) => boolean;
  /** Remove this whole day. Returns false when it's the trip's last day. */
  onRemoveDay: () => boolean;
};

function isBookable(activity: Activity): boolean {
  return activity.bookAhead || activity.category === "food";
}

/** The engine's scheduling classes — arrows only swap within a class. */
function reorderClass(activity: Activity): "daytime" | "nightlife" {
  return activity.category === "nightlife" ? "nightlife" : "daytime";
}

const iconButtonClasses =
  "w-7 h-7 flex items-center justify-center rounded-full text-[var(--muted)] transition-colors disabled:opacity-30 disabled:cursor-default";

const TimeCell = ({ item }: { item: ScheduleItem }) => (
  <div className="shrink-0 w-16 sm:w-20 text-right text-xs text-[var(--muted)] pt-1">
    <span className="block font-medium text-[var(--fg)]">
      {formatClock(item.startMin)}
    </span>
    {formatClock(item.endMin)}
  </div>
);

/** Timeline rail: a node on a vertical line that threads the day together. */
const Rail = ({
  first,
  last,
  meal,
}: {
  first: boolean;
  last: boolean;
  meal?: boolean;
}) => (
  <div className="shrink-0 w-7 flex flex-col items-center self-stretch">
    <span className={`w-px h-2.5 ${first ? "" : "bg-[var(--border)]"}`} />
    {meal ? (
      <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--card-subtle)] border border-[var(--border)] text-[var(--muted)] flex items-center justify-center">
        <UtensilsCrossed className="w-3 h-3" />
      </span>
    ) : (
      <span className="shrink-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--primary)] bg-[var(--card)]" />
    )}
    <span className={`w-px flex-1 ${last ? "" : "bg-[var(--border)]"}`} />
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
  travelMonth,
  availablePois,
  onSwap,
  onRainDay,
  onBook,
  onRemove,
  onAdd,
  onMove,
  onMoveToDay,
  onRemoveDay,
}: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [addingStop, setAddingStop] = useState(false);
  const [movingActivityId, setMovingActivityId] = useState<string | null>(null);

  if (!day) return null;

  const stop = stops.find((s) => s.cityId === day.cityId);
  const schedule = buildDaySchedule(day, pace);
  const weather =
    travelMonth != null ? getMonthNormal(day.cityId, travelMonth) : undefined;
  const otherSameCityDays =
    stop?.dayPlans.filter((d) => d.id !== day.id) ?? [];

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

  const handleRemoveDay = () => {
    setMessage(onRemoveDay() ? null : "A trip needs at least one day.");
  };

  /** Position among scheduling peers — used to disable edge arrows. */
  const peerPosition = (activity: Activity) => {
    const peers = day.activities.filter(
      (a) => isReorderable(a) && reorderClass(a) === reorderClass(activity)
    );
    return {
      index: peers.findIndex((a) => a.id === activity.id),
      count: peers.length,
    };
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

  const RemoveButton = ({ activity }: { activity: Activity }) => (
    <button
      type="button"
      onClick={() => onRemove(activity.id)}
      aria-label={`Remove ${activity.name} from this day`}
      title="Remove from this day"
      className={`${iconButtonClasses} hover:bg-[var(--card-subtle)] hover:text-red-500`}
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );

  /** Send an activity to another day of the same city via a small popover. */
  const MoveToDayButton = ({ activity }: { activity: Activity }) => {
    if (otherSameCityDays.length === 0) return null;
    const open = movingActivityId === activity.id;
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setMovingActivityId(open ? null : activity.id)}
          aria-expanded={open}
          aria-label={`Move ${activity.name} to another day`}
          title="Move to another day"
          className={`${iconButtonClasses} hover:bg-[var(--card-subtle)] hover:text-[var(--primary)] ${
            open ? "bg-[var(--card-subtle)] text-[var(--primary)]" : ""
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
        </button>
        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMovingActivityId(null)}
            />
            <div className="absolute right-0 top-8 z-20 min-w-[150px] rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-lg p-1.5">
              <p className="text-caption text-[var(--muted)] px-2 pt-1 pb-1.5">
                Move to
              </p>
              {otherSameCityDays.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setMovingActivityId(null);
                    onMoveToDay(activity.id, d.id);
                  }}
                  className="w-full text-left text-sm text-[var(--fg)] px-2 py-1.5 rounded-lg hover:bg-[var(--card-subtle)] transition-colors"
                >
                  {d.label}
                  <span className="text-xs text-[var(--muted)] ml-1.5">
                    {d.activities.length}{" "}
                    {d.activities.length === 1 ? "stop" : "stops"}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const ReorderButtons = ({ activity }: { activity: Activity }) => {
    if (!isReorderable(activity)) return null;
    const { index, count } = peerPosition(activity);
    return (
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => onMove(activity.id, "up")}
          disabled={index <= 0}
          aria-label={`Move ${activity.name} earlier`}
          title="Move earlier"
          className={`${iconButtonClasses} h-4 hover:text-[var(--primary)]`}
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onMove(activity.id, "down")}
          disabled={index === count - 1}
          aria-label={`Move ${activity.name} later`}
          title="Move later"
          className={`${iconButtonClasses} h-4 hover:text-[var(--primary)]`}
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  const WalkLabel = ({ walkMin }: { walkMin: number }) =>
    walkMin > 0 ? (
      <p className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] mb-1.5">
        <Footprints className="w-3 h-3" /> {walkMin} min walk
      </p>
    ) : null;

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-h3 text-[var(--fg)]">
            {day.label} · {day.city}
          </h3>
          <p className="text-small text-[var(--muted)] mt-0.5">
            {schedule.loadNote} · ~{schedule.busyHrs}h on your feet
          </p>
          {weather && (
            <p className="flex items-center gap-1.5 text-small text-[var(--muted)] mt-1">
              <Sun className="w-3.5 h-3.5 text-[var(--primary)]" />
              {MONTH_NAMES[travelMonth!]}: {tempWord(weather.high)}, {weather.high}° /{" "}
              {weather.low}° · {weather.rainDays} rainy{" "}
              {weather.rainDays === 1 ? "day" : "days"} · {weather.sunHours}h sun
            </p>
          )}
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
          <button
            type="button"
            onClick={handleRemoveDay}
            aria-label={`Remove ${day.label} from the trip`}
            title="Remove this day from the trip"
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium text-[var(--muted)] hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove day
          </button>
        </div>
      </div>

      {message && (
        <p className="text-xs text-[var(--muted)] mb-3">{message}</p>
      )}

      {/* Timed schedule as a day timeline */}
      <div>
        {schedule.items.map((item, i) => {
          const first = i === 0;
          const last = i === schedule.items.length - 1;

          if (item.kind === "meal") {
            return (
              <div
                key={`${item.label}-${item.startMin}`}
                className="flex gap-3"
              >
                <TimeCell item={item} />
                <Rail first={first} last={last} meal />
                {item.activity ? (
                  <>
                    <div className="flex-1 min-w-0 pb-6 pt-0.5">
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
                    <div className="shrink-0 flex items-center gap-1 pt-0.5 self-start">
                      <BookButton
                        activity={item.activity}
                        startMin={item.startMin}
                      />
                      <MoveToDayButton activity={item.activity} />
                      <RemoveButton activity={item.activity} />
                    </div>
                  </>
                ) : (
                  <p className="flex-1 text-sm text-[var(--muted)] pb-6 pt-1">
                    {item.label} — somewhere local nearby
                  </p>
                )}
              </div>
            );
          }

          return (
            <div key={item.activity.id} className="flex gap-3">
              <TimeCell item={item} />
              <Rail first={first} last={last} />
              <div className="flex-1 min-w-0 pb-6">
                <WalkLabel walkMin={item.walkMin} />
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
                </p>
                <p className="text-xs text-[var(--muted)] italic mt-0.5">
                  {item.activity.why}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-1 self-start">
                <BookButton activity={item.activity} startMin={item.startMin} />
                <ReorderButtons activity={item.activity} />
                <MoveToDayButton activity={item.activity} />
                <button
                  type="button"
                  onClick={() => handleSwap(item.activity.id)}
                  aria-label={`Swap ${item.activity.name} for something else`}
                  title="Swap for something else"
                  className={`${iconButtonClasses} hover:bg-[var(--card-subtle)] hover:text-[var(--primary)]`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <RemoveButton activity={item.activity} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Add a stop */}
      <div className="mt-3">
        {addingStop ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card-subtle)] p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-caption text-[var(--muted)]">
                Add to {day.label} · {day.city}
              </span>
              <button
                type="button"
                onClick={() => setAddingStop(false)}
                aria-label="Close the add-a-stop picker"
                className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--card)] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {availablePois.length > 0 ? (
              <ul className="divide-y divide-[var(--border)]">
                {availablePois.map((poi) => (
                  <li key={poi.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onAdd(poi.id);
                        setAddingStop(false);
                      }}
                      className="w-full flex items-center gap-3 py-2 text-left group"
                    >
                      <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--card)] text-[var(--muted)] group-hover:text-[var(--primary)] flex items-center justify-center transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                      <span className="flex-1 min-w-0 text-sm text-[var(--fg)] truncate">
                        {poi.name}
                      </span>
                      <span className="shrink-0 text-xs text-[var(--muted)]">
                        <span className="capitalize">{poi.category}</span> ·{" "}
                        {poi.price > 0 ? `€${poi.price}` : "Free"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--muted)] py-1">
                You&apos;ve planned everything we know in {day.city} — swap a stop
                instead, or add another city.
              </p>
            )}
          </div>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            iconPosition="left"
            onClick={() => setAddingStop(true)}
          >
            Add a stop
          </Button>
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
        <div className="flex items-center gap-4">
          <Link
            href={`/weather?city=${day.cityId}`}
            className="flex items-center gap-1.5 text-small font-medium text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
          >
            <Sun className="w-3.5 h-3.5" />
            Best time to visit
          </Link>
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
      </div>
    </div>
  );
}
