"use client";

import { Pace } from "@/domain/types";
import { formatDateRange, formatDayDate } from "@/domain/dates";
import { dateOfDay, endDate } from "../lib/tripDates";
import { ScheduleItem, TripPlan } from "../types";

/** A stable React key for any kind of scheduled item. */
function scheduleKey(item: ScheduleItem): string {
  if (item.kind === "activity") return item.activity.id;
  if (item.kind === "travel") return `${item.direction}-${item.travel.legId}`;
  return `${item.label}-${item.startMin}`;
}
import { buildDaySchedule, formatClock } from "../engine";

/**
 * The print/PDF layout: every day's timed schedule, the budget, and the
 * booking checklist on plain paper-friendly styling. Hidden on screen and
 * revealed by the print stylesheet (the interactive app hides itself).
 */
export default function PrintItinerary({
  plan,
  pace,
  startDate,
}: {
  plan: TripPlan;
  pace: Pace;
  /** First day of the trip; when set, every day is printed with its date. */
  startDate?: string;
}) {
  const route = plan.stops.map((s) => s.city).join(" → ");
  const lastDay = endDate(startDate, plan.itinerary.length);
  const bookings = plan.itinerary.flatMap((day) =>
    day.activities.filter((a) => a.bookAhead).map((activity) => ({ day, activity }))
  );

  return (
    <div className="hidden print:block text-black">
      <h1 className="text-2xl font-bold mb-1">Trip plan: {route}</h1>
      <p className="text-sm mb-6">
        {startDate && lastDay && `${formatDateRange(startDate, lastDay)} · `}
        {plan.itinerary.length} days · budget ≈ €{plan.budget.total} per person (€
        {plan.budget.perDay}/day) · transport €{plan.budget.transport} · stays €
        {plan.budget.stays} · activities €{plan.budget.activities} · food €
        {plan.budget.food}
        {plan.budget.travelers > 1 &&
          ` · €${plan.budget.partyTotal} for ${plan.budget.travelers}`}
      </p>

      {plan.itinerary.map((day, i) => {
        const schedule = buildDaySchedule(day, pace);
        const date = dateOfDay(startDate, i + 1);
        return (
          <div key={day.id} className="mb-5 break-inside-avoid">
            <h2 className="text-base font-bold border-b border-black pb-1 mb-2">
              {day.label}
              {date && ` · ${formatDayDate(date)}`} · {day.city}
            </h2>
            <table className="w-full text-sm">
              <tbody>
                {schedule.items.map((item) => (
                  <tr key={scheduleKey(item)}>
                    <td className="align-top w-20 pr-3 whitespace-nowrap">
                      {formatClock(item.startMin)}
                    </td>
                    <td className="pb-1">
                      {item.kind === "travel" ? (
                        <>
                          <em>
                            {item.direction === "arrive" ? "Travel to" : "Home to"}{" "}
                            {item.travel.to}
                          </em>
                          <span className="text-xs">
                            {" — "}
                            {item.travel.durationHrs}h {item.travel.mode} from{" "}
                            {item.travel.from}
                          </span>
                        </>
                      ) : item.kind === "activity" ? (
                        <>
                          {item.activity.name}
                          {item.activity.mustSee ? " ★" : ""}
                          <span className="text-xs">
                            {" — "}
                            {item.activity.durationHrs}h
                            {item.activity.price > 0 ? ` · €${item.activity.price}` : ""}
                            {item.activity.bookAhead ? " · book ahead" : ""}
                          </span>
                        </>
                      ) : item.activity ? (
                        <>
                          <em>{item.label}</em> · {item.activity.name}
                          <span className="text-xs">
                            {item.activity.price > 0
                              ? ` — ≈€${item.activity.price} pp`
                              : ""}
                            {item.activity.bookAhead ? " · book ahead" : ""}
                          </span>
                        </>
                      ) : (
                        <em>{item.label}</em>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {bookings.length > 0 && (
        <div className="break-inside-avoid">
          <h2 className="text-base font-bold border-b border-black pb-1 mb-2">
            Book before you go
          </h2>
          <ul className="text-sm list-disc pl-5">
            {bookings.map(({ day, activity }) => (
              <li key={activity.id}>
                {activity.name} ({day.label} · {day.city})
                {activity.price > 0 ? ` — €${activity.price}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
