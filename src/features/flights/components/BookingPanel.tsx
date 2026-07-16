"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal, {
  ModalHeader,
  ModalConfirmation,
  PriceBreakdown,
} from "@/components/ui/Modal";
import { bookingReference } from "@/domain/booking";
import { FlightOption } from "../types";
import FlightTimeline from "./FlightTimeline";

type Props = {
  outbound: FlightOption;
  inbound: FlightOption | null; // null = one-way
  travelers: number;
  onClose: () => void;
};

const LegRow = ({ label, flight }: { label: string; flight: FlightOption }) => (
  <div>
    <p className="text-caption text-[var(--muted)] mb-2">
      {label} · {flight.airline}
    </p>
    <FlightTimeline flight={flight} />
  </div>
);

export default function BookingPanel({ outbound, inbound, travelers, onClose }: Props) {
  const [confirmed, setConfirmed] = useState(false);

  const legs = inbound ? [outbound, inbound] : [outbound];
  const farePerPerson = legs.reduce((sum, leg) => sum + leg.price, 0);
  const bagsPerPerson = legs.reduce((sum, leg) => sum + leg.bagFee, 0);
  const total = (farePerPerson + bagsPerPerson) * travelers;

  return (
    <Modal onClose={onClose} ariaLabel="Review your trip" size="lg">
      {confirmed ? (
        <ModalConfirmation
          title="Booking confirmed"
          reference={bookingReference(`${outbound.id}|${inbound?.id ?? ""}`)}
          onDone={onClose}
        />
      ) : (
        <>
          <ModalHeader title="Review your trip" onClose={onClose} />

          <div className="space-y-5 mb-6">
            <LegRow label="Outbound" flight={outbound} />
            {inbound && <LegRow label="Return" flight={inbound} />}
          </div>

          <PriceBreakdown
            rows={[
              {
                label: `Fare × ${travelers} ${travelers === 1 ? "traveler" : "travelers"}`,
                value: `€${farePerPerson * travelers}`,
              },
              {
                label: `Checked bags (${legs.length} ${legs.length === 1 ? "leg" : "legs"} × ${travelers})`,
                value: `€${bagsPerPerson * travelers}`,
              },
            ]}
            total={{ label: "Total", value: `€${total}` }}
          />

          <Button size="lg" className="w-full" onClick={() => setConfirmed(true)}>
            Confirm booking · €{total}
          </Button>
        </>
      )}
    </Modal>
  );
}
