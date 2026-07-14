"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import StaySearch, { StaySearchFormData } from "@/features/stays/components/StaySearch";
import { searchStays } from "@/features/stays/lib/searchStays";
import { StayOption, StayType } from "@/features/stays/types";
import { BudgetTier } from "@/domain/types";
import { getCity } from "@/domain/cities";

const GRADIENTS = [
  "bg-gradient-to-br from-[#ff6b35] to-[#004e89]",
  "bg-gradient-to-br from-[#34495e] to-[#e74c3c]",
  "bg-gradient-to-br from-[#8b4513] to-[#2f4f4f]",
  "bg-gradient-to-br from-[#d4af37] to-[#a0826d]",
  "bg-gradient-to-br from-[#228b22] to-[#8b4513]",
  "bg-gradient-to-br from-[#ff6b35] to-[#f7931e]",
];

const TYPE_LABELS: Record<StayType, string> = {
  hotel: "Hotel",
  apartment: "Apartment",
  hostel: "Hostel",
};

const StayCard = ({
  stay,
  index,
  nights,
}: {
  stay: StayOption;
  index: number;
  nights?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -8 }}
    className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all"
  >
    {/* Image */}
    <div className={`h-48 ${GRADIENTS[index % GRADIENTS.length]} relative`}>
      <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full">
        <p className="text-sm font-semibold text-[var(--fg)]">
          €{stay.pricePerNight}/night
        </p>
      </div>
    </div>

    {/* Content */}
    <div className="p-5">
      <h3 className="text-xl font-serif font-bold text-[var(--fg)] mb-1">{stay.name}</h3>
      <p className="text-sm text-[var(--muted)] mb-4">
        {TYPE_LABELS[stay.type]} · {stay.city}
      </p>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-semibold text-[var(--fg)]">
          {stay.rating.toFixed(1)}
        </span>
        <span className="text-yellow-500">★</span>
      </div>

      {/* Amenities */}
      <div className="flex flex-wrap gap-2 mb-5">
        {stay.amenities.slice(0, 3).map((amenity) => (
          <span
            key={amenity}
            className="text-xs bg-[var(--card-subtle)] text-[var(--fg)] px-2 py-1 rounded"
          >
            {amenity}
          </span>
        ))}
      </div>

      {/* Total for stay */}
      {nights !== undefined && (
        <p className="text-sm font-medium text-[var(--fg)] mb-4">
          €{stay.pricePerNight * nights} total for {nights}{" "}
          {nights === 1 ? "night" : "nights"}
        </p>
      )}

      {/* Button */}
      <button className="w-full btn btn-primary text-white text-sm">View & Book</button>
    </div>
  </motion.div>
);

function validCityId(id: string | null): string {
  return id && getCity(id) ? id : "";
}

function parseBudget(value: string | null): BudgetTier {
  return value === "backpacker" || value === "comfort" || value === "luxury"
    ? value
    : "comfort";
}

function parseNights(value: string | null): number | undefined {
  const parsed = value === null ? NaN : parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function StaysPageContent() {
  const searchParams = useSearchParams();
  const initialCityId = validCityId(searchParams.get("city"));
  const initialBudget = parseBudget(searchParams.get("budget"));
  const initialNights = parseNights(searchParams.get("nights"));

  const [searchResults, setSearchResults] = useState<StayOption[] | null>(() =>
    initialCityId ? searchStays(initialCityId, initialBudget) : null
  );
  const [nights, setNights] = useState<number | undefined>(initialNights);

  const handleSearch = (data: StaySearchFormData) => {
    setSearchResults(searchStays(data.cityId, data.budget));
    setNights(data.nights);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="pt-20 sm:pt-24 pb-16 sm:pb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[var(--fg)] mb-3 sm:mb-4">
              Find & Book Stays
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-[var(--muted)]">
              Discover the perfect place to rest during your travels
            </p>
          </motion.div>

          {/* Search Form */}
          <div className="mb-12 sm:mb-16">
            <StaySearch
              initialCityId={initialCityId}
              initialBudget={initialBudget}
              initialNights={initialNights}
              onSearch={handleSearch}
            />
          </div>

          {/* Results */}
          {searchResults && searchResults.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-serif font-bold text-[var(--fg)] mb-6">
                Available Accommodations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((stay, idx) => (
                  <StayCard key={stay.id} stay={stay} index={idx} nights={nights} />
                ))}
              </div>
            </motion.div>
          )}

          {/* No results */}
          {searchResults && searchResults.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-[var(--muted)] text-lg">
                No accommodations found for this city. Try another destination.
              </p>
            </motion.div>
          )}

          {/* Empty State */}
          {!searchResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-[var(--muted)] text-lg">
                Enter your preferences above to see available accommodations
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StaysPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <StaysPageContent />
    </Suspense>
  );
}
