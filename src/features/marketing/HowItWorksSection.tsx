"use client";

import { PenLine, Bot, Plane, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
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
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
    className="relative group rounded-2xl p-8 bg-[var(--card)] border border-[var(--border)] shadow-sm hover:shadow-md hover:border-[var(--primary)]/30 transition-all duration-300"
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

    <h3 className="text-xl md:text-2xl font-serif font-bold text-[var(--fg)] mb-3">
      {title}
    </h3>

    <p className="text-[var(--muted)] text-base leading-relaxed">{description}</p>

    {/* Subtle gradient accent on hover */}
    <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-b-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  </motion.div>
);

export default function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      title: "Tell Us Your Dream",
      description:
        "Share destination, dates, travel style and preferences. The system adapts to your input.",
      Icon: PenLine,
    },
    {
      number: 2,
      title: "Trip Construction",
      description:
        "Itineraries, transport options and stays are generated according to selected criteria.",
      Icon: Bot,
    },
    {
      number: 3,
      title: "Adjust and Finalize",
      description:
        "Modify activities, timing and accommodation before final confirmation.",
      Icon: Plane,
    },
  ];

  return (
    <section className="py-16 sm:py-20 md:py-28 bg-[var(--card-subtle)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <SectionHeader
            badge="Process"
            badgeIcon={<Zap className="w-4 h-4" />}
            title="How It Works"
            description="A structured process from idea to travel plan — in three simple steps."
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

        <motion.div
          className="mt-14 sm:mt-20 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
        >
          <Button
            asLink
            href="/planner"
            variant="primary"
            size="lg"
            icon="→"
            iconPosition="right"
          >
            Start Planning
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
