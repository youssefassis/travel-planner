"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import StaySearch, { StaySearchFormData } from "@/features/stays/components/StaySearch";

const mockStays = [
  {
    id: "1",
    name: "Sunny Beachfront Resort",
    location: "Miami Beach",
    rating: 4.8,
    reviews: 342,
    pricePerNight: 250,
    amenities: ["Pool", "WiFi", "Gym", "Restaurant"],
    image: "bg-gradient-to-br from-[#ff6b35] to-[#004e89]",
  },
  {
    id: "2",
    name: "Urban Loft Apartments",
    location: "Downtown Brooklyn",
    rating: 4.6,
    reviews: 218,
    pricePerNight: 180,
    amenities: ["WiFi", "Kitchen", "Workspace", "Laundry"],
    image: "bg-gradient-to-br from-[#34495e] to-[#e74c3c]",
  },
  {
    id: "3",
    name: "Mountain Lodge Retreat",
    location: "Colorado Springs",
    rating: 4.9,
    reviews: 156,
    pricePerNight: 200,
    amenities: ["Fireplace", "Hot Tub", "WiFi", "Kitchen"],
    image: "bg-gradient-to-br from-[#8b4513] to-[#2f4f4f]",
  },
  {
    id: "4",
    name: "Luxury Hotel & Spa",
    location: "San Francisco",
    rating: 4.7,
    reviews: 521,
    pricePerNight: 320,
    amenities: ["Spa", "Concierge", "Room Service", "Gym"],
    image: "bg-gradient-to-br from-[#d4af37] to-[#a0826d]",
  },
  {
    id: "5",
    name: "Cozy Cottage Hideaway",
    location: "Vermont",
    rating: 4.9,
    reviews: 89,
    pricePerNight: 150,
    amenities: ["Garden", "Fireplace", "WiFi", "Full Kitchen"],
    image: "bg-gradient-to-br from-[#228b22] to-[#8b4513]",
  },
  {
    id: "6",
    name: "Modern City Boutique",
    location: "Austin",
    rating: 4.5,
    reviews: 267,
    pricePerNight: 165,
    amenities: ["Rooftop", "WiFi", "Bar", "Gym"],
    image: "bg-gradient-to-br from-[#ff6b35] to-[#f7931e]",
  },
];

const StayCard = ({ stay, index }: { stay: (typeof mockStays)[0]; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -8 }}
    className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all"
  >
    {/* Image */}
    <div className={`h-48 ${stay.image} relative`}>
      <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full">
        <p className="text-sm font-semibold text-[var(--fg)]">
          ${stay.pricePerNight}/night
        </p>
      </div>
    </div>

    {/* Content */}
    <div className="p-5">
      <h3 className="text-xl font-serif font-bold text-[var(--fg)] mb-1">
        {stay.name}
      </h3>
      <p className="text-sm text-[var(--muted)] mb-4">{stay.location}</p>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-semibold text-[var(--fg)]">{stay.rating}</span>
        <span className="text-yellow-500">★</span>
        <span className="text-xs text-[var(--muted)]">({stay.reviews} reviews)</span>
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

      {/* Button */}
      <button className="w-full btn btn-primary text-white text-sm">View & Book</button>
    </div>
  </motion.div>
);

export default function StaysPage() {
  const [searchResults, setSearchResults] = useState<typeof mockStays | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (data: StaySearchFormData) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Filter by max price
    const filtered = mockStays.filter(
      (stay) => stay.pricePerNight <= data.maxPricePerNight,
    );
    setSearchResults(filtered.length > 0 ? filtered : mockStays);
    setIsLoading(false);
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
            <StaySearch onSearch={handleSearch} isLoading={isLoading} />
          </div>

          {/* Results */}
          {searchResults && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-serif font-bold text-[var(--fg)] mb-6">
                Available Accommodations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((stay, idx) => (
                  <StayCard key={stay.id} stay={stay} index={idx} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!searchResults && !isLoading && (
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
