"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, BedDouble, Hotel, Star } from "lucide-react";
import StaySearch, { StaySearchFormData } from "@/features/stays/components/StaySearch";
import { searchStays } from "@/features/stays/lib/searchStays";
import { StayOption, StayType } from "@/features/stays/types";
import { BudgetTier } from "@/domain/types";
import { getCity } from "@/domain/cities";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { fadeInUp, staggerChildren } from "@/components/motion";

const GRADIENTS = [
  "from-[var(--primary)]/80 to-[var(--accent)]/70",
  "from-[var(--primary-light)] to-[var(--primary-dark)]",
  "from-[var(--accent-light)] to-[var(--accent-dark)]",
  "from-[var(--primary)] to-[var(--primary-light)]",
];

const TYPE_LABELS: Record<StayType, string> = {
  hotel: "Hotel",
  apartment: "Apartment",
  hostel: "Hostel",
};

const TYPE_ICONS: Record<StayType, typeof Hotel> = {
  hotel: Hotel,
  apartment: Building2,
  hostel: BedDouble,
};

const StayCard = ({
  stay,
  index,
  nights,
}: {
  stay: StayOption;
  index: number;
  nights?: number;
}) => {
  const TypeIcon = TYPE_ICONS[stay.type];

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -4 }}
      className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all"
    >
      {/* Image */}
      <div
        className={`h-48 bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]} relative flex items-center justify-center`}
      >
        <TypeIcon className="text-white/40 w-10 h-10" />
        <div className="absolute top-3 right-3 bg-[var(--card)]/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <p className="text-sm font-semibold text-[var(--fg)]">
            €{stay.pricePerNight}/night
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-h3 text-[var(--fg)] mb-1">{stay.name}</h3>
        <p className="text-sm text-[var(--muted)] mb-4">
          {TYPE_LABELS[stay.type]} · {stay.city}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-semibold text-[var(--fg)]">
            {stay.rating.toFixed(1)}
          </span>
          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
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
        <Button size="md" className="w-full">
          View & Book
        </Button>
      </div>
    </motion.div>
  );
};

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
      <div className="pt-28 md:pt-32 pb-16 sm:pb-20">
        <Container size="wide">
          <PageHeader
            title="Find & book stays"
            description="Discover the perfect place to rest during your travels"
          />

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
              <h2 className="text-h2 text-[var(--fg)] mb-6">Available Accommodations</h2>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerChildren(0.06)}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {searchResults.map((stay, idx) => (
                  <StayCard key={stay.id} stay={stay} index={idx} nights={nights} />
                ))}
              </motion.div>
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
        </Container>
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
