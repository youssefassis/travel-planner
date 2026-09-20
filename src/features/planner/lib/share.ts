import { Interest, Pace, Region } from "@/domain/types";
import { getCity } from "@/domain/cities";
import { isISODate, monthOfISODate } from "@/domain/dates";
import { CityStay, TripIntent, TripPlan } from "../types";
import { buildDaySchedule, formatClock } from "../engine";

/**
 * Sharing works without a backend because the trip engine is deterministic:
 * a link only carries the *intent*, and the recipient's browser regenerates
 * the exact same plan from it.
 */

const INTERESTS: Interest[] = [
  "culture",
  "food",
  "nature",
  "nightlife",
  "beach",
  "history",
  "art",
  "adventure",
];

const REGIONS: Region[] = [
  "iberia",
  "france",
  "british-isles",
  "benelux",
  "central",
  "italy",
  "nordics",
  "balkans",
  "east",
];

const PACES: Pace[] = ["chill", "balanced", "intense"];

export function intentToShareParams(intent: TripIntent): URLSearchParams {
  const params = new URLSearchParams();
  params.set("plan", "1");
  params.set("mode", intent.mode);
  params.set("from", intent.originCityId);
  params.set("d", String(intent.duration));
  if (intent.travelMonth != null) params.set("m", String(intent.travelMonth));
  if (intent.startDate) params.set("sd", intent.startDate);
  params.set("who", intent.companions);
  params.set("pace", intent.vibe.pace);
  params.set("budget", intent.vibe.budget);
  if (intent.interests.length > 0) params.set("interests", intent.interests.join(","));
  if (intent.vibe.climate && intent.vibe.climate !== "any")
    params.set("climate", intent.vibe.climate);
  if (intent.region && intent.region !== "any") params.set("region", intent.region);
  if (intent.mode === "custom" && intent.selectedCityIds.length > 0)
    params.set("cities", intent.selectedCityIds.join(","));
  return params;
}

/** Parses a shared plan link; null when the params aren't a share link. */
export function intentFromShareParams(params: URLSearchParams): TripIntent | null {
  if (params.get("plan") !== "1") return null;

  const originCityId = params.get("from") ?? "";
  if (!getCity(originCityId)) return null;

  const duration = parseInt(params.get("d") ?? "", 10);
  if (!Number.isFinite(duration) || duration < 1 || duration > 30) return null;

  // A start date pins the month, so it wins over whatever `m` says.
  const sharedDate = params.get("sd");
  const startDate = isISODate(sharedDate) ? sharedDate : undefined;
  const monthRaw = parseInt(params.get("m") ?? "", 10);
  const travelMonth =
    monthOfISODate(startDate) ??
    (Number.isInteger(monthRaw) && monthRaw >= 0 && monthRaw <= 11
      ? monthRaw
      : undefined);

  const mode = params.get("mode") === "custom" ? "custom" : "surprise";
  const who = params.get("who");
  const pace = params.get("pace");
  const budget = params.get("budget");
  const climate = params.get("climate");
  const region = params.get("region");

  const selectedCityIds =
    params
      .get("cities")
      ?.split(",")
      .filter((id) => getCity(id)) ?? [];
  if (mode === "custom" && selectedCityIds.length === 0) return null;

  const interests = (params.get("interests")?.split(",") ?? []).filter(
    (i): i is Interest => (INTERESTS as string[]).includes(i)
  );

  return {
    mode,
    originCityId,
    selectedCityIds,
    duration,
    travelMonth,
    startDate,
    companions: who === "couple" || who === "group" ? who : "solo",
    interests,
    region: REGIONS.includes(region as Region) ? (region as Region) : "any",
    vibe: {
      pace: PACES.includes(pace as Pace) ? (pace as Pace) : "balanced",
      budget:
        budget === "backpacker" || budget === "luxury" ? budget : "comfort",
      climate:
        climate === "cold" || climate === "temperate" || climate === "warm"
          ? climate
          : "any",
    },
  };
}

export function buildShareUrl(intent: TripIntent, origin: string): string {
  return `${origin}/planner?${intentToShareParams(intent).toString()}`;
}

/**
 * Multi-stop walking/driving route through the trip's cities, ready to open
 * in the Google Maps app on any phone.
 */
export function googleMapsRouteUrl(stops: CityStay[]): string {
  const waypoints = stops
    .map((stop) => `${stop.coords.lat.toFixed(4)},${stop.coords.lng.toFixed(4)}`)
    .join("/");
  return `https://www.google.com/maps/dir/${waypoints}`;
}

/** A compact plain-text itinerary — pasteable into any chat app. */
export function planToText(plan: TripPlan, pace: Pace): string {
  const route = plan.stops.map((s) => s.city).join(" → ");
  const days = plan.itinerary.length;

  const lines: string[] = [
    `Trip plan: ${route} (${days} ${days === 1 ? "day" : "days"})`,
    `Budget ≈ €${plan.budget.total} per person (€${plan.budget.perDay}/day)` +
      (plan.budget.travelers > 1
        ? ` · €${plan.budget.partyTotal} for ${plan.budget.travelers}`
        : ""),
    "",
  ];

  for (const day of plan.itinerary) {
    lines.push(`${day.label} · ${day.city}`);
    const schedule = buildDaySchedule(day, pace);
    for (const item of schedule.items) {
      if (item.kind === "activity") {
        const extras = [
          item.activity.price > 0 ? `€${item.activity.price}` : null,
          item.activity.bookAhead ? "book ahead" : null,
        ]
          .filter(Boolean)
          .join(", ");
        lines.push(
          `  ${formatClock(item.startMin)}  ${item.activity.name}${
            extras ? ` (${extras})` : ""
          }`
        );
      } else if (item.activity) {
        lines.push(
          `  ${formatClock(item.startMin)}  ${item.label} at ${item.activity.name}${
            item.activity.price > 0 ? ` (≈€${item.activity.price} pp)` : ""
          }`
        );
      } else {
        lines.push(`  ${formatClock(item.startMin)}  ${item.label}`);
      }
    }
    lines.push("");
  }

  const bookings = plan.itinerary.flatMap((day) =>
    day.activities.filter((a) => a.bookAhead).map((a) => `  ${a.name} (${day.label})`)
  );
  if (bookings.length > 0) {
    lines.push("Book before you go:");
    lines.push(...bookings);
  }

  return lines.join("\n").trimEnd();
}
