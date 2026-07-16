import { Droplets } from "lucide-react";
import { MonthlyNormal, MONTHS } from "@/domain/climate";

type Props = {
  months: MonthlyNormal[]; // 12, Jan→Dec
  /** Month indices to emphasize (e.g. best months, or the matched month). */
  highlight?: number[];
};

/** Daytime high → color, cold blue through to hot red. */
function tempColor(high: number): string {
  const t = Math.max(0, Math.min(1, high / 35));
  return `hsl(${Math.round(210 - t * 202)} 70% 55%)`;
}

/**
 * A compact year-at-a-glance strip: one column per month with a temperature
 * bar (height and color track the daytime high), the high in °C, rainy-day
 * count, and the month label. Highlighted months read in the accent color.
 */
export default function ClimateStrip({ months, highlight = [] }: Props) {
  const highs = months.map((m) => m.high);
  const min = Math.min(...highs);
  const max = Math.max(...highs);
  const span = Math.max(1, max - min);
  const highlighted = new Set(highlight);

  return (
    <div className="grid grid-cols-12 gap-1 sm:gap-1.5">
      {months.map((m) => {
        const isHigh = highlighted.has(m.monthIndex);
        const heightPct = 30 + ((m.high - min) / span) * 70; // 30-100%
        return (
          <div key={m.monthIndex} className="flex flex-col items-center gap-1 min-w-0">
            <span className="text-[10px] font-semibold text-[var(--fg)] tabular-nums">
              {m.high}°
            </span>
            <div className="w-full h-16 sm:h-20 flex items-end rounded-md bg-[var(--card-subtle)] overflow-hidden">
              <div
                className="w-full rounded-md transition-all"
                style={{ height: `${heightPct}%`, background: tempColor(m.high) }}
              />
            </div>
            <span className="flex items-center gap-0.5 text-[9px] text-[var(--muted)] tabular-nums">
              <Droplets className="w-2.5 h-2.5" />
              {m.rainDays}
            </span>
            <span
              className={`text-[10px] font-medium ${
                isHigh ? "text-[var(--primary)]" : "text-[var(--muted)]"
              }`}
            >
              {MONTHS[m.monthIndex]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
