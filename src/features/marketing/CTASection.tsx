"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import Container from "@/components/ui/Container";
import { VIEWPORT_ONCE } from "@/components/motion";

const FLOATING_PILLS = [
  { label: "🗺️ Paris · 5 days", delay: 0, x: "-30%", y: "20%", rotate: -8 },
  { label: "🏝️ Bali · 8 days", delay: 0.15, x: "28%", y: "15%", rotate: 6 },
  { label: "🏯 Tokyo · 7 days", delay: 0.3, x: "-22%", y: "65%", rotate: -5 },
  { label: "🌆 NYC · 4 days", delay: 0.45, x: "35%", y: "62%", rotate: 7 },
];

export default function CTA() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Section size="lg" className="relative overflow-hidden bg-[var(--bg)]">
      {/* Faint ambient glow — same brand-tint language as the hero, not a
          full-bleed color wash. */}
      <motion.div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--primary) 14%, transparent) 0%, transparent 70%)",
        }}
        animate={prefersReducedMotion ? undefined : { scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating trip pills */}
      {FLOATING_PILLS.map((pill, i) => (
        <motion.div
          key={i}
          className="hidden md:flex absolute items-center px-4 py-2 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--fg)] text-sm font-medium shadow-md select-none pointer-events-none"
          style={{ left: "50%", top: "50%", x: pill.x, y: pill.y, rotate: pill.rotate }}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.5, delay: pill.delay + 0.3, ease: "easeOut" }}
        >
          {pill.label}
        </motion.div>
      ))}

      <Container size="narrow" className="relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-h1 text-[var(--fg)] mb-6">
            Ready for your next{" "}
            <span className="bg-[image:var(--gradient-brand)] bg-clip-text text-transparent">
              adventure
            </span>
            ?
          </h2>

          <p className="text-body-lg text-[var(--muted)] text-center mx-auto mb-10 max-w-xl">
            Plan routes, compare stays, and receive recommendations adapted to your
            journey.
          </p>

          <div className="flex justify-center">
            <Button
              asLink
              href="/planner"
              variant="primary"
              size="lg"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Plan a trip
            </Button>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
