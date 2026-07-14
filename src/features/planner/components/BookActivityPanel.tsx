"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import Button from "@/components/ui/Button";
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

/** Deterministic mock booking reference derived from the activity + slot. */
function bookingReference(target: BookingTarget): string {
  const seed = `${target.activity.id}|${target.dayLabel}|${target.startMin ?? ""}`;
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 33 + seed.charCodeAt(i)) >>> 0;
  }
  return `WND-${hash.toString(36).toUpperCase().padStart(6, "0").slice(0, 6)}`;
}

export default function BookActivityPanel({ target, partySize, onClose }: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const { activity, dayLabel, startMin } = target;
  const isTable = activity.category === "food";
  const total = activity.price * partySize;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

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
          aria-label={isTable ? "Reserve a table" : "Book tickets"}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto bg-[var(--card)] border border-[var(--border)] rounded-t-2xl sm:rounded-2xl shadow-xl p-6 sm:p-8"
        >
          {confirmed ? (
            <div className="text-center py-6">
              <span className="inline-flex w-14 h-14 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] items-center justify-center mb-4">
                <Check className="w-7 h-7" />
              </span>
              <h3 className="text-h2 text-[var(--fg)] mb-2">
                {isTable ? "Table reserved" : "Tickets booked"}
              </h3>
              <p className="text-small text-[var(--muted)] mb-1">
                Reference{" "}
                <span className="font-semibold text-[var(--fg)]">
                  {bookingReference(target)}
                </span>
              </p>
              <p className="text-xs text-[var(--muted)] mb-6">
                This is a demo booking — no payment was taken.
              </p>
              <Button size="md" onClick={onClose}>
                Done
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-h2 text-[var(--fg)]">
                  {isTable ? "Reserve a table" : "Book tickets"}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--card-subtle)] hover:text-[var(--fg)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="font-semibold text-[var(--fg)] mb-1">{activity.name}</p>
              <p className="text-xs text-[var(--muted)] mb-6">
                {dayLabel} · {activity.city}
                {startMin !== null ? ` · ${formatClock(startMin)}` : ""}
              </p>

              <div className="rounded-xl bg-[var(--card-subtle)] border border-[var(--border)] p-4 space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">
                    {isTable ? "Table for" : "Tickets"} — {partySize}{" "}
                    {partySize === 1 ? "person" : "people"}
                  </span>
                  <span className="text-[var(--fg)]">
                    {activity.price > 0 ? `€${activity.price} each` : "Free"}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-[var(--border)] pt-2">
                  <span className="text-[var(--fg)]">Total</span>
                  <span className="text-[var(--primary)]">
                    {total > 0 ? `€${total}` : "€0 — reservation only"}
                  </span>
                </div>
              </div>

              <Button size="lg" className="w-full" onClick={() => setConfirmed(true)}>
                {isTable ? "Confirm reservation" : "Confirm booking"}
                {total > 0 ? ` · €${total}` : ""}
              </Button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
