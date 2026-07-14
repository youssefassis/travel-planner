import { getCity } from "@/domain/cities";
import { Neighborhood, StayOption, StayStyle, StayType } from "../types";

/** Deterministic djb2 string hash — keeps mock inventory stable across renders. */
function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/* ─── Neighborhoods ─────────────────────────────────────────────── */

type NeighborhoodTemplate = {
  slug: string;
  name: (city: string) => string;
  tagline: string;
  traits: StayStyle[];
  walkToCenterMin: number;
  priceLevel: 1 | 2 | 3;
};

const NEIGHBORHOOD_TEMPLATES: NeighborhoodTemplate[] = [
  {
    slug: "old-town",
    name: () => "Old Town",
    tagline: "Cobbled lanes, landmark facades, and life on foot",
    traits: ["walkable", "architecture", "cafes"],
    walkToCenterMin: 5,
    priceLevel: 3,
  },
  {
    slug: "arts-quarter",
    name: () => "Arts Quarter",
    tagline: "Galleries, indie cafés, and a creative crowd",
    traits: ["art", "cafes", "nightlife"],
    walkToCenterMin: 15,
    priceLevel: 2,
  },
  {
    slug: "riverside",
    name: () => "Riverside",
    tagline: "Waterside walks and calm evenings close to it all",
    traits: ["quiet", "walkable", "beach"],
    walkToCenterMin: 12,
    priceLevel: 2,
  },
  {
    slug: "market-district",
    name: () => "Market District",
    tagline: "Food halls, local bistros, and everyday city buzz",
    traits: ["food", "cafes", "walkable"],
    walkToCenterMin: 10,
    priceLevel: 2,
  },
  {
    slug: "garden-side",
    name: () => "Garden Side",
    tagline: "Leafy residential streets, quiet after dark",
    traits: ["quiet", "walkable"],
    walkToCenterMin: 22,
    priceLevel: 1,
  },
  {
    slug: "station-quarter",
    name: () => "Station Quarter",
    tagline: "Practical, well-connected, and easy on the budget",
    traits: ["nightlife", "food"],
    walkToCenterMin: 18,
    priceLevel: 1,
  },
];

/** 4 deterministic neighborhoods per city (always includes Old Town). */
export function getNeighborhoods(cityId: string): Neighborhood[] {
  const city = getCity(cityId);
  if (!city) return [];

  const cityHash = hashString(`nb:${city.id}`);
  const rest = NEIGHBORHOOD_TEMPLATES.slice(1);
  const start = cityHash % rest.length;
  const chosen = [
    NEIGHBORHOOD_TEMPLATES[0],
    rest[start % rest.length],
    rest[(start + 2) % rest.length],
    rest[(start + 4) % rest.length],
  ];
  // De-dup in case of modular collisions.
  const unique = [...new Map(chosen.map((t) => [t.slug, t])).values()];

  return unique.map((template) => ({
    id: `${city.id}--${template.slug}`,
    cityId: city.id,
    name: template.name(city.name),
    tagline: template.tagline,
    traits: template.traits,
    walkToCenterMin:
      template.walkToCenterMin + (hashString(`${city.id}:${template.slug}`) % 5),
    priceLevel: template.priceLevel,
  }));
}

/* ─── Stays ─────────────────────────────────────────────────────── */

type StayTemplate = {
  slug: string;
  name: (city: string, neighborhood: string) => string;
  type: StayType;
  amenities: string[];
  priceFactor: number;
};

