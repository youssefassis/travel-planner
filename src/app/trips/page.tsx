"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, MapPin, PencilLine, Trash2 } from "lucide-react";

import { formatDateRange } from "@/domain/dates";
import {
  removeTrip,
  saveTrips,
  tripName,
} from "@/features/planner/lib/tripStorage";
import { endDate } from "@/features/planner/lib/tripDates";
import { refreshTripShelf, useTripShelf } from "@/features/planner/lib/useTripShelf";
import { localISODate } from "@/features/planner/lib/today";
import { TripIntent, TripPlan } from "@/features/planner/types";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import Price from "@/components/ui/Price";
import ResultsHeader from "@/components/ui/ResultsHeader";
import { tripStatus } from "./_lib/status";

/** Route · days · dates, under the trip's name. */
function TripFacts({ plan, intent }: { plan: TripPlan; intent: TripIntent }) {
  const days = plan.itinerary.length;
  const lastDay = endDate(intent.startDate, days);
  return (
    <p className="text-xs text-[var(--muted)]">
      {days} {days === 1 ? "day" : "days"}
      {intent.startDate && lastDay && (
        <span className="text-data"> · {formatDateRange(intent.startDate, lastDay)}</span>
      )}
    </p>
  );
}

function TripCard({
  plan,
  intent,
  name,
  todayISO,
  onOpen,
  onDelete,
}: {
  plan: TripPlan;
  intent: TripIntent;
  name: string;
  todayISO: string;
  onOpen: () => void;
  onDelete?: () => void;
}) {
  const status = tripStatus(plan, intent, todayISO);
  return (
    <Card padding="md" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={onOpen} className="text-left group min-w-0">
          <span className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[var(--primary)]" />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-[var(--fg)] group-hover:text-[var(--primary)] transition-colors">
                {name}
              </span>
              <TripFacts plan={plan} intent={intent} />
            </span>
          </span>
        </button>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>

      <div className="mt-auto flex items-end justify-between gap-3">
        <Price amount={`€${plan.budget.total}`} size="md" sub="per person" />
        <div className="flex items-center gap-3">
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              aria-label={`Delete ${name}`}
              className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--danger)] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          )}
          <Button size="sm" onClick={onOpen}>
            Open
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function TripsPage() {
  const router = useRouter();

  const { trips, draft, ready } = useTripShelf();

  // Read once per visit — status chips don't need a ticking clock.
  const [todayISO] = useState(() => localISODate(new Date()));

  const handleDelete = (id: string) => {
    saveTrips(removeTrip(trips, id));
    refreshTripShelf();
  };

  // The draft mirrors whatever the planner has open — when that's a trip
  // already saved as-is, showing it twice would read as two trips.
  const draftIsSaved =
    draft !== null &&
    trips.some(
      (trip) =>
        JSON.stringify(trip.plan) === JSON.stringify(draft.plan) &&
        JSON.stringify(trip.bookings ?? {}) === JSON.stringify(draft.bookings ?? {}),
    );
  const showDraft = draft !== null && !draftIsSaved;

  const empty = ready && trips.length === 0 && !draft;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="pt-28 md:pt-32 pb-16 sm:pb-20">
        <Container size="wide">
          <PageHeader
            title="Your trips"
            description="Everything you've planned, kept in this browser — no account, no cloud."
          />

          {empty && (
            <Card padding="lg" className="max-w-xl">
              <div className="flex flex-col items-start gap-4">
                <Compass className="w-8 h-8 text-[var(--primary)]" />
                <div>
                  <h2 className="text-h3 text-[var(--fg)] mb-1">Nothing planned yet</h2>
                  <p className="text-sm text-[var(--muted)]">
                    Plan a trip and it will wait for you here — drafts included.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asLink href="/planner">
                    Plan a trip
                  </Button>
                  <Button asLink href="/explore" variant="secondary">
                    Find somewhere to go
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {showDraft && draft && (
            <section className="mb-12">
              <ResultsHeader
                title="In progress"
                blurb="The trip you were last working on — it auto-saves as you edit."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <TripCard
                  plan={draft.plan}
                  intent={draft.intent}
                  name={tripName(draft.plan, draft.intent)}
                  todayISO={todayISO}
                  onOpen={() => router.push("/planner")}
                />
              </div>
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                <PencilLine className="w-3.5 h-3.5" />
                Save it from the planner to keep it beyond the draft.
              </p>
            </section>
          )}

          {trips.length > 0 && (
            <section>
              <ResultsHeader
                title="Saved trips"
                blurb="Open one to review, edit, or carry it with you."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {trips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    plan={trip.plan}
                    intent={trip.intent}
                    name={trip.name}
                    todayISO={todayISO}
                    onOpen={() => router.push(`/planner?trip=${trip.id}`)}
                    onDelete={() => handleDelete(trip.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </Container>
      </div>
    </div>
  );
}
