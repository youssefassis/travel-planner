"use client";

import { BedDouble, Building2, Hotel } from "lucide-react";
import { StayType } from "../types";

const TYPE_ICONS: Record<StayType, typeof Hotel> = {
  hotel: Hotel,
  apartment: Building2,
  hostel: BedDouble,
};

/** Circle with the stay-type icon — a lightweight photo stand-in. */
export default function StayTypeAvatar({ type }: { type: StayType }) {
  const Icon = TYPE_ICONS[type];
  return (
    <span
      aria-hidden
      className="shrink-0 w-9 h-9 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center"
    >
      <Icon className="w-4 h-4" />
    </span>
  );
}