const STAY_TEMPLATES: StayTemplate[] = [
  {
    slug: "central-hotel",
    name: (c) => `Hotel ${c} Central`,
    type: "hotel",
    amenities: ["WiFi", "Breakfast", "24h Reception"],
    priceFactor: 1.0,
  },
  {
    slug: "boutique-house",
    name: (c) => `Boutique ${c} House`,
    type: "hotel",
    amenities: ["WiFi", "Gym", "Room Service"],
    priceFactor: 1.25,
  },
  {
    slug: "grand-palace",
    name: (c) => `Grand ${c} Palace`,
    type: "hotel",
    amenities: ["WiFi", "Pool", "Spa", "Bar"],
    priceFactor: 1.6,
  },
  {
    slug: "apartments",
    name: (_, n) => `${n} Apartments`,
    type: "apartment",
    amenities: ["WiFi", "Kitchen", "Washer"],
    priceFactor: 0.9,
  },
  {
    slug: "suites",
    name: (_, n) => `${n} Suites`,
    type: "apartment",
    amenities: ["WiFi", "Balcony", "City View"],
    priceFactor: 1.15,
  },
  {
    slug: "guesthouse",
    name: (_, n) => `${n} Guesthouse`,
    type: "hotel",
    amenities: ["WiFi", "Breakfast", "Garden"],
    priceFactor: 0.75,
  },
  {
    slug: "hostel",
    name: (c) => `${c} Backpackers`,
    type: "hostel",
    amenities: ["WiFi", "Shared Kitchen", "Lockers"],
    priceFactor: 0.45,
  },
  {
    slug: "rooms",
    name: (_, n) => `${n} Rooms`,
    type: "hostel",
    amenities: ["WiFi", "Café", "Lockers"],
    priceFactor: 0.55,
  },
];

const PRAISE_POOL: Record<StayType, string[][]> = {
  hotel: [
    ["spotless rooms", "helpful front desk"],
    ["great breakfast", "comfortable beds"],
    ["quiet rooms", "fast check-in"],
    ["lovely rooftop", "attentive staff"],
  ],
  apartment: [
    ["well-equipped kitchen", "feels like home"],
    ["spacious for the price", "great host communication"],
    ["quiet building", "excellent location"],
    ["stylish interior", "smooth self check-in"],
  ],
  hostel: [
    ["sociable common areas", "clean dorms"],
    ["friendly staff", "good value"],
    ["central location", "secure lockers"],
    ["organized events", "comfortable bunks"],
  ],
};

const NIGGLE_POOL = [
  "thin walls on street side",
  "small rooms",
  "slow elevator",
  "firm mattresses",
  null,
  "limited plug sockets",
  null,
  "early street noise",
];

/**
 * Deterministic stay inventory for a city: 8-10 options spread across the
 * city's neighborhoods and price range (anchored on the city's real tiered
 * stay costs), each with review data and taxes/fees for true-cost math.
 */
export function getStays(cityId: string): StayOption[] {
  const city = getCity(cityId);
  if (!city) return [];

  const neighborhoods = getNeighborhoods(cityId);
  const cityHash = hashString(`stays:${city.id}`);
  const count = 8 + (cityHash % 3); // 8-10

  const stays: StayOption[] = [];
  for (let i = 0; i < count; i++) {
    const template = STAY_TEMPLATES[(cityHash + i * 3) % STAY_TEMPLATES.length];
    const neighborhood = neighborhoods[(cityHash + i) % neighborhoods.length];
    const id = `${city.id}--${neighborhood.id.split("--")[1]}--${template.slug}`;
    if (stays.some((s) => s.id === id)) continue;
    const stayHash = hashString(id);

    // Anchor on the city's comfort price, scaled by template + neighborhood.
    const anchor = city.stayPerNight.comfort;
    const neighborhoodFactor = 0.85 + neighborhood.priceLevel * 0.12;
    const variation = 0.9 + (stayHash % 21) / 100;
    const pricePerNight = Math.max(
      15,
      Math.round(anchor * template.priceFactor * neighborhoodFactor * variation)
    );

    const rating = (36 + (stayHash % 14)) / 10; // 3.6-4.9
    const praiseSets = PRAISE_POOL[template.type];

    stays.push({
      id,
      name: template.name(city.name, neighborhood.name),
      type: template.type,
      cityId: city.id,
      city: city.name,
      neighborhoodId: neighborhood.id,
      neighborhood: neighborhood.name,
      walkToCenterMin: neighborhood.walkToCenterMin + (stayHash % 6),
      pricePerNight,
      rating,
      reviewCount: 120 + (stayHash % 1800),
      praise: praiseSets[stayHash % praiseSets.length],
      niggle: NIGGLE_POOL[stayHash % NIGGLE_POOL.length],
      amenities: template.amenities,
      cityTaxPerNight: 2 + (stayHash % 4), // €2-5 per night
      serviceFee: 10 + (stayHash % 16), // €10-25 per stay
    });
  }

  return stays.sort((a, b) => a.pricePerNight - b.pricePerNight);
}
