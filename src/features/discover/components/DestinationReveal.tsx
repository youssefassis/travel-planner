"use client";

import { motion } from "framer-motion";
import { MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { City } from "@/domain/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const cap = (v: string) => v.charAt(0).toUpperCase() + v.slice(1);

/** The landed destination: where it is, what it's about, and every way in. */
export default function DestinationReveal({ city }: { city: City }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <Card padding="lg">
        <p className="flex items-center gap-1.5 text-caption text-[var(--primary)] mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Your destination
        </p>
        <h2 className="text-h1 text-[var(--fg)]">{city.name}</h2>
        <p className="flex items-center gap-1.5 text-body-lg text-[var(--muted)] mt-1">
          <MapPin className="w-4 h-4" />
          {city.country}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          {city.interests.map((interest) => (
            <span
              key={interest}
              className="py-1 px-3 rounded-full text-xs font-medium bg-[var(--card-subtle)] text-[var(--muted)] border border-[var(--border)]"
            >
              {cap(interest)}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-[var(--border)]">
          <Button asLink href={`/planner?destination=${city.id}`}>
            Plan a trip
          </Button>
          <Link
            href={`/weather?city=${city.id}`}
            className="text-sm font-medium text-[var(--primary)] hover:underline underline-offset-2"
          >
            Best time to go
          </Link>
          <span className="text-[var(--border)]" aria-hidden>
            ·
          </span>
          <Link
            href={`/stays?city=${city.id}`}
            className="text-sm font-medium text-[var(--muted)] hover:text-[var(--fg)]"
          >
            Stays
          </Link>
          <Link
            href={`/flights?to=${city.id}`}
            className="text-sm font-medium text-[var(--muted)] hover:text-[var(--fg)]"
          >
            Flights
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
