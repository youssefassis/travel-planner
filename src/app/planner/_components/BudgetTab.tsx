"use client";

import BudgetBreakdownView from "@/features/planner/components/BudgetBreakdownView";
import { TripPlan } from "@/features/planner/types";

type Props = {
  trip: TripPlan;
  onGoToFlights: () => void;
  onGoToStays: () => void;
};

export default function BudgetTab({ trip, onGoToFlights, onGoToStays }: Props) {
  return (
    <BudgetBreakdownView
      plan={trip}
      onGoToFlights={onGoToFlights}
      onGoToStays={onGoToStays}
    />
  );
}
