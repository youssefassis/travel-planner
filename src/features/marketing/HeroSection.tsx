"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Users, Wallet, ArrowRight, Sparkles, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Container from "@/components/ui/Container";
import { fadeInUp, staggerChildren } from "@/components/motion";

const QUICK_DESTINATIONS = [
  { emoji: "🇫🇷", city: "Paris" },
  { emoji: "🎌", city: "Tokyo" },
  { emoji: "🇪🇦", city: "Spain" },
  { emoji: "🇲🇦", city: "Morocco" },
];

const TRAVELER_OPTIONS = ["Solo", "Friends", "Family"];
const BUDGET_OPTIONS = ["Backpacker", "Standard", "Luxury"];

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

interface Suggestion {
  id: string;
  name: string;
  fullName: string;
}

export default function HeroSection() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [travelers, setTravelers] = useState("Solo");
  const [budget, setBudget] = useState("Standard");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Debounced geocoding fetch
  useEffect(() => {
    if (destination.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=${token}&limit=5&types=place,region,country&language=en`,
        );
        const data = await res.json();
        setSuggestions(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data.features ?? []).map((f: any) => ({
            id: f.id as string,
            name: f.text as string,
            fullName: f.place_name as string,
          })),
        );
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [destination]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectSuggestion = (name: string) => {
    setDestination(name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const cycleTravelers = () => {
    const idx = TRAVELER_OPTIONS.indexOf(travelers);
    setTravelers(TRAVELER_OPTIONS[(idx + 1) % TRAVELER_OPTIONS.length]);
  };

  const cycleBudget = () => {
    const idx = BUDGET_OPTIONS.indexOf(budget);
    setBudget(BUDGET_OPTIONS[(idx + 1) % BUDGET_OPTIONS.length]);
  };

  const handleSearch = () => {
    if (destination) {
      router.push(
        `/planner?destination=${encodeURIComponent(destination)}&date=${startDate}&travelers=${travelers.toLowerCase()}&budget=${budget.toLowerCase()}`,
      );
    }
  };

  return (
    <div className="relative w-full min-h-[620px] md:min-h-[720px] bg-[image:var(--gradient-hero)] overflow-hidden">
      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.18] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            'url(\'data:image/svg+xml,%3Csvg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="n"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="2"/%3E%3C/filter%3E%3Crect width="400" height="400" filter="url(%23n)"/%3E%3C/svg%3E\')',
          backgroundSize: "400px 400px",
        }}
      />

      {/* Ambient blobs — looped only when motion is not reduced */}
      <motion.div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
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
            "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
        }}
        animate={
          prefersReducedMotion
            ? undefined
            : { scale: [1, 1.08, 1], opacity: [0.5, 0.85, 0.5] }
        }
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      <Container className="relative z-10">
        <motion.div
          className="py-24 sm:py-28 md:py-36 flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
        {/* Badge + Heading */}
        <motion.div className="mb-10 sm:mb-14" variants={itemVariants}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Planning</span>
          </div>
          <h1 className="text-display text-white mb-5">
            Your next adventure <br className="hidden md:block" /> starts here
          </h1>
          <p className="text-body-lg text-white/75 max-w-xl mx-auto">
            Discover customized itineraries tailored to your unique travel style.
          </p>
        </motion.div>

        {/* ── Search card ── */}
        <motion.div className="w-full max-w-3xl mb-10" variants={itemVariants}>
          <div
            className="rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.25)] border border-white/20"
            style={{
              background: "rgba(255,255,255,0.13)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            {/* Destination row + suggestions */}
            <div ref={suggestionRef} className="relative">
              <div className="flex items-center gap-4 px-6 py-5">
                <div className="shrink-0">
                  <MapPin className="w-[22px] h-[22px] text-white drop-shadow-sm" />
                </div>

                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Where do you want to go?"
                  className="flex-1 bg-transparent text-white text-lg md:text-xl font-medium placeholder-white/45 border-none outline-none caret-white"
                />

                <AnimatePresence>
                  {isLoadingSuggestions && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="shrink-0"
                    >
                      <Loader2 className="w-4 h-4 text-white/60 animate-spin" />
                    </motion.div>
                  )}
                  {destination && !isLoadingSuggestions && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      onClick={() => { setDestination(""); setSuggestions([]); setShowSuggestions(false); }}
                      className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Autocomplete dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute left-3 right-3 top-full z-50 mt-1 rounded-xl overflow-hidden border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.3)]"
                    style={{
                      background: "rgba(30, 20, 10, 0.75)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                    }}
                  >
                    {suggestions.map((s, i) => (
                      <motion.button
                        key={s.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => selectSuggestion(s.name)}
                        className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-white/10 transition-colors border-b border-white/8 last:border-0 group"
                      >
                        <MapPin className="w-4 h-4 text-white/40 shrink-0 group-hover:text-[var(--primary-light)] transition-colors" />
                        <div className="min-w-0">
                          <div className="text-white text-sm font-semibold truncate">{s.name}</div>
                          <div className="text-white/45 text-xs truncate">{s.fullName}</div>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="h-px mx-5 bg-white/15" />

            {/* Options row */}
            <div className="flex flex-col sm:flex-row">
              {/* Date */}
              <div className="flex-1 relative flex items-center gap-4 px-6 py-4 hover:bg-white/[0.08] transition-colors sm:border-r border-white/10 group cursor-pointer">
                <motion.div
                  className="shrink-0 w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center pointer-events-none"
                  whileHover={{ rotate: 20, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Calendar className="w-5 h-5 text-white" />
                </motion.div>
                <div className="flex-1 min-w-0 pointer-events-none">
                  <div className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-0.5">
                    When
                  </div>
                  <div className="text-white text-sm font-medium truncate">
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
                className="flex-1 flex items-center gap-4 px-6 py-4 hover:bg-white/8 transition-colors text-left group sm:border-r border-white/10"
              >
                <div className="shrink-0 w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-0.5">
                    Who
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={travelers}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.18 }}
                      className="text-white text-sm font-medium"
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
                          ? "w-3 h-1.5 bg-white"
                          : "w-1.5 h-1.5 bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              </button>

              {/* Budget — cycles on click */}
              <button
                type="button"
                onClick={cycleBudget}
                className="flex-1 flex items-center gap-4 px-6 py-4 hover:bg-white/8 transition-colors text-left group"
              >
                <div className="shrink-0 w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-0.5">
                    Budget
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={budget}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.18 }}
                      className="text-white text-sm font-medium"
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
                          ? "w-3 h-1.5 bg-white"
                          : "w-1.5 h-1.5 bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              </button>
            </div>

            {/* Explore button — full-width bottom strip */}
            <div className="px-4 pb-4 pt-3 border-t border-white/10">
              <motion.button
                onClick={handleSearch}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="group w-full flex items-center justify-center gap-2.5 bg-white text-[var(--primary)] rounded-2xl py-3.5 font-semibold text-base shadow-md hover:bg-white/95 transition-colors"
              >
                <span>Explore</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Quick Destinations */}
        <motion.div
          className="flex flex-wrap justify-center items-center gap-2.5 mb-8"
          variants={itemVariants}
        >
          <span className="text-white/60 text-xs font-medium tracking-wide mr-1">
            Trending:
          </span>
          {QUICK_DESTINATIONS.map((dest, i) => (
            <motion.button
              key={dest.city}
              onClick={() => setDestination(dest.city)}
              className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium backdrop-blur-md border border-white/15 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              transition={{ delay: 0.65 + i * 0.06, duration: 0.35 }}
            >
              <span className="mr-1.5">{dest.emoji}</span>
              {dest.city}
            </motion.button>
          ))}
        </motion.div>

        {/* Trust strip */}
        <motion.div
          className="flex flex-wrap justify-center items-center gap-5 text-white/50 text-xs tracking-wide"
          variants={itemVariants}
        >
          <span>10,000+ trips planned</span>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-white/25" />
          <span>100+ destinations</span>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-white/25" />
          <span>4.9★ average rating</span>
        </motion.div>
        </motion.div>
      </Container>
    </div>
  );
}
