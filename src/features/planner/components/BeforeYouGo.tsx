"use client";

import { Check, Ticket } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Activity, Bookings, ItineraryDay } from "../types";

type Props = {
  itinerary: ItineraryDay[];
  /** What the traveller has already reserved, keyed by activity id. */
  bookings?: Bookings;
  /** Open the booking flow for an item on the checklist. */
  onBook: (activity: Activity, dayLabel: string) => void;
};

/** The trip-wide "book these in advance" checklist — actionable, not a list. */
export default function BeforeYouGo({ itinerary, bookings = {}, onBook }: Props) {
  const checklist = itinerary.flatMap((day) =>
    day.activities
      .filter((a) => a.bookAhead)
      .map((activity) => ({ day, activity }))
  );

  if (checklist.length === 0) return null;

  const done = checklist.filter(({ activity }) => bookings[activity.id]).length;

  return (
    <Card padding="lg">
      <h3 className="text-h3 text-[var(--fg)] mb-1 flex items-center gap-2">
        <Ticket className="w-4 h-4 text-[var(--primary)]" />
        Before you go
      </h3>
      <p className="text-small text-[var(--muted)] mb-4">
        These sell out or queue badly — reserve them before you travel.
        {done > 0 && ` ${done} of ${checklist.length} done.`}
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
        {checklist.map(({ day, activity }) => {
          const booked = bookings[activity.id];
          return (
            <li
              key={activity.id}
              className="flex items-center justify-between gap-3 text-sm py-1.5 border-b border-[var(--border)] last:border-0 sm:[&:nth-last-child(2)]:border-0"
            >
              <span className="min-w-0">
                <span className="text-[var(--fg)] font-medium">{activity.name}</span>
                <span className="text-xs text-[var(--muted)] ml-2">
                  {day.label} · {day.city}
                </span>
              </span>
              <span className="shrink-0 flex items-center gap-2">
                <span className="text-xs text-[var(--muted)]">
                  {activity.price > 0 ? `€${activity.price}` : "Free entry"}
                </span>
                {booked ? (
                  <Badge tone="success" icon={<Check className="w-2.5 h-2.5" />}>
                    {booked.reference}
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onBook(activity, day.label)}
                  >
                    {activity.category === "food" ? "Reserve" : "Book"}
                  </Button>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
