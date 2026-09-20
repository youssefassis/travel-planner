"use client";

import { PenLine, Map, Zap, SlidersHorizontal, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";
import Section from "@/components/ui/Section";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import { VIEWPORT_ONCE, DUR, EASE_OUT } from "@/components/motion";
import type { LucideIcon } from "lucide-react";

/** A waypoint marker on the route: the step number in a solid pin. */
const Waypoint = ({ number }: { number: number }) => (
  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white text-lg font-bold shadow-brand ring-4 ring-[var(--card-subtle)]">
    {number}
  </div>
);

const StepCard = ({
  number,
  title,
  description,
  Icon,
  index,
  isLast,
}: {
  number: number;
  title: string;
  description: string;
  Icon: LucideIcon;
  index: number;
  isLast: boolean;
}) => (
  <motion.li
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={VIEWPORT_ONCE}
    transition={{ duration: DUR.slow, ease: EASE_OUT, delay: Math.min(index * 0.1, 0.3) }}
    className="relative flex flex-row gap-4 md:flex-col md:items-center md:gap-0"
  >
    {/* Marker column: on mobile this is a real flex column (pin + line
        stretched to the row's height); at md it becomes `contents` so the
        pin joins the vertical stack below and the mobile connector just
        stays hidden. */}
    <div className="flex flex-col items-center md:contents">
      <Waypoint number={number} />
      {!isLast && (
        <div
          aria-hidden
          className="my-1 w-px flex-1 border-l-2 border-dashed border-[var(--primary)]/30 md:hidden"
        />
      )}
    </div>

    <Card
      padding="lg"
      className="group h-full flex-1 transition-colors duration-300 hover:border-[var(--primary)]/30 md:mt-6 md:w-full"
    >
      <div className="flex items-center gap-3 mb-3 md:flex-col md:gap-2 md:text-center">
        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-h2 text-[var(--fg)]">{title}</h3>
      </div>

      <p className="text-[var(--muted)] text-base leading-relaxed md:text-center">
        {description}
      </p>
    </Card>
  </motion.li>
);

export default function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      title: "Tell us your trip",
      description: "Three quick questions — destination or surprise, who's going, your style.",
      Icon: PenLine,
    },
    {
      number: 2,
      title: "We build your plan",
      description: "Route, day-by-day itinerary, transport, and budget — in seconds.",
      Icon: Map,
    },
    {
      number: 3,
      title: "Adjust & go",
      description: "Swap anything, add stops or cities, then share or print it.",
      Icon: SlidersHorizontal,
    },
  ];

  return (
    <Section size="md" className="bg-[var(--card-subtle)]">
      <Container size="wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: DUR.base, ease: EASE_OUT }}
        >
          <SectionHeader
            badge="Process"
            badgeIcon={<Zap className="w-4 h-4" />}
            title="How It Works"
            description="From idea to itinerary in three steps."
          />
        </motion.div>

        {/* Steps laid out as a route: numbered waypoints on a dashed path */}
        <div className="relative">
          {/* Desktop route line, running through the waypoints' centers */}
          <div
            aria-hidden
            className="hidden md:block absolute top-6 left-[16.667%] right-[16.667%] border-t-2 border-dashed border-[var(--primary)]/30"
          >
            <ChevronRight className="absolute left-1/4 top-0 w-4 h-4 -translate-x-1/2 -translate-y-1/2 text-[var(--primary)]/50" />
            <ChevronRight className="absolute left-3/4 top-0 w-4 h-4 -translate-x-1/2 -translate-y-1/2 text-[var(--primary)]/50" />
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((step, i) => (
              <StepCard
                key={step.number}
                number={step.number}
                title={step.title}
                description={step.description}
                Icon={step.Icon}
                index={i}
                isLast={i === steps.length - 1}
              />
            ))}
          </ol>
        </div>

      </Container>
    </Section>
  );
}
