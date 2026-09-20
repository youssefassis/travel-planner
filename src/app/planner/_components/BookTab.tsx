"use client";

import SegmentedControl from "@/components/ui/SegmentedControl";
import { TripIntent, TripPlan } from "@/features/planner/types";
import { BookMode } from "../_lib/tabs";
import FlightsTab from "./FlightsTab";
import StaysTab from "./StaysTab";

const MODE_OPTIONS: { label: string; value: BookMode }[] = [
  { label: "Flights", value: "flights" },
  { label: "Stays", value: "stays" },
];

type Props = {
  trip: TripPlan;
  intent: TripIntent;
  mode: BookMode;
  onModeChange: (mode: BookMode) => void;
  /** A flight leg to scroll to — set when the route strip sends you here. */
  focus?: { legId: string } | null;
  staysCityId: string;
  onCityChange: (cityId: string) => void;
};

/**
 * Reserving the trip is one job with two halves: the seats between cities
 * and the beds inside them. Both stay mounted so a half-finished search on
 * either side survives switching.
 */
export default function BookTab({
  trip,
  intent,
  mode,
  onModeChange,
  focus,
  staysCityId,
  onCityChange,
}: Props) {
  return (
    <div className="space-y-8">
      <div className="max-w-xs">
        <SegmentedControl options={MODE_OPTIONS} value={mode} onChange={onModeChange} />
      </div>

      <div hidden={mode !== "flights"}>
        <FlightsTab trip={trip} intent={intent} focus={focus} />
      </div>
      <div hidden={mode !== "stays"}>
        <StaysTab
          trip={trip}
          intent={intent}
          cityId={staysCityId}
          onCityChange={onCityChange}
        />
      </div>
    </div>
  );
}
