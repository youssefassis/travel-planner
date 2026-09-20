"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Users, Wallet, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import CityAutocomplete from "@/components/ui/CityAutocomplete";
import { getCity } from "@/domain/cities";
import { fadeInUp, staggerChildren } from "@/components/motion";

const QUICK_DESTINATIONS = [
  { emoji: "🇫🇷", cityId: "paris-fr" },
  { emoji: "🇮🇹", cityId: "rome-it" },
  { emoji: "🇪🇸", cityId: "barcelona-es" },
  { emoji: "🇵🇹", cityId: "lisbon-pt" },
];

// Labels match the planner's vocabulary — lowercased they are valid
// TripIntent values, so the wizard can prefill from the URL.
const TRAVELER_OPTIONS = ["Solo", "Couple", "Group"];
const BUDGET_OPTIONS = ["Backpacker", "Comfort", "Luxury"];

const containerVariants = staggerChildren(0.15);
const itemVariants = fadeInUp;

function formatDate(iso: string) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${d} ${months[parseInt(m) - 1]} ${y}`;
}

export default function HeroSection() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [destinationCityId, setDestinationCityId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [travelers, setTravelers] = useState("Solo");
  const [budget, setBudget] = useState(BUDGET_OPTIONS[1]);

  const cycleTravelers = () => {
    const idx = TRAVELER_OPTIONS.indexOf(travelers);
    setTravelers(TRAVELER_OPTIONS[(idx + 1) % TRAVELER_OPTIONS.length]);
  };

  const cycleBudget = () => {
    const idx = BUDGET_OPTIONS.indexOf(budget);
    setBudget(BUDGET_OPTIONS[(idx + 1) % BUDGET_OPTIONS.length]);
  };

  const plannerUrl = (cityId: string) => {
    const params = new URLSearchParams({
      destination: cityId,
      travelers: travelers.toLowerCase(),
      budget: budget.toLowerCase(),
    });
    if (startDate) params.set("date", startDate);
    return `/planner?${params.toString()}`;
  };

  const handleSearch = () => {
    if (getCity(destinationCityId)) {
      router.push(plannerUrl(destinationCityId));
    }
  };

  return (
    <div className="relative w-full min-h-[620px] md:min-h-[720px] bg-[var(--bg)] overflow-hidden">
      {/* Ambient blobs — a faint brand tint, not a full-bleed wash. Looped
          only when motion is not reduced. */}
      <motion.div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--primary) 16%, transparent) 0%, transparent 70%)",
        }}
        animate={
          prefersReducedMotion
            ? undefined
            : { scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }
        }
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-10 -left-10 w-[420px] h-[420px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--accent) 14%, transparent) 0%, transparent 70%)",
        }}
        animate={
          prefersReducedMotion
            ? undefined
            : { scale: [1, 1.08, 1], opacity: [0.5, 0.85, 0.5] }
        }
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      <Container size="wide" className="relative z-10">
        <motion.div
          className="py-24 sm:py-28 md:py-36 flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
        {/* Badge + Heading */}
        <motion.div className="mb-10 sm:mb-14" variants={itemVariants}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Planning</span>
          </div>
          <h1 className="text-display text-[var(--fg)] mb-5">
            Your next{" "}
            <span className="bg-[image:var(--gradient-brand)] bg-clip-text text-transparent">
              adventure
            </span>{" "}
            <br className="hidden md:block" /> starts here
          </h1>
          <p className="text-body-lg text-[var(--muted)] max-w-xl mx-auto">
            Tell us where and how you travel — get a day-by-day plan in seconds.
          </p>
        </motion.div>

        {/* ── Search card ── */}
        <motion.div className="w-full max-w-3xl mb-10" variants={itemVariants}>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-[var(--border)] bg-[var(--card)]">
            {/* Destination row */}
            <div className="flex items-center gap-4 px-6 py-5">
              <div className="shrink-0">
                <MapPin className="w-[22px] h-[22px] text-[var(--primary)]" />
              </div>
              <CityAutocomplete
                id="hero-destination"
                variant="bare"
                value={destinationCityId}
                onChange={setDestinationCityId}
                placeholder="Where do you want to go?"
                className="flex-1"
              />
            </div>

            {/* Divider */}
            <div className="h-px mx-5 bg-[var(--border)]" />

            {/* Options row */}
            <div className="flex flex-col sm:flex-row">
              {/* Date */}
              <div className="flex-1 relative flex items-center gap-4 px-6 py-4 hover:bg-[var(--card-subtle)] transition-colors sm:border-r border-[var(--border)] group cursor-pointer">
                <motion.div
                  className="shrink-0 w-10 h-10 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center pointer-events-none"
                  whileHover={{ rotate: 20, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Calendar className="w-5 h-5 text-[var(--primary)]" />
                </motion.div>
                <div className="flex-1 min-w-0 pointer-events-none">
                  <div className="text-[10px] text-[var(--muted)] uppercase tracking-widest font-semibold mb-0.5">
                    When
                  </div>
                  <div className="text-[var(--fg)] text-sm font-medium truncate">
                    {formatDate(startDate) ?? "Pick a date"}
                  </div>
                </div>
                {/* Invisible overlay input — clicking the cell opens the native date picker */}
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>

              {/* Travelers — cycles on click */}
              <button
                type="button"
                onClick={cycleTravelers}
                className="flex-1 flex items-center gap-4 px-6 py-4 hover:bg-[var(--card-subtle)] transition-colors text-left group sm:border-r border-[var(--border)]"
              >
                <div className="shrink-0 w-10 h-10 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-[var(--muted)] uppercase tracking-widest font-semibold mb-0.5">
                    Who
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={travelers}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.18 }}
                      className="text-[var(--fg)] text-sm font-medium"
                    >
                      {travelers}
                    </motion.div>
                  </AnimatePresence>
                </div>
                {/* step dots */}
                <div className="shrink-0 flex gap-1">
                  {TRAVELER_OPTIONS.map((opt) => (
                    <div
                      key={opt}
                      className={`rounded-full transition-all duration-300 ${
                        opt === travelers
                          ? "w-3 h-1.5 bg-[var(--primary)]"
                          : "w-1.5 h-1.5 bg-[var(--border)]"
                      }`}
                    />
                  ))}
                </div>
              </button>

              {/* Budget — cycles on click */}
              <button
                type="button"
                onClick={cycleBudget}
                className="flex-1 flex items-center gap-4 px-6 py-4 hover:bg-[var(--card-subtle)] transition-colors text-left group"
              >
                <div className="shrink-0 w-10 h-10 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-[var(--muted)] uppercase tracking-widest font-semibold mb-0.5">
                    Budget
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={budget}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.18 }}
                      className="text-[var(--fg)] text-sm font-medium"
                    >
                      {budget}
                    </motion.div>
                  </AnimatePresence>
                </div>
                {/* step dots */}
                <div className="shrink-0 flex gap-1">
                  {BUDGET_OPTIONS.map((opt) => (
                    <div
                      key={opt}
                      className={`rounded-full transition-all duration-300 ${
                        opt === budget
                          ? "w-3 h-1.5 bg-[var(--primary)]"
                          : "w-1.5 h-1.5 bg-[var(--border)]"
                      }`}
                    />
                  ))}
                </div>
              </button>
            </div>

            {/* Explore button — full-width bottom strip */}
            <div className="px-4 pb-4 pt-3 border-t border-[var(--border)]">
              <Button
                onClick={handleSearch}
                variant="primary"
                size="lg"
                className="w-full"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Plan a trip
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quick Destinations */}
        <motion.div
          className="flex flex-wrap justify-center items-center gap-2.5 mb-8"
          variants={itemVariants}
        >
          <span className="text-[var(--muted)] text-xs font-medium tracking-wide mr-1">
            Or jump straight in:
          </span>
          {QUICK_DESTINATIONS.map((dest, i) => {
            const city = getCity(dest.cityId);
            if (!city) return null;
            return (
              <motion.button
                key={dest.cityId}
                onClick={() => router.push(plannerUrl(dest.cityId))}
                className="px-4 py-1.5 rounded-full bg-[var(--card-subtle)] hover:bg-[var(--border)] text-[var(--fg)] text-sm font-medium border border-[var(--border)] transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                transition={{ delay: 0.65 + i * 0.06, duration: 0.35 }}
              >
                <span className="mr-1.5">{dest.emoji}</span>
                {city.name}
              </motion.button>
            );
          })}
          <motion.button
            onClick={() => router.push("/explore")}
            className="px-4 py-1.5 rounded-full text-[var(--primary)] text-sm font-medium hover:underline underline-offset-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.35 }}
          >
            or explore ideas →
          </motion.button>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          className="flex flex-wrap justify-center items-center gap-5 text-[var(--muted)] text-xs tracking-wide"
          variants={itemVariants}
        >
          <span>10,000+ trips planned</span>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-[var(--border)]" />
          <span>100+ destinations</span>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-[var(--border)]" />
          <span>4.9★ average rating</span>
        </motion.div>
        </motion.div>
      </Container>
    </div>
  );
}
