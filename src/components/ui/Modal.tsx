"use client";

import { ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import Button from "./Button";

type Size = "md" | "lg";

const sizeStyles: Record<Size, string> = {
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
};

type ModalProps = {
  onClose: () => void;
  ariaLabel: string;
  size?: Size;
  children: ReactNode;
};

/**
 * The shared overlay: backdrop (click-to-close), Escape-to-close, and a panel
 * that is a bottom sheet on mobile and a centered dialog on desktop. Used by
 * every booking/reservation flow.
 */
export default function Modal({ onClose, ariaLabel, size = "lg", children }: ModalProps) {
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
          aria-label={ariaLabel}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full ${sizeStyles[size]} max-h-[90vh] overflow-y-auto bg-[var(--card)] border border-[var(--border)] rounded-t-2xl sm:rounded-2xl shadow-xl p-6 sm:p-8`}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Title row with a close button — the standard header for a Modal. */
export function ModalHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-h2 text-[var(--fg)]">{title}</h3>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--card-subtle)] hover:text-[var(--fg)] transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/** The confirmed-state block: check disc, title, reference, demo note, Done. */
export function ModalConfirmation({
  title,
  reference,
  onDone,
  note = "This is a demo booking — no payment was taken.",
}: {
  title: string;
  reference: string;
  onDone: () => void;
  note?: string;
}) {
  return (
    <div className="text-center py-6">
      <span className="inline-flex w-14 h-14 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] items-center justify-center mb-4">
        <Check className="w-7 h-7" />
      </span>
      <h3 className="text-h2 text-[var(--fg)] mb-2">{title}</h3>
      <p className="text-small text-[var(--muted)] mb-1">
        Reference{" "}
        <span className="font-semibold text-[var(--fg)]">{reference}</span>
      </p>
      <p className="text-xs text-[var(--muted)] mb-6">{note}</p>
      <Button size="md" onClick={onDone}>
        Done
      </Button>
    </div>
  );
}

/** A cost-breakdown box: labeled rows plus a bold total. */
export function PriceBreakdown({
  rows,
  total,
}: {
  rows: { label: ReactNode; value: ReactNode }[];
  total: { label: ReactNode; value: ReactNode };
}) {
  return (
    <div className="rounded-xl bg-[var(--card-subtle)] border border-[var(--border)] p-4 space-y-2 mb-6">
      {rows.map((row, i) => (
        <div key={i} className="flex justify-between text-sm">
          <span className="text-[var(--muted)]">{row.label}</span>
          <span className="text-[var(--fg)]">{row.value}</span>
        </div>
      ))}
      <div className="flex justify-between text-sm font-semibold border-t border-[var(--border)] pt-2">
        <span className="text-[var(--fg)]">{total.label}</span>
        <span className="text-[var(--primary)]">{total.value}</span>
      </div>
    </div>
  );
}
