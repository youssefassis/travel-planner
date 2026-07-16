import {
  Neighborhood,
  NeighborhoodPick,
  StayAdvice,
  StayOption,
  StayPick,
  StayPreferences,
  StayStyle,
} from "../types";
import { getNeighborhoods, getStays } from "./stays";

const STYLE_PHRASES: Record<StayStyle, string> = {
  walkable: "easy to explore on foot",
  cafes: "independent cafés on every corner",
  architecture: "landmark architecture at every turn",
  nightlife: "bars and venues within walking distance",
  quiet: "calm streets after dark",
  beach: "minutes from the waterfront",
  art: "galleries and studios nearby",
  food: "a dense local food scene",
};

/** Round a €/night budget to the advisor form's €10 stepper grid. */
export function roundBudget(value: number): number {
  return Math.min(600, Math.max(30, Math.round(value / 10) * 10));
}

/**
 * The advisor: turns preferences into 2 neighborhood recommendations and
 * up to 4 stays with distinct strengths, explained trade-offs, guest-feedback
 * digests, and true totals (taxes + fees included). Pure and deterministic.
 */
export function adviseStays(prefs: StayPreferences): StayAdvice {
  const stays = getStays(prefs.cityId);
  const neighborhoods = getNeighborhoods(prefs.cityId);
  if (stays.length === 0) return { neighborhoods: [], picks: [] };

  const rankedNeighborhoods = neighborhoods
    .map((neighborhood) => ({
      neighborhood,
      fit: neighborhoodFit(neighborhood, prefs),
    }))
    .sort((a, b) => b.fit - a.fit || a.neighborhood.walkToCenterMin - b.neighborhood.walkToCenterMin)
    .slice(0, 2)
    .map(({ neighborhood }) => buildNeighborhoodPick(neighborhood, stays, prefs));

  const picks = buildStayPicks(stays, prefs);

  return { neighborhoods: rankedNeighborhoods, picks };
}

/* ─── Neighborhoods ─────────────────────────────────────────────── */

function neighborhoodFit(neighborhood: Neighborhood, prefs: StayPreferences): number {
  if (prefs.styles.length === 0) {
    // No stated style: prefer central, mid-priced areas.
    return 3 - neighborhood.walkToCenterMin / 30 - Math.abs(neighborhood.priceLevel - 2);
  }
  const matches = neighborhood.traits.filter((t) => prefs.styles.includes(t)).length;
  return matches * 2 + (30 - neighborhood.walkToCenterMin) / 30;
}

function buildNeighborhoodPick(
  neighborhood: Neighborhood,
  stays: StayOption[],
  prefs: StayPreferences
): NeighborhoodPick {
  const local = stays.filter((s) => s.neighborhoodId === neighborhood.id);
  const avgPricePerNight =
    local.length > 0
      ? Math.round(local.reduce((sum, s) => sum + s.pricePerNight, 0) / local.length)
      : 0;

  const matched = neighborhood.traits.filter((t) => prefs.styles.includes(t));
  const reasons = (matched.length > 0 ? matched : neighborhood.traits.slice(0, 2)).map(
    (trait) => STYLE_PHRASES[trait]
  );
  reasons.push(`${neighborhood.walkToCenterMin} min on foot to the center`);

  return { neighborhood, reasons, avgPricePerNight, stayCount: local.length };
}

/* ─── Stay picks ────────────────────────────────────────────────── */

