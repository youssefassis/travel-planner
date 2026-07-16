"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal, {
  ModalHeader,
  ModalConfirmation,
  PriceBreakdown,
} from "@/components/ui/Modal";
import { bookingReference } from "@/domain/booking";
import { Activity } from "../types";
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
  onClose: () => void;
};

export default function BookActivityPanel({ target, partySize, onClose }: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const { activity, dayLabel, startMin } = target;
  const isTable = activity.category === "food";
  const total = activity.price * partySize;

  return (
    <Modal
      onClose={onClose}
      ariaLabel={isTable ? "Reserve a table" : "Book tickets"}
      size="md"
    >
      {confirmed ? (
        <ModalConfirmation
          title={isTable ? "Table reserved" : "Tickets booked"}
          reference={bookingReference(
            `${activity.id}|${dayLabel}|${startMin ?? ""}`,
          )}
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

          <Button size="lg" className="w-full" onClick={() => setConfirmed(true)}>
            {isTable ? "Confirm reservation" : "Confirm booking"}
            {total > 0 ? ` · €${total}` : ""}
          </Button>
        </>
      )}
    </Modal>
  );
}
