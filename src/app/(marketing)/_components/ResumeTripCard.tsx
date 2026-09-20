"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";

import { tripName } from "@/features/planner/lib/tripStorage";
import { useTripShelf } from "@/features/planner/lib/useTripShelf";
import { localISODate } from "@/features/planner/lib/today";
import { TripIntent, TripPlan } from "@/features/planner/types";

import Badge from "@/components/ui/Badge";
import Container from "@/components/ui/Container";
import { fadeInUp } from "@/components/motion";
import { tripStatus } from "@/app/trips/_lib/status";

type Resume = {
  name: string;
  plan: TripPlan;
  intent: TripIntent;
  href: string;
};

/**
 * The site remembering you: the trip you were last working on (or the most
 * recently saved one), offered right on the doorstep. Renders nothing for a
 * first-time visitor.
 */
export default function ResumeTripCard() {
  const { trips, draft } = useTripShelf();
  const [todayISO] = useState(() => localISODate(new Date()));

  const [latest] = trips;
  const resume: Resume | null = draft
    ? {
        name: tripName(draft.plan, draft.intent),
        plan: draft.plan,
        intent: draft.intent,
        href: "/planner",
      }
    : latest
      ? {
          name: latest.name,
          plan: latest.plan,
          intent: latest.intent,
          href: `/planner?trip=${latest.id}`,
        }
      : null;

  if (!resume) return null;

  const status = tripStatus(resume.plan, resume.intent, todayISO);
  const days = resume.plan.itinerary.length;

  return (
    <Container size="wide">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <Link
          href={resume.href}
          className="group flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <MapPin className="w-4 h-4 shrink-0 text-[var(--primary)]" />
          <span className="text-sm font-medium text-[var(--fg)] min-w-0">
            Welcome back — {resume.name}
          </span>
          <span className="text-xs text-data text-[var(--muted)]">
            {days} {days === 1 ? "day" : "days"} · €{resume.plan.budget.total} pp
          </span>
          <Badge tone={status.tone}>{status.label}</Badge>
          <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)]">
            Continue
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </motion.div>
    </Container>
  );
}
