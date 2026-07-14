import { FareSignal, FlightOption, FlightPick } from "../types";
import { departureMinutes, formatDuration } from "./format";

/**
 * Turns a raw result list into 3-5 tailored picks with plain-language
 * trade-offs and a book-now-or-monitor signal, so choosing a flight is a
 * decision, not a search. Pure and deterministic.
 */
export function recommendFlights(options: FlightOption[]): FlightPick[] {
  if (options.length === 0) return [];

  const cheapest = minBy(options, (f) => f.price);
  const fastest = minBy(options, (f) => f.durationHrs);
  const best = minBy(options, (f) => overallScore(f, options));
  const earliest = minBy(options, (f) => departureMinutes(f.departureTime));
  const directs = options.filter((f) => f.stops === 0);
  const bestDirect = directs.length > 0 ? minBy(directs, (f) => f.price) : null;

  const median = medianPrice(options);

  const picks: FlightPick[] = [];
  const used = new Set<string>();

  const add = (flight: FlightOption, tag: string) => {
    if (used.has(flight.id) || picks.length >= 5) return;
    used.add(flight.id);
    picks.push({
      flight,
      tag,
      reasons: buildReasons(flight, cheapest, fastest),
      signal: fareSignal(flight, median),
    });
  };

  add(best, "Best overall");
  add(cheapest, "Cheapest");
  add(fastest, "Fastest");
  if (bestDirect) add(bestDirect, "Best direct");
  add(earliest, "Early departure");

  return picks;
}

function overallScore(flight: FlightOption, pool: FlightOption[]): number {
  const prices = pool.map((f) => f.price);
  const durations = pool.map((f) => f.durationHrs);
  return (
    0.5 * normalize(flight.price, prices) +
    0.3 * normalize(flight.durationHrs, durations) +
    0.2 * (flight.stops > 0 ? 1 : 0)
  );
}

function normalize(value: number, pool: number[]): number {
  const min = Math.min(...pool);
  const max = Math.max(...pool);
  return max === min ? 0 : (value - min) / (max - min);
}

function minBy<T>(items: T[], selector: (item: T) => number): T {
  return items.reduce((best, item) =>
    selector(item) < selector(best) ? item : best
  );
}

function medianPrice(options: FlightOption[]): number {
  const sorted = [...options].sort((a, b) => a.price - b.price);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1].price + sorted[mid].price) / 2)
    : sorted[mid].price;
}

function buildReasons(
  flight: FlightOption,
  cheapest: FlightOption,
  fastest: FlightOption
): string[] {
  const reasons: string[] = [];

  if (flight.price === cheapest.price) {
    reasons.push("Lowest fare on this route");
  } else {
    reasons.push(`€${flight.price - cheapest.price} more than the cheapest`);
  }

  if (flight.durationHrs === fastest.durationHrs) {
    reasons.push(`Fastest at ${formatDuration(flight.durationHrs)}`);
  } else {
    reasons.push(
      `${formatDuration(flight.durationHrs - fastest.durationHrs)} longer than the fastest`
    );
  }

  reasons.push(
    flight.stops === 0
      ? `Direct, departs ${flight.departureTime}`
      : `1 stop, departs ${flight.departureTime}`
  );

  return reasons;
}

function fareSignal(flight: FlightOption, median: number): FareSignal {
  if (flight.price <= median * 0.92) {
    return {
      level: "book",
      text: `Below the typical €${median} fare for this route — good time to book`,
    };
  }
  if (flight.price <= median * 1.05) {
    return {
      level: "fair",
      text: `In line with the typical €${median} fare — book if the times suit`,
    };
  }
  return {
    level: "monitor",
    text: `Above the typical €${median} fare — worth monitoring`,
  };
}