function buildStayPicks(stays: StayOption[], prefs: StayPreferences): StayPick[] {
  const withinBudget = stays.filter((s) => s.pricePerNight <= prefs.budgetPerNight * 1.1);
  const pool = withinBudget.length > 0 ? withinBudget : stays;

  const neighborhoodsById = new Map(
    getNeighborhoods(prefs.cityId).map((n) => [n.id, n])
  );
  const styleFit = (stay: StayOption): number => {
    const traits = neighborhoodsById.get(stay.neighborhoodId)?.traits ?? [];
    const matches = traits.filter((t) => prefs.styles.includes(t)).length;
    const partyBonus =
      (prefs.party === "family" && stay.type === "apartment") ||
      (prefs.party === "solo" && stay.type === "hostel")
        ? 0.5
        : 0;
    return matches + partyBonus + stay.rating / 10;
  };

  const picks: StayPick[] = [];
  const used = new Set<string>();
  // Each tag picks from the stays not already chosen, so the four cards
  // always show genuinely different options (one stay can otherwise win
  // every criterion in a small market).
  const remaining = (from: StayOption[]) => from.filter((s) => !used.has(s.id));

  // The value baseline is fixed up front so every card's trade-off compares
  // against the same reference.
  const valueBaseline = maxBy(pool, (s) => s.rating / s.pricePerNight);

  const add = (stay: StayOption | null, tag: string) => {
    if (!stay || used.has(stay.id) || picks.length >= 4) return;
    used.add(stay.id);
    picks.push(buildPick(stay, tag, valueBaseline, prefs, neighborhoodsById));
  };

  add(maxBy(pool, styleFit), "Best match");
  add(maxBy(remaining(pool), (s) => s.rating / s.pricePerNight), "Best value");
  add(minBy(remaining(pool), (s) => s.walkToCenterMin), "Most central");
  const splurge = maxBy(
    remaining(stays).filter((s) => s.pricePerNight > prefs.budgetPerNight),
    (s) => s.rating
  );
  add(splurge ?? maxBy(remaining(pool), (s) => s.rating), splurge ? "Worth the splurge" : "Top rated");

  return picks;
}

function buildPick(
  stay: StayOption,
  tag: string,
  valueBaseline: StayOption | null,
  prefs: StayPreferences,
  neighborhoodsById: Map<string, Neighborhood>
): StayPick {
  const traits = neighborhoodsById.get(stay.neighborhoodId)?.traits ?? [];
  const matched = traits.filter((t) => prefs.styles.includes(t));

  const reasons: string[] = [];
  reasons.push(
    `${stay.neighborhood} — ${
      matched.length > 0 ? STYLE_PHRASES[matched[0]] : `${stay.walkToCenterMin} min to the center`
    }`
  );
  if (matched.length > 1) reasons.push(STYLE_PHRASES[matched[1]]);
  reasons.push(
    stay.pricePerNight <= prefs.budgetPerNight
      ? `€${stay.pricePerNight}/night — within your €${prefs.budgetPerNight} budget`
      : `€${stay.pricePerNight}/night — €${stay.pricePerNight - prefs.budgetPerNight} over your budget`
  );

  const nightly = stay.pricePerNight * prefs.nights;
  const taxes = stay.cityTaxPerNight * prefs.nights;
  const fees = stay.serviceFee;

  return {
    stay,
    tag,
    reasons,
    reviewSummary: buildReviewSummary(stay),
    tradeOff: buildTradeOff(stay, valueBaseline),
    totalCost: { nightly, taxes, fees, total: nightly + taxes + fees },
  };
}

function buildReviewSummary(stay: StayOption): string {
  const praise = `Guests keep mentioning ${stay.praise.join(" and ")}`;
  return stay.niggle ? `${praise}; a few note ${stay.niggle}.` : `${praise}.`;
}

function buildTradeOff(stay: StayOption, valueBaseline: StayOption | null): string | null {
  if (!valueBaseline || stay.id === valueBaseline.id) return null;
  const priceDiff = stay.pricePerNight - valueBaseline.pricePerNight;
  const minutesSaved = valueBaseline.walkToCenterMin - stay.walkToCenterMin;

  if (priceDiff > 0 && minutesSaved > 0) {
    return `€${priceDiff}/night more than ${valueBaseline.name}, but ${minutesSaved} min closer to the center`;
  }
  if (priceDiff > 0) {
    return `€${priceDiff}/night more than ${valueBaseline.name} for ${
      stay.rating > valueBaseline.rating ? "a higher guest score" : "a different area"
    }`;
  }
  if (priceDiff < 0) {
    return `€${-priceDiff}/night cheaper than ${valueBaseline.name}${
      minutesSaved < 0 ? `, ${-minutesSaved} min further out` : ""
    }`;
  }
  return null;
}

/* ─── Helpers ───────────────────────────────────────────────────── */

function maxBy<T>(items: T[], selector: (item: T) => number): T | null {
  if (items.length === 0) return null;
  return items.reduce((best, item) => (selector(item) > selector(best) ? item : best));
}

function minBy<T>(items: T[], selector: (item: T) => number): T | null {
  if (items.length === 0) return null;
  return items.reduce((best, item) => (selector(item) < selector(best) ? item : best));
}
