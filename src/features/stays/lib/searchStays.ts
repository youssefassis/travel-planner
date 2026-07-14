import { BudgetTier } from "@/domain/types";
import { getCity } from "@/domain/cities";
import { StayOption, StayType } from "../types";

type StayTemplate = {
  slug: string;
  name: (cityName: string) => string;
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
    slug: "old-town-apartments",
    name: (c) => `${c} Old Town Apartments`,
    type: "apartment",
    amenities: ["WiFi", "Kitchen", "Washer"],
    priceFactor: 0.9,
  },
  {
    slug: "backpackers-hostel",
    name: (c) => `${c} Backpackers Hostel`,
    type: "hostel",
    amenities: ["WiFi", "Shared Kitchen", "Lockers"],
    priceFactor: 0.55,
  },
  {
    slug: "grand-palace",
    name: (c) => `Grand ${c} Palace`,
    type: "hotel",
    amenities: ["WiFi", "Pool", "Spa", "Bar"],
    priceFactor: 1.45,
  },
  {
    slug: "riverside-suites",
    name: (c) => `${c} Riverside Suites`,
    type: "apartment",
    amenities: ["WiFi", "Balcony", "City View"],
    priceFactor: 1.15,
  },
  {
    slug: "boutique-house",
    name: (c) => `Boutique ${c} House`,
    type: "hotel",
    amenities: ["WiFi", "Gym", "Room Service"],
    priceFactor: 1.25,
  },
];

/** Deterministic djb2 string hash — keeps mock results stable across renders. */
function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function searchStays(cityId: string, budget?: BudgetTier): StayOption[] {
  const city = getCity(cityId);
  if (!city) return [];

  const tier: BudgetTier = budget ?? "comfort";
  const anchorPrice = city.stayPerNight[tier];

  const cityHash = hashString(`${city.id}:${tier}`);
  const count = 4 + (cityHash % 3); // 4-6 stays per city
  const start = cityHash % STAY_TEMPLATES.length;

  const stays: StayOption[] = [];
  for (let i = 0; i < count; i++) {
    const template = STAY_TEMPLATES[(start + i) % STAY_TEMPLATES.length];
    const id = `${city.id}--${template.slug}`;
    const stayHash = hashString(id);

    const priceVariation = 0.9 + (stayHash % 21) / 100; // 0.90-1.10
    const pricePerNight = Math.max(
      10,
      Math.round(anchorPrice * template.priceFactor * priceVariation)
    );
    const rating = (38 + (stayHash % 12)) / 10; // 3.8-4.9

    stays.push({
      id,
      name: template.name(city.name),
      type: template.type,
      cityId: city.id,
      city: city.name,
      pricePerNight,
      rating,
      amenities: template.amenities,
    });
  }

  return stays.sort((a, b) => a.pricePerNight - b.pricePerNight);
}
