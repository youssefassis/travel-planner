"use client";

import { ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";
import Price from "@/components/ui/Price";
import { BudgetBreakdown } from "../types";

/** Compact trip-budget rail card with a link to the full breakdown. */
export default function BudgetOverlay({
  budget,
  onViewDetails,
}: {
  budget: BudgetBreakdown;
  onViewDetails?: () => void;
}) {
  return (
    <Card padding="sm">
      <span className="text-caption text-[var(--muted)] block mb-1">Trip budget</span>
      <div className="flex items-end justify-between gap-2">
        <Price amount={`€${budget.total}`} size="md" sub={`€${budget.perDay}/day`} />
        {onViewDetails && (
          <button
            type="button"
            onClick={onViewDetails}
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:underline underline-offset-2"
          >
            Full breakdown
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </Card>
  );
}
