"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal, {
  ModalHeader,
  ModalConfirmation,
  PriceBreakdown,
} from "@/components/ui/Modal";
import { bookingReference } from "@/domain/booking";
import { StayOption } from "../types";
import StayTypeAvatar from "./StayTypeAvatar";

type Props = {
  stay: StayOption;
  nights: number;
  onClose: () => void;
};

export default function ReservePanel({ stay, nights, onClose }: Props) {
  const [confirmed, setConfirmed] = useState(false);

  const nightly = stay.pricePerNight * nights;
  const taxes = stay.cityTaxPerNight * nights;
  const total = nightly + taxes + stay.serviceFee;

  return (
    <Modal onClose={onClose} ariaLabel="Review your reservation" size="lg">
      {confirmed ? (
        <ModalConfirmation
          title="Reservation confirmed"
          reference={bookingReference(`${stay.id}|${nights}`)}
          onDone={onClose}
          note="This is a demo reservation — no payment was taken."
        />
      ) : (
        <>
          <ModalHeader title="Review your stay" onClose={onClose} />

          <div className="flex items-center gap-3 mb-6">
            <StayTypeAvatar type={stay.type} />
            <div className="min-w-0">
              <p className="font-semibold text-[var(--fg)] truncate">{stay.name}</p>
              <p className="text-xs text-[var(--muted)] flex items-center gap-1.5">
                {stay.neighborhood}, {stay.city} · {stay.walkToCenterMin} min to center ·
                <Star className="w-3 h-3 fill-[var(--rating)] text-[var(--rating)]" />
                {stay.rating.toFixed(1)}
              </p>
            </div>
          </div>

          <PriceBreakdown
            rows={[
              {
                label: `€${stay.pricePerNight} × ${nights} ${nights === 1 ? "night" : "nights"}`,
                value: `€${nightly}`,
              },
              { label: "City tax", value: `€${taxes}` },
              { label: "Service fee", value: `€${stay.serviceFee}` },
            ]}
            total={{ label: "Total", value: `€${total}` }}
          />

          <Button size="lg" className="w-full" onClick={() => setConfirmed(true)}>
            Confirm reservation · €{total}
          </Button>
        </>
      )}
    </Modal>
  );
}
