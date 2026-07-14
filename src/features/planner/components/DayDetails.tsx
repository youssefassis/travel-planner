"use client";

import { ArrowRight } from "lucide-react";
import { BudgetTier } from "@/domain/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { CityStay, ItineraryDay } from "../types";

type Props = {
  day: ItineraryDay | null;
  stops: CityStay[];
  budgetTier: BudgetTier;
};

/** Detail panel for the selected day: activities + a stays deep link. */
export default function DayDetails({ day, stops, budgetTier }: Props) {
  if (!day) return null;

  const stop = stops.find((s) => s.cityId === day.cityId);

  return (
    <Card padding="lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-h3 text-[var(--fg)]">
            {day.label} · {day.city}
          </h3>
          {stop && (
            <p className="text-small text-[var(--muted)] mt-0.5">
              {stop.days} {stop.days === 1 ? "day" : "days"} in {stop.city} · stay ≈ €
              {stop.stayPerNight}/night
            </p>
          )}
        </div>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {day.activities.map((activity) => (
          <div
            key={activity.id}
            className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card-subtle)]"
          >
            <div className="text-sm font-medium text-[var(--fg)] mb-1">
              {activity.name}
            </div>
            <div className="flex justify-between text-xs text-[var(--muted)]">
              <span className="capitalize">{activity.category}</span>
              <span>{activity.price > 0 ? `€${activity.price}` : "Free"}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
