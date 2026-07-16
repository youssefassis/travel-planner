"use client";

import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import MotionCard from "@/components/ui/MotionCard";
import Price from "@/components/ui/Price";
import { FlightOption } from "../types";
import AirlineAvatar from "./AirlineAvatar";
import FlightTimeline from "./FlightTimeline";

type Props = {
  flight: FlightOption;
  travelers: number;
  badges?: string[];
  selected?: boolean;
  onSelect: (flight: FlightOption) => void;
};

export default function FlightCard({
  flight,
  travelers,
  badges = [],
  selected = false,
  onSelect,
}: Props) {
  const totalWithBag = (flight.price + flight.bagFee) * travelers;

  return (
    <MotionCard hover selected={selected}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1.6fr_auto] lg:gap-6 items-center">
        {/* Airline */}
        <div className="flex items-center gap-3">
          <AirlineAvatar airline={flight.airline} />
          <div className="min-w-0">
            <p className="font-semibold text-[var(--fg)] text-sm truncate">
              {flight.airline}
            </p>
            {badges.length > 0 && (
              <span className="inline-flex gap-1.5 mt-1">
                {badges.map((badge) => (
                  <Badge key={badge}>{badge}</Badge>
                ))}
              </span>
            )}
          </div>
        </div>

        {/* Timeline */}
        <FlightTimeline flight={flight} />

        {/* Price & select */}
        <div className="flex items-center justify-between lg:flex-col lg:items-end gap-2 border-t border-[var(--border)] pt-4 lg:border-0 lg:pt-0">
          <Price
            amount={`€${flight.price}`}
            align="right"
            sub={
              <>
                €{totalWithBag} total
                {travelers > 1 ? ` · ${travelers} travelers` : ""} · incl. 1 bag
              </>
            }
          />
          <Button
            size="sm"
            variant={selected ? "secondary" : "primary"}
            onClick={() => onSelect(flight)}
          >
            {selected ? "Selected" : "Select"}
          </Button>
        </div>
      </div>
    </MotionCard>
  );
}
