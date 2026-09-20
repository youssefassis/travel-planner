import { getCity } from "@/domain/cities";
import { getMonthNormal } from "@/domain/climate";
import { getCountryEssentials } from "@/domain/countries";
import { PoiCategory } from "@/domain/types";
import { allLegs } from "../engine";
import { TripIntent, TripPlan } from "../types";

/**
 * What to pack, worked out from the trip rather than a generic checklist:
 * the climate of each city in the month you're going, what the itinerary
 * actually has you doing, how long you're away, and which countries you
 * pass through.
 *
 * Derived on demand, never stored — edit the plan and the list follows.
 */

export type PackingItem = {
  label: string;
  /** Why this trip needs it. Empty for the obvious staples. */
  why?: string;
};

export type PackingSection = {
  title: string;
  items: PackingItem[];
};

/** "A", "A and B", "A, B and C" — three countries shouldn't read as a chant. */
function formatList(values: string[]): string {
  if (values.length <= 1) return values[0] ?? "";
  return `${values.slice(0, -1).join(", ")} and ${values[values.length - 1]}`;
}

/** Coldest low and warmest high across the trip, plus how wet it looks. */
type Conditions = {
  low: number;
  high: number;
  rainyDays: number;
  sunHours: number;
  known: boolean;
};

function tripConditions(plan: TripPlan, month: number | undefined): Conditions {
  const empty: Conditions = { low: 0, high: 0, rainyDays: 0, sunHours: 0, known: false };
  if (month == null) return empty;

  let low = Infinity;
  let high = -Infinity;
  let rainyDays = 0;
  let sunHours = 0;
  let counted = 0;

  for (const stop of plan.stops) {
    const normal = getMonthNormal(stop.cityId, month);
    if (!normal) continue;
    low = Math.min(low, normal.low);
    high = Math.max(high, normal.high);
    // Rain days are per month; scale to the nights actually spent there.
    rainyDays += (normal.rainDays / 30) * stop.days;
    sunHours += normal.sunHours;
    counted++;
  }

  if (counted === 0) return empty;
  return {
    low,
    high,
    rainyDays: Math.round(rainyDays),
    sunHours: sunHours / counted,
    known: true,
  };
}

function categoriesInPlan(plan: TripPlan): Set<PoiCategory> {
  return new Set(
    plan.itinerary.flatMap((day) => day.activities.map((a) => a.category)),
  );
}

function clothing(plan: TripPlan, conditions: Conditions): PackingItem[] {
  const nights = plan.itinerary.length;
  // A week's worth is the sensible ceiling — past that you do laundry.
  const outfits = Math.min(nights, 7);
  const items: PackingItem[] = [
    {
      label: `${outfits} day's worth of clothes`,
      why:
        nights > 7
          ? `${nights} nights away — plan on a laundry stop`
          : `${nights} ${nights === 1 ? "night" : "nights"} away`,
    },
    { label: "Comfortable walking shoes", why: "The itinerary is built on foot" },
  ];

  if (!conditions.known) {
    items.push({
      label: "Layers for mixed weather",
      why: "No travel month set — pack for a range",
    });
    return items;
  }

  if (conditions.low <= 5) {
    items.push({
      label: "Warm coat, hat and gloves",
      why: `Lows around ${Math.round(conditions.low)}°C`,
    });
  } else if (conditions.low <= 12) {
    items.push({
      label: "Warm layer for the evenings",
      why: `Drops to about ${Math.round(conditions.low)}°C after dark`,
    });
  }

  if (conditions.high >= 26) {
    items.push({
      label: "Light, breathable clothes",
      why: `Highs around ${Math.round(conditions.high)}°C`,
    });
  }

  if (conditions.high - conditions.low >= 12) {
    items.push({
      label: "Layers you can shed",
      why: `${Math.round(conditions.low)}–${Math.round(conditions.high)}°C across the trip`,
    });
  }

  return items;
}

