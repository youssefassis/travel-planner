"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal, {
  ModalHeader,
  ModalConfirmation,
  PriceBreakdown,
} from "@/components/ui/Modal";
import { bookingReference } from "@/domain/booking";
import { Activity, Booking } from "../types";
import { formatClock } from "../engine";

export type BookingTarget = {
  activity: Activity;
  dayLabel: string;
  /** Scheduled start, minutes since midnight; null when unknown. */
  startMin: number | null;
};

type Props = {
  target: BookingTarget;
  partySize: number;
  /** Record the reservation on the trip so it survives the session. */
  onBooked: (booking: Booking) => void;
  onClose: () => void;
};

export default function BookActivityPanel({
  target,
  partySize,
  onBooked,
  onClose,
}: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const { activity, dayLabel, startMin } = target;
  const isTable = activity.category === "food";
  const total = activity.price * partySize;
  const reference = bookingReference(
    `${activity.id}|${dayLabel}|${startMin ?? ""}`,
  );

  const confirm = () => {
    setConfirmed(true);
    onBooked({
      activityId: activity.id,
      reference,
      bookedAt: Date.now(),
      price: activity.price,
    });
  };

  return (
    <Modal
      onClose={onClose}
      ariaLabel={isTable ? "Reserve a table" : "Book tickets"}
      size="md"
    >
      {confirmed ? (
        <ModalConfirmation
          title={isTable ? "Table reserved" : "Tickets booked"}
          reference={reference}
          onDone={onClose}
        />
      ) : (
        <>
          <ModalHeader
            title={isTable ? "Reserve a table" : "Book tickets"}
            onClose={onClose}
          />

          <p className="font-semibold text-[var(--fg)] mb-1">{activity.name}</p>
          <p className="text-xs text-[var(--muted)] mb-6">
            {dayLabel} · {activity.city}
            {startMin !== null ? ` · ${formatClock(startMin)}` : ""}
          </p>

          <PriceBreakdown
            rows={[
              {
                label: `${isTable ? "Table for" : "Tickets"} — ${partySize} ${partySize === 1 ? "person" : "people"}`,
                value: activity.price > 0 ? `€${activity.price} each` : "Free",
              },
            ]}
            total={{
              label: "Total",
              value: total > 0 ? `€${total}` : "€0 — reservation only",
            }}
          />

          <Button size="lg" className="w-full" onClick={confirm}>
            {isTable ? "Confirm reservation" : "Confirm booking"}
            {total > 0 ? ` · €${total}` : ""}
          </Button>
        </>
      )}
    </Modal>
  );
}
