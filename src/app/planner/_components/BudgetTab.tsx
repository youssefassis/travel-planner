"use client";

import BudgetBreakdownView from "@/features/planner/components/BudgetBreakdownView";
import { Bookings, TripPlan } from "@/features/planner/types";

type Props = {
  trip: TripPlan;
  bookings: Bookings;
  onGoToFlights: () => void;
  onGoToStays: () => void;
};

export default function BudgetTab({ trip, bookings, onGoToFlights, onGoToStays }: Props) {
  return (
    <BudgetBreakdownView
      plan={trip}
      bookings={bookings}
      onGoToFlights={onGoToFlights}
      onGoToStays={onGoToStays}
    />
  );
}
