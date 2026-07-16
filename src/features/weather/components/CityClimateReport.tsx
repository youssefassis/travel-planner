"use client";

import { motion } from "framer-motion";
import { CalendarCheck, Droplets, Sun, Thermometer } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { fadeInUp, staggerChildren } from "@/components/motion";
import { CityWeatherReport, MONTH_FULL, MonthVerdict } from "../types";
import ClimateStrip from "./ClimateStrip";

type Props = {
  report: CityWeatherReport;
};

function BestMonthCard({ verdict }: { verdict: MonthVerdict }) {
  const { normal, label } = verdict;
  return (
    <motion.div variants={fadeInUp}>
      <Card padding="md" className="h-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-h3 text-[var(--fg)]">{MONTH_FULL[normal.monthIndex]}</span>
          <span className="text-caption px-2.5 py-1 rounded-full bg-[var(--primary)] text-white">
            {label}
          </span>
        </div>
        <dl className="space-y-1.5 text-small text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-[var(--primary)]" />
            {normal.high}° / {normal.low}° day-night
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-[var(--primary)]" />
            {normal.rainDays} rainy {normal.rainDays === 1 ? "day" : "days"}
          </div>
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-[var(--primary)]" />
            {normal.sunHours}h of sun a day
          </div>
        </dl>
      </Card>
    </motion.div>
  );
}

/** The city→best-months view: top three windows, then the year-round strip. */
export default function CityClimateReport({ report }: Props) {
  const { city, months, bestMonths } = report;
  const highlight = bestMonths.map((m) => m.normal.monthIndex);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-10">
        <h2 className="flex items-center gap-2 text-h2 text-[var(--fg)] mb-1">
          <CalendarCheck className="w-5 h-5 text-[var(--primary)]" />
          Best time to visit {city.name}
        </h2>
        <p className="text-small text-[var(--muted)] mb-6">
          The three most comfortable months, then the whole year at a glance.
        </p>
        <motion.div
          key={`best-${city.id}`}
          initial="hidden"
          animate="visible"
          variants={staggerChildren(0.08)}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {bestMonths.map((verdict) => (
            <BestMonthCard key={verdict.normal.monthIndex} verdict={verdict} />
          ))}
        </motion.div>
      </div>

      <Card padding="lg" className="mb-8">
        <h3 className="text-h3 text-[var(--fg)] mb-1">{city.name} year-round</h3>
        <p className="text-small text-[var(--muted)] mb-6">
          Daytime highs (°C) and rainy days each month · best months in accent
        </p>
        <ClimateStrip months={months.map((m) => m.normal)} highlight={highlight} />
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asLink href={`/planner?destination=${city.id}`}>
          Plan a trip to {city.name}
        </Button>
        <Button asLink href={`/stays?city=${city.id}`} variant="secondary">
          Find stays
        </Button>
        <Button asLink href={`/flights?to=${city.id}`} variant="secondary">
          Find flights
        </Button>
      </div>
    </motion.div>
  );
}
