import Link from "next/link";
import { Map } from "lucide-react";
import Button from "./Button";

/**
 * The way back into the trip flow from flights/stays. "linked" when the page
 * was opened from a plan's deep-link (the planner's intent store survives
 * client-side navigation, so the plan is still there); "standalone" otherwise.
 */
export default function PlannerCallout({
  variant,
}: {
  variant: "linked" | "standalone";
}) {
  if (variant === "linked") {
    return (
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 mb-8 p-4 rounded-xl border border-[var(--border)] bg-[var(--card-subtle)]">
        <p className="flex items-center gap-2 text-sm text-[var(--fg)]">
          <Map size={16} className="text-[var(--primary)] shrink-0" />
          Part of the trip you&apos;re planning.
        </p>
        <Button asLink href="/planner" variant="secondary" size="sm">
          Back to your trip
        </Button>
      </div>
    );
  }

  return (
    <p className="print:hidden text-sm text-[var(--muted)] mb-8">
      Booking for a whole trip?{" "}
      <Link
        href="/planner"
        className="font-medium text-[var(--primary)] hover:underline underline-offset-2"
      >
        Plan a trip
      </Link>{" "}
      and we&apos;ll line up flights and stays for every leg.
    </p>
  );
}
