"use client";

import Image from "next/image";
import { MapPin, Compass, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import Section from "@/components/ui/Section";
import Container from "@/components/ui/Container";
import { fadeInUp, VIEWPORT_ONCE, DUR, EASE_OUT } from "@/components/motion";

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
    variants={fadeInUp}
    initial="hidden"
    whileInView="visible"
    viewport={VIEWPORT_ONCE}
    transition={{ duration: DUR.slow, ease: EASE_OUT, delay: Math.min(index * 0.08, 0.3) }}
    className="group relative overflow-hidden rounded-2xl h-72 sm:h-80 cursor-pointer transition-transform duration-500 ease-out will-change-transform hover:-translate-y-1 hover:shadow-2xl"
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
      name: "Lisbon",
      country: "Portugal",
      climate: "Sunny Coast ☀️",
      image: "/images/portugal.jpg",
    },
    {
      name: "Barcelona",
      country: "Spain",
      climate: "Summer ☀️",
      image: "/images/barcelona.jpg",
    },
    {
      name: "Marrakech",
      country: "Morocco",
      climate: "Desert Warmth 🏜️",
      image: "/images/morocco.jpg",
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
    <Section size="md">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: DUR.base, ease: EASE_OUT }}
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
          <Button asLink href="/planner" variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
            View all destinations
          </Button>
        </div>
      </Container>
    </Section>
  );
}
