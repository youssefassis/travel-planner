"use client";

import { useState } from "react";
import { Plane } from "lucide-react";
import Button from "@/components/ui/Button";
import ResultsHeader from "@/components/ui/ResultsHeader";
import FlightSearch, {
  FlightSearchFormData,
} from "@/features/flights/components/FlightSearch";
import FlightLegResults from "@/features/flights/components/FlightLegResults";
import { allLegs } from "@/features/planner/engine";
import { TripIntent, TripPlan } from "@/features/planner/types";
import { flightSearchForLeg, partySize } from "../_lib/derive";

type Props = {
  trip: TripPlan;
  intent: TripIntent;
};

function searchKey(s: FlightSearchFormData): string {
  return [s.fromCityId, s.toCityId, s.tripType, s.travelers, s.stops].join("|");
}

/** Per-leg flight recommendations for the trip's routes, plus a manual search. */
export default function FlightsTab({ trip, intent }: Props) {
  const travelers = partySize(intent);
  // Home legs included — the flight out and the flight back are the two the
  // traveler most needs to book.
  const flightLegs = allLegs(trip).filter((leg) => leg.mode === "flight");
  const [custom, setCustom] = useState<FlightSearchFormData | null>(null);
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div className="space-y-12">
      {flightLegs.length > 0 ? (
        flightLegs.map((leg) => (
          <section key={leg.id}>
            <FlightLegResults
              search={flightSearchForLeg(leg, travelers)}
              heading={`${leg.from} → ${leg.to} · ~${leg.durationHrs}h · plan estimate €${leg.cost}`}
            />
          </section>
        ))
      ) : (
        <div className="text-center py-10">
          <Plane className="w-8 h-8 mx-auto mb-3 text-[var(--muted)]" />
          <p className="text-[var(--muted)] text-lg">
            This route runs on trains, buses and car — no flights needed.
          </p>
        </div>
      )}

      {/* Manual search for a different route or dates. */}
      <div className="pt-2 border-t border-[var(--border)]">
        {showCustom ? (
          <div className="pt-8 space-y-8">
            <ResultsHeader
              title="Search flights"
              blurb="Different route or dates? Search directly."
            />
            <FlightSearch
              initialFromCityId={intent.originCityId}
              initialToCityId=""
              onSearch={setCustom}
            />
            {custom && <FlightLegResults key={searchKey(custom)} search={custom} />}
          </div>
        ) : (
          <div className="pt-6 text-center">
            <Button variant="secondary" onClick={() => setShowCustom(true)}>
              {flightLegs.length > 0 ? "Search a different route" : "Search flights anyway"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
