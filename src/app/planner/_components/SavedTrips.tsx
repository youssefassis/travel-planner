"use client";

import { MapPin, Trash2 } from "lucide-react";
import Card from "@/components/ui/Card";
import ResultsHeader from "@/components/ui/ResultsHeader";
import Price from "@/components/ui/Price";
import { StoredTrip } from "@/features/planner/lib/tripStorage";

type Props = {
  trips: StoredTrip[];
  onOpen: (trip: StoredTrip) => void;
  onDelete: (id: string) => void;
};

/** Trips kept in this browser, offered before the wizard asks again. */
export default function SavedTrips({ trips, onOpen, onDelete }: Props) {
  if (trips.length === 0) return null;

  return (
    <section>
      <ResultsHeader
        title="Your saved trips"
        blurb="Kept in this browser — pick one up where you left it."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {trips.map((trip) => (
          <Card key={trip.id} padding="md" className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => onOpen(trip)}
              className="text-left group"
            >
              <span className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[var(--primary)]" />
                <span className="text-sm font-medium text-[var(--fg)] group-hover:text-[var(--primary)] transition-colors">
                  {trip.name}
                </span>
              </span>
            </button>

            <div className="mt-auto flex items-end justify-between gap-3">
              <Price
                amount={`€${trip.plan.budget.total}`}
                size="md"
                sub="per person"
              />
              <button
                type="button"
                onClick={() => onDelete(trip.id)}
                aria-label={`Delete ${trip.name}`}
                className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--danger)] transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
