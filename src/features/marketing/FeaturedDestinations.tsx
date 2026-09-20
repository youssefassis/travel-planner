"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Compass, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";
import Section from "@/components/ui/Section";
import Container from "@/components/ui/Container";
import { fadeInUp, VIEWPORT_ONCE, DUR, EASE_OUT } from "@/components/motion";

// Only cities from the planner dataset — every card starts a real trip.
const DESTINATIONS = [
  {
    cityId: "paris-fr",
    name: "Paris",
    country: "France",
    climate: "Spring 🌸",
    image: "/images/paris.jpg",
  },
  {
    cityId: "lisbon-pt",
    name: "Lisbon",
    country: "Portugal",
    climate: "Sunny Coast ☀️",
    image: "/images/portugal.jpg",
  },
  {
    cityId: "barcelona-es",
    name: "Barcelona",
    country: "Spain",
    climate: "Summer ☀️",
    image: "/images/barcelona.jpg",
  },
  {
    cityId: "naples-it",
    name: "Naples",
    country: "Italy",
    climate: "Mediterranean 🍋",
    image: "/images/italy.jpg",
  },
];

const DestinationCard = ({
  cityId,
  name,
  country,
  climate,
  image,
  index,
}: (typeof DESTINATIONS)[number] & { index: number }) => (
  <motion.div
    variants={fadeInUp}
    initial="hidden"
    whileInView="visible"
    viewport={VIEWPORT_ONCE}
    transition={{ duration: DUR.slow, ease: EASE_OUT, delay: Math.min(index * 0.08, 0.3) }}
  >
    <Link
      href={`/planner?destination=${cityId}`}
      className="group relative block overflow-hidden rounded-2xl h-64 sm:h-72 transition-transform duration-500 ease-out will-change-transform hover:-translate-y-1 hover:shadow-2xl"
    >
      <Image
        src={image}
        alt={name}
        fill
        className="object-cover transform-gpu group-hover:scale-105 transition-transform duration-700 ease-out"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        priority={false}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <div className="transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <h3 className="text-3xl font-serif font-bold text-white mb-2 drop-shadow-md">
            {name}
          </h3>

          <div className="flex items-center text-white/90 text-sm mb-4 font-medium">
            <MapPin className="w-4 h-4 mr-1.5 opacity-70" />
            <span>{country}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/30 shadow-sm">
              {climate}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-[#1d2935] text-xs font-semibold shadow-sm">
              Plan a trip
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

export default function FeaturedDestinations() {
  return (
    <Section size="md">
      <Container size="wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: DUR.base, ease: EASE_OUT }}
        >
          <SectionHeader
            badge="Top Picks"
            badgeIcon={<Compass className="w-4 h-4" />}
            title="Start from a destination"
            description="Tap a city and we'll draft the trip."
          />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DESTINATIONS.map((dest, i) => (
            <DestinationCard key={dest.cityId} {...dest} index={i} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
