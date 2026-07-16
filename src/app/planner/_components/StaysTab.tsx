"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import Button from "@/components/ui/Button";
import FilterPills from "@/components/ui/FilterPills";
import ResultsHeader from "@/components/ui/ResultsHeader";
import StayAdviceResults from "@/features/stays/components/StayAdviceResults";
import StayAdvisorForm from "@/features/stays/components/StayAdvisorForm";
import { StayPreferences } from "@/features/stays/types";
import { TripIntent, TripPlan } from "@/features/planner/types";
import { stayPrefsForStop } from "../_lib/derive";

type Props = {
  trip: TripPlan;
  intent: TripIntent;
  /** Which city's advice to show; hub keeps it valid against trip.stops. */
  cityId: string;
  onCityChange: (cityId: string) => void;
};

function prefsKey(p: StayPreferences): string {
  return [p.cityId, p.party, p.nights, p.budgetPerNight, p.styles.join(",")].join("|");
}

/** One city's stay advice at a time, prefilled from the trip; tweakable. */
export default function StaysTab({ trip, intent, cityId, onCityChange }: Props) {
  const stop = trip.stops.find((s) => s.cityId === cityId) ?? trip.stops[0];
  const [overrides, setOverrides] = useState<Record<string, StayPreferences>>({});
  const [tuning, setTuning] = useState(false);

  if (!stop) return null;

  const prefs = overrides[stop.cityId] ?? stayPrefsForStop(stop, intent);

  return (
    <div className="space-y-8">
      {trip.stops.length > 1 && (
        <FilterPills
          ariaLabel="Choose a city"
          options={trip.stops.map((s) => ({ label: s.city, value: s.cityId }))}
          value={stop.cityId}
          onChange={onCityChange}
        />
      )}

      <div>
        <ResultsHeader
          title={`Where to stay in ${stop.city}`}
          blurb={`${stop.days} ${stop.days === 1 ? "night" : "nights"} · plan estimate €${stop.stayPerNight}/night`}
        />

        <div className="mb-6">
          {tuning ? (
            <StayAdvisorForm
              initial={prefs}
              onAdvise={(next) => {
                setOverrides((o) => ({ ...o, [stop.cityId]: next }));
                setTuning(false);
              }}
            />
          ) : (
            <Button
              variant="secondary"
              size="sm"
              icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
              iconPosition="left"
              onClick={() => setTuning(true)}
            >
              Fine-tune preferences
            </Button>
          )}
        </div>

        <StayAdviceResults key={prefsKey(prefs)} prefs={prefs} />
      </div>
    </div>
  );
}
