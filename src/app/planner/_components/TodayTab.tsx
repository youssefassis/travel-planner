"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Check, MapPin, Route } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Price from "@/components/ui/Price";
import ResultsHeader from "@/components/ui/ResultsHeader";
import { formatDayDate } from "@/domain/dates";
import { buildDaySchedule, formatClock } from "@/features/planner/engine";
import {
  localISODate,
  localMinutes,
  nowAndNext,
  tripProgress,
} from "@/features/planner/lib/today";
import { dateOfDay } from "@/features/planner/lib/tripDates";
import {
  Bookings,
  ScheduleItem,
  TripIntent,
  TripPlan,
} from "@/features/planner/types";

type Props = {
  trip: TripPlan;
  intent: TripIntent;
  bookings: Bookings;
  /** Jump to a day on the Itinerary tab. */
  onOpenDay: (dayId: string) => void;
  /** Send the traveller to the wizard to put dates on the trip. */
  onEdit: () => void;
};

/**
 * The trip as it is being lived rather than planned: which day you're on,
 * what's happening now, and what to head to next.
 *
 * The clock is read here and nowhere else in the planner, and it ticks every
 * minute so "now" stays true without the traveller refreshing.
 */
export default function TodayTab({
  trip,
  intent,
  bookings,
  onOpenDay,
  onEdit,
}: Props) {
  // Safe to read the clock during render: a plan has to exist before the hub
  // mounts, and that only ever happens client-side, so there is no server
  // render to disagree with.
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(tick);
  }, []);

  const progress = tripProgress(trip, intent.startDate, localISODate(now));

  if (progress.phase === "undated") {
    return (
      <EmptyState
        title="This trip doesn't have dates yet"
        body="Add a start date and this becomes a live view of the day you're on — what's now, what's next, and how far it is."
        action={
          <Button variant="secondary" onClick={onEdit} icon={<CalendarDays size={14} />}>
            Add dates
          </Button>
        }
      />
    );
  }

  if (progress.phase === "before") {
    const { daysUntil, firstDay } = progress;
    return (
      <EmptyState
        title={
          daysUntil === 1
            ? "You leave tomorrow"
            : `${daysUntil} days until you leave`
        }
        body={`Day 1 starts in ${firstDay.city}${
          firstDay.arrival ? `, after a ${firstDay.arrival.durationHrs}h ${firstDay.arrival.mode}` : ""
        }.`}
        action={
          <Button
            variant="secondary"
            onClick={() => onOpenDay(firstDay.id)}
            icon={<ArrowRight size={14} />}
            iconPosition="right"
          >
            See day 1
          </Button>
        }
      />
    );
  }

  if (progress.phase === "after") {
    const { daysSince } = progress;
    return (
      <EmptyState
        title="That's a wrap"
        body={`The trip ended ${
          daysSince === 1 ? "yesterday" : `${daysSince} days ago`
        }. It's still here whenever you want to look back — or copy it as the start of the next one.`}
        action={
          <Button variant="secondary" onClick={onEdit} icon={<Route size={14} />}>
            Plan another
          </Button>
        }
      />
    );
  }

  const { day, dayNumber, dayCount } = progress;
  const date = dateOfDay(intent.startDate, dayNumber);
  const schedule = buildDaySchedule(day, intent.vibe.pace);
  const { current, next, done, upcoming } = nowAndNext(schedule, localMinutes(now));
  const remaining = upcoming.filter((item) => item !== next);

  return (
    <div className="space-y-8">
      <div>
        <ResultsHeader
          title={`Day ${dayNumber} of ${dayCount} · ${day.city}`}
          blurb={
            date
              ? `${formatDayDate(date)} · ${schedule.loadNote.toLowerCase()}`
              : schedule.loadNote
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Slot
            label="Right now"
            item={current}
            bookings={bookings}
            empty="Nothing scheduled — you're between stops."
            highlight
          />
          <Slot
            label="Up next"
            item={next}
            bookings={bookings}
            empty="That's everything planned for today."
          />
        </div>
      </div>

      {remaining.length > 0 && (
        <section>
          <h3 className="text-h3 text-[var(--fg)] mb-3">Later today</h3>
          <ul className="space-y-1">
            {remaining.map((item) => (
              <li
                key={itemKey(item)}
                className="flex items-baseline gap-3 text-sm py-1.5 border-b border-[var(--border)] last:border-0"
              >
                <span className="shrink-0 w-16 text-[var(--muted)]">
                  {formatClock(item.startMin)}
                </span>
                <span className="text-[var(--fg)]">{itemTitle(item)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {done.length > 0 && (
        <section>
          <h3 className="text-h3 text-[var(--fg)] mb-3">
            Done today · {done.length}
          </h3>
          <ul className="space-y-1">
            {done.map((item) => (
              <li
                key={itemKey(item)}
                className="flex items-baseline gap-3 text-sm py-1.5 text-[var(--muted)]"
              >
                <Check className="w-3.5 h-3.5 shrink-0 self-center text-[var(--success)]" />
                <span className="shrink-0 w-14">{formatClock(item.startMin)}</span>
                <span className="line-through">{itemTitle(item)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="pt-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onOpenDay(day.id)}
          icon={<ArrowRight size={14} />}
          iconPosition="right"
        >
          Open the full day
        </Button>
      </div>
    </div>
  );
}

/* ─── Pieces ────────────────────────────────────────────────────── */

function Slot({
  label,
  item,
  bookings,
  empty,
  highlight = false,
}: {
  label: string;
  item: ScheduleItem | null;
  bookings: Bookings;
  empty: string;
  highlight?: boolean;
}) {
  const booking =
    item?.kind === "activity" ? bookings[item.activity.id] : undefined;

  return (
    <Card
      padding="lg"
      className={highlight ? "border-[var(--primary)]/40" : undefined}
    >
      <span className="text-caption text-[var(--muted)] block mb-2">{label}</span>

      {item ? (
        <>
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="text-h3 text-[var(--fg)]">{itemTitle(item)}</h3>
            {booking && (
              <Badge tone="success" icon={<Check className="w-2.5 h-2.5" />}>
                {booking.reference}
              </Badge>
            )}
          </div>

          <p className="text-small text-[var(--muted)]">
            {formatClock(item.startMin)} – {formatClock(item.endMin)}
            {item.kind === "activity" && ` · ${item.activity.category}`}
          </p>

          {item.kind === "activity" && (
            <>
              <p className="text-small text-[var(--muted)] italic mt-2">
                {item.activity.why}
              </p>
              <div className="mt-4 flex items-end justify-between gap-3">
                <Price
                  amount={item.activity.price > 0 ? `€${item.activity.price}` : "Free"}
                  size="md"
                  sub="per person"
                />
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${item.activity.location.lat},${item.activity.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--primary)] hover:underline underline-offset-2"
                >
                  <MapPin className="w-3.5 h-3.5" /> Directions
                </a>
              </div>
            </>
          )}

          {item.kind === "travel" && (
            <p className="text-small text-[var(--muted)] mt-2">
              {item.travel.durationHrs}h {item.travel.mode} from {item.travel.from}
            </p>
          )}
        </>
      ) : (
        <p className="text-[var(--muted)]">{empty}</p>
      )}
    </Card>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <h2 className="text-h2 text-[var(--fg)] mb-2">{title}</h2>
      <p className="text-[var(--muted)] mb-6">{body}</p>
      {action}
    </div>
  );
}

function itemTitle(item: ScheduleItem): string {
  if (item.kind === "activity") return item.activity.name;
  if (item.kind === "travel") {
    return item.direction === "arrive"
      ? `Travel to ${item.travel.to}`
      : `Head home to ${item.travel.to}`;
  }
  return item.activity ? `${item.label} · ${item.activity.name}` : item.label;
}

function itemKey(item: ScheduleItem): string {
  if (item.kind === "activity") return item.activity.id;
  if (item.kind === "travel") return `${item.direction}-${item.travel.legId}`;
  return `${item.label}-${item.startMin}`;
}
