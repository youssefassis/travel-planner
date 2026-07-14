"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

const FLOATING_PILLS = [
  { label: "🗺️ Paris · 5 days", delay: 0, x: "-30%", y: "20%", rotate: -8 },
  { label: "🏝️ Bali · 8 days", delay: 0.15, x: "28%", y: "15%", rotate: 6 },
  { label: "🏯 Tokyo · 7 days", delay: 0.3, x: "-22%", y: "65%", rotate: -5 },
  { label: "🌆 NYC · 4 days", delay: 0.45, x: "35%", y: "62%", rotate: 7 },
];

export default function CTA() {
  const router = useRouter();

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-[#c34e18] to-[var(--accent)] opacity-95" />

      {/* Soft glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/10 blur-3xl rounded-full" />

      {/* Floating trip pills */}
      {FLOATING_PILLS.map((pill, i) => (
        <motion.div
          key={i}
          className="hidden md:flex absolute items-center px-4 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-sm font-medium shadow-lg select-none pointer-events-none"
          style={{ left: "50%", top: "50%", x: pill.x, y: pill.y, rotate: pill.rotate }}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: pill.delay + 0.3, ease: "easeOut" }}
          animate={{
            y: [pill.y, `calc(${pill.y} - 8px)`, pill.y],
          }}
        >
          {pill.label}
        </motion.div>
      ))}

      <motion.div
        className="relative max-w-[1000px] mx-auto px-4 sm:px-6 text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-white leading-tight mb-6 tracking-tight">
          Ready for your next adventure?
        </h2>

        <p className="text-white/80 text-base md:text-lg text-center mx-auto mb-10 leading-relaxed max-w-xl">
          Plan routes, compare stays, and receive recommendations adapted to your
          journey.
        </p>

        <div className="flex justify-center">
          <Button
            onClick={() => router.push("/planner")}
            variant="white"
            size="lg"
            icon="→"
            iconPosition="right"
          >
            Begin planning
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
