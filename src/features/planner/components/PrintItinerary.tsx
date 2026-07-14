"use client";

import { Pace } from "@/domain/types";
import { TripPlan } from "../types";
import { buildDaySchedule, formatClock } from "../engine";

/**
 * The print/PDF layout: every day's timed schedule, the budget, and the
 * booking checklist on plain paper-friendly styling. Hidden on screen and
 * revealed by the print stylesheet (the interactive app hides itself).
 */
export default function PrintItinerary({ plan, pace }: { plan: TripPlan; pace: Pace }) {
  const route = plan.stops.map((s) => s.city).join(" → ");
  const bookings = plan.itinerary.flatMap((day) =>
    day.activities.filter((a) => a.bookAhead).map((activity) => ({ day, activity }))
  );

  return (
    <div className="hidden print:block text-black">
      <h1 className="text-2xl font-bold mb-1">Trip plan: {route}</h1>
      <p className="text-sm mb-6">
        {plan.itinerary.length} days · budget ≈ €{plan.budget.total} (€
        {plan.budget.perDay}/day) · transport €{plan.budget.transport} · stays €
        {plan.budget.stays} · activities €{plan.budget.activities} · food €
        {plan.budget.food}
      </p>

      {plan.itinerary.map((day) => {
        const schedule = buildDaySchedule(day, pace);
        return (
          <div key={day.id} className="mb-5 break-inside-avoid">
            <h2 className="text-base font-bold border-b border-black pb-1 mb-2">
              {day.label} · {day.city}
            </h2>
            <table className="w-full text-sm">
              <tbody>
                {schedule.items.map((item) => (
                  <tr key={item.kind === "activity" ? item.activity.id : `${item.label}-${item.startMin}`}>
                    <td className="align-top w-20 pr-3 whitespace-nowrap">
                      {formatClock(item.startMin)}
                    </td>
                    <td className="pb-1">
                      {item.kind === "activity" ? (
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
