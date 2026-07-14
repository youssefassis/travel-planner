"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Star, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { StayOption } from "../types";
import StayTypeAvatar from "./StayTypeAvatar";

type Props = {
  stay: StayOption;
  nights: number;
  onClose: () => void;
};

/** Deterministic mock reservation reference derived from the stay + nights. */
function reservationReference(stay: StayOption, nights: number): string {
  const seed = `${stay.id}|${nights}`;
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 33 + seed.charCodeAt(i)) >>> 0;
  }
  return `WND-${hash.toString(36).toUpperCase().padStart(6, "0").slice(0, 6)}`;
}

export default function ReservePanel({ stay, nights, onClose }: Props) {
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const nightly = stay.pricePerNight * nights;
  const taxes = stay.cityTaxPerNight * nights;
  const total = nightly + taxes + stay.serviceFee;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-6"
        onClick={onClose}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Review your reservation"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--card)] border border-[var(--border)] rounded-t-2xl sm:rounded-2xl shadow-xl p-6 sm:p-8"
        >
          {confirmed ? (
            <div className="text-center py-6">
              <span className="inline-flex w-14 h-14 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] items-center justify-center mb-4">
                <Check className="w-7 h-7" />
              </span>
              <h3 className="text-h2 text-[var(--fg)] mb-2">Reservation confirmed</h3>
              <p className="text-small text-[var(--muted)] mb-1">
                Reference{" "}
                <span className="font-semibold text-[var(--fg)]">
                  {reservationReference(stay, nights)}
                </span>
              </p>
              <p className="text-xs text-[var(--muted)] mb-6">
                This is a demo reservation — no payment was taken.
              </p>
              <Button size="md" onClick={onClose}>
                Done
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-h2 text-[var(--fg)]">Review your stay</h3>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--card-subtle)] hover:text-[var(--fg)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <StayTypeAvatar type={stay.type} />
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--fg)] truncate">{stay.name}</p>
                  <p className="text-xs text-[var(--muted)] flex items-center gap-1.5">
                    {stay.neighborhood}, {stay.city} · {stay.walkToCenterMin} min to
                    center ·
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {stay.rating.toFixed(1)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-[var(--card-subtle)] border border-[var(--border)] p-4 space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">
                    €{stay.pricePerNight} × {nights}{" "}
                    {nights === 1 ? "night" : "nights"}
                  </span>
                  <span className="text-[var(--fg)]">€{nightly}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">City tax</span>
                  <span className="text-[var(--fg)]">€{taxes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">Service fee</span>
                  <span className="text-[var(--fg)]">€{stay.serviceFee}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-[var(--border)] pt-2">
                  <span className="text-[var(--fg)]">Total</span>
                  <span className="text-[var(--primary)]">€{total}</span>
                </div>
              </div>

              <Button size="lg" className="w-full" onClick={() => setConfirmed(true)}>
                Confirm reservation · €{total}
              </Button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
