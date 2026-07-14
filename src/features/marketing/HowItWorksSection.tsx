"use client";

import { PenLine, Map, Zap, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";
import Section from "@/components/ui/Section";
import Container from "@/components/ui/Container";
import { VIEWPORT_ONCE, DUR, EASE_OUT } from "@/components/motion";
import type { LucideIcon } from "lucide-react";

const StepCard = ({
  number,
  title,
  description,
  Icon,
  index,
}: {
  number: number;
  title: string;
  description: string;
  Icon: LucideIcon;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={VIEWPORT_ONCE}
    transition={{ duration: DUR.slow, ease: EASE_OUT, delay: Math.min(index * 0.1, 0.3) }}
    className="relative group rounded-xl p-8 bg-[var(--card)] border border-[var(--border)] shadow-sm hover:shadow-md hover:border-[var(--primary)]/30 transition-all duration-300"
  >
    {/* Step number + icon row */}
    <div className="flex items-center gap-4 mb-6">
      <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
        Step {number}
      </span>
    </div>

    <h3 className="text-h2 text-[var(--fg)] mb-3">{title}</h3>

    <p className="text-[var(--muted)] text-base leading-relaxed">{description}</p>

    {/* Subtle gradient accent on hover */}
    <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-b-xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  </motion.div>
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

        {/* Steps with connector */}
        <div className="relative">
          {/* Desktop connector line */}
          <div className="hidden md:block absolute top-[52px] left-[calc(16.66%+20px)] right-[calc(16.66%+20px)] h-px bg-gradient-to-r from-[var(--primary)]/30 via-[var(--accent)]/30 to-[var(--primary)]/30" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((step, i) => (
              <StepCard
                key={step.number}
                number={step.number}
                title={step.title}
                description={step.description}
                Icon={step.Icon}
                index={i}
              />
            ))}
          </div>
        </div>

      </Container>
    </Section>
  );
}
