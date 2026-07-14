"use client";

import Image from "next/image";
import { MapPin, Compass, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";

const DestinationCard = ({
  name,
  country,
  climate,
  image,
  index,
}: {
  name: string;
  country: string;
  climate: string;
  image: string;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
    className="group relative overflow-hidden rounded-[2rem] h-72 sm:h-80 cursor-pointer transition-transform duration-500 ease-out will-change-transform hover:-translate-y-2 hover:shadow-2xl"
  >
    <Image
      src={image}
      alt={name}
      fill
      className="object-cover transform-gpu group-hover:scale-105 transition-transform duration-700 ease-out"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority={false}
    />

    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

    <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
      <div className="transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500 ease-out">
        <h3 className="text-3xl font-serif font-bold text-white mb-2 drop-shadow-md">
          {name}
        </h3>

        <div className="flex items-center text-white/90 text-sm mb-4 font-medium">
          <MapPin className="w-4 h-4 mr-1.5 opacity-70" />
          <span>{country}</span>
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/30 shadow-sm">
            {climate}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);

export default function FeaturedDestinations() {
  const destinations = [
    {
      name: "Paris",
      country: "France",
      climate: "Spring 🌸",
      image: "/images/paris.jpg",
    },
    {
      name: "Tokyo",
      country: "Japan",
      climate: "Cherry Season 🏯",
      image: "/images/tokyo.jpg",
    },
    {
      name: "Barcelona",
      country: "Spain",
      climate: "Summer ☀️",
      image: "/images/barcelona.jpg",
    },
    {
      name: "Bali",
      country: "Indonesia",
      climate: "Dry Season 🏝️",
      image: "/images/bali.jpg",
    },
    {
      name: "New York",
      country: "USA",
      climate: "Fall 🍂",
      image: "/images/newyork.jpg",
    },
    {
      name: "Amalfi",
      country: "Italy",
      climate: "Mediterranean 🍋",
      image: "/images/italy.jpg",
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-[var(--bg)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <SectionHeader
            badge="Top Picks"
            badgeIcon={<Compass className="w-4 h-4" />}
            title="Popular Destinations"
            description="Explore some of our most loved and frequently booked travel spots around the globe."
          />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
          {destinations.map((dest, i) => (
            <DestinationCard
              key={dest.name}
              name={dest.name}
              country={dest.country}
              climate={dest.climate}
              image={dest.image}
              index={i}
            />
          ))}
        </div>

        <div className="text-center flex justify-center">
          <Button
            asLink
            href="/planner"
            variant="primary"
            className="rounded-full px-8 py-4 flex items-center gap-2 hover:scale-[1.02] transition-transform shadow-md"
          >
            <span>View all destinations</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