function weather(conditions: Conditions): PackingItem[] {
  if (!conditions.known) return [];
  const items: PackingItem[] = [];

  if (conditions.rainyDays >= 3) {
    items.push({
      label: "Rain jacket or compact umbrella",
      why: `Around ${conditions.rainyDays} wet days expected`,
    });
  }
  if (conditions.sunHours >= 7 || conditions.high >= 25) {
    items.push({
      label: "Sunscreen and sunglasses",
      why: `About ${Math.round(conditions.sunHours)} hours of sun a day`,
    });
  }
  if (conditions.low <= 0) {
    items.push({
      label: "Thermal base layer",
      why: "Freezing overnight — worth the space",
    });
  }

  return items;
}

const ACTIVITY_KIT: { category: PoiCategory; label: string; why: string }[] = [
  {
    category: "nature",
    label: "Daypack and a water bottle",
    why: "There are outdoor stops on the itinerary",
  },
  {
    category: "nightlife",
    label: "One smarter outfit",
    why: "Some venues on the plan expect it",
  },
  {
    category: "museum",
    label: "A bag that meets cloakroom rules",
    why: "Large backpacks are often turned away",
  },
];

function activityKit(plan: TripPlan, conditions: Conditions): PackingItem[] {
  const categories = categoriesInPlan(plan);
  const items = ACTIVITY_KIT.filter((kit) => categories.has(kit.category)).map(
    ({ label, why }) => ({ label, why }),
  );

  // Beach cities earn swimwear when it's actually warm enough to use it.
  const beachCity = plan.stops.some((stop) =>
    getCity(stop.cityId)?.interests.includes("beach"),
  );
  if (beachCity && conditions.known && conditions.high >= 24) {
    items.push({
      label: "Swimwear",
      why: `Highs around ${Math.round(conditions.high)}°C`,
    });
  }

  return items;
}

function documents(plan: TripPlan, intent: TripIntent): PackingItem[] {
  const items: PackingItem[] = [
    { label: "Passport or ID card" },
    { label: "Travel insurance details" },
  ];

  const flying = allLegs(plan).some((leg) => leg.mode === "flight");
  if (flying) {
    items.push({
      label: "Boarding passes and 100ml liquids bag",
      why: "The route includes a flight",
    });
  }
  if (allLegs(plan).some((leg) => leg.mode === "car")) {
    items.push({
      label: "Driving licence",
      why: "One leg of the route is by car",
    });
  }
  if (intent.startDate) {
    items.push({
      label: "Booking confirmations",
      why: "Saved offline in case there's no signal",
    });
  }

  return items;
}

function practical(plan: TripPlan): PackingItem[] {
  const countries = [...new Set(plan.stops.map((stop) => stop.country))];
  const essentials = countries
    .map((country) => getCountryEssentials(country))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined);

  const plugs = [...new Set(essentials.flatMap((entry) => entry.plugTypes))].sort();
  const nonEuro = essentials.filter((entry) => !entry.currency.startsWith("Euro"));

  const items: PackingItem[] = [];

  if (plugs.length > 0) {
    items.push({
      label: `Plug adapter — type ${plugs.join(", ")}`,
      why:
        plugs.length > 1
          ? `Sockets differ across ${formatList(countries)}`
          : `Used throughout ${countries[0]}`,
    });
  }

  items.push({ label: "Phone charger and a power bank" });

  if (nonEuro.length > 0) {
    items.push({
      label: `Card that works abroad — ${formatList(
        nonEuro.map((entry) => entry.currency),
      )}`,
      why: `${formatList(nonEuro.map((e) => e.country))} ${
        nonEuro.length === 1 ? "is" : "are"
      } not on the euro`,
    });
  }

  const meds = plan.itinerary.length >= 5;
  if (meds) {
    items.push({
      label: "Basic medicines and plasters",
      why: "Long enough that a pharmacy run would cost you a morning",
    });
  }

  return items;
}

/** The whole list, with empty sections dropped. */
export function packingList(
  plan: TripPlan,
  intent: TripIntent,
): PackingSection[] {
  const conditions = tripConditions(plan, intent.travelMonth);

  return [
    { title: "Clothing", items: clothing(plan, conditions) },
    { title: "For the weather", items: weather(conditions) },
    { title: "For what you're doing", items: activityKit(plan, conditions) },
    { title: "Documents", items: documents(plan, intent) },
    { title: "Practical", items: practical(plan) },
  ].filter((section) => section.items.length > 0);
}
