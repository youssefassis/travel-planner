"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import CityAutocomplete from "@/components/ui/CityAutocomplete";
import FilterPills from "@/components/ui/FilterPills";
import MotionCard from "@/components/ui/MotionCard";
import Price from "@/components/ui/Price";
import ResultsHeader from "@/components/ui/ResultsHeader";
import Stepper from "@/components/ui/Stepper";
import { staggerChildren } from "@/components/motion";
import { MONTH_NAMES } from "@/domain/climate";
import { getCity } from "@/domain/cities";
import { BudgetTier } from "@/domain/types";
import { COMPANION_OPTIONS } from "@/features/planner/lib/options";
import { TripIntent } from "@/features/planner/types";
import { motion } from "framer-motion";

import {
  AffordabilityQuery,
  AffordableTrip,
  affordableTrips,
  plannerUrlFor,
} from "../_lib/affordable";

const TIER_LABEL: Record<BudgetTier, string> = {
  backpacker: "Backpacker",
  comfort: "Comfort",
  luxury: "Luxury",
};

const TIER_TONE: Record<BudgetTier, "neutral" | "brand" | "success"> = {
  backpacker: "neutral",
  comfort: "brand",
  luxury: "success",
};

/** How many to show before the list stops being a decision and starts being a catalogue. */
const SHOWN = 9;

export default function AffordabilityPanel() {
  const [originCityId, setOriginCityId] = useState("paris-fr");
  const [budget, setBudget] = useState(1200);
  const [nights, setNights] = useState(5);
  const [companions, setCompanions] =
    useState<TripIntent["companions"]>("solo");
  const [month, setMonth] = useState<number | undefined>(undefined);

  const originName = getCity(originCityId)?.name;

  const query: AffordabilityQuery = useMemo(
    () => ({ originCityId, budget, nights, companions, travelMonth: month }),
    [originCityId, budget, nights, companions, month],
  );

  // Pricing 40 cities at 3 tiers is a few milliseconds of pure engine work,
  // so results follow the controls directly rather than waiting for a submit.
  const { affordable, nearMisses } = useMemo(
    () => (originName ? affordableTrips(query) : { affordable: [], nearMisses: [] }),
    [query, originName],
  );

  const shown = affordable.slice(0, SHOWN);

  return (
    <>
      <Card padding="lg" className="mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <label
              htmlFor="afford-origin"
              className="text-caption text-[var(--fg)] block mb-2"
            >
              Travelling from
            </label>
            <CityAutocomplete
              id="afford-origin"
              value={originCityId}
              onChange={setOriginCityId}
              placeholder="Your home city"
            />
          </div>

          <div>
            <span className="text-caption text-[var(--fg)] block mb-2">
              Budget per person
            </span>
            <Stepper
              value={budget}
              onChange={setBudget}
              min={200}
              max={6000}
              step={100}
              format={(v) => `€${v.toLocaleString("en-GB")}`}
            />
          </div>

          <div>
            <span className="text-caption text-[var(--fg)] block mb-2">
              How long
            </span>
            <Stepper
              value={nights}
              onChange={setNights}
              min={2}
              max={21}
              format={(v) => `${v} ${v === 1 ? "day" : "days"}`}
            />
          </div>

          <div>
            <label
              htmlFor="afford-month"
              className="text-caption text-[var(--fg)] block mb-2"
            >
              When
            </label>
            <select
              id="afford-month"
              value={month ?? "any"}
              onChange={(e) =>
                setMonth(e.target.value === "any" ? undefined : Number(e.target.value))
              }
              className="w-full rounded-full border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-2.5 text-sm text-[var(--fg)]"
            >
              <option value="any">Any time</option>
              {MONTH_NAMES.map((name, index) => (
                <option key={name} value={index}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <span className="text-caption text-[var(--fg)] block mb-2">Who</span>
            <FilterPills
              options={COMPANION_OPTIONS}
              value={companions}
              onChange={setCompanions}
              ariaLabel="Who's travelling"
            />
          </div>
        </div>
      </Card>

      {!originName ? (
        <p className="text-center py-16 text-[var(--muted)]">
          Pick where you&apos;re travelling from to see what your budget reaches.
        </p>
      ) : affordable.length > 0 ? (
        <>
          <ResultsHeader
            title={`€${budget.toLocaleString("en-GB")} reaches ${affordable.length} ${
              affordable.length === 1 ? "destination" : "destinations"
            } from ${originName}`}
            blurb="Best trip your money buys first. Every figure is a real plan — flights home included."
          />
          <motion.div
            key={`${originCityId}-${budget}-${nights}-${companions}-${month}`}
            initial="hidden"
            animate="visible"
            variants={staggerChildren(0.05)}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {shown.map((trip) => (
              <TripCard key={trip.city.id} trip={trip} query={query} />
            ))}
          </motion.div>
          {affordable.length > shown.length && (
            <p className="mt-4 text-small text-[var(--muted)]">
              Showing the {shown.length} best of {affordable.length} — narrow the
              dates or raise the budget to sharpen the list.
            </p>
          )}
        </>
      ) : (
        <p className="text-center py-10 text-[var(--muted)]">
          €{budget.toLocaleString("en-GB")} doesn&apos;t quite cover {nights} days
          anywhere yet.
        </p>
      )}

      {nearMisses.length > 0 && (
        <section className="mt-12">
          <ResultsHeader
            title="Just out of reach"
            blurb="The closest trips your budget doesn't cover — and what they'd take."
          />
          <ul className="space-y-2">
            {nearMisses.map((trip) => (
              <li
                key={trip.city.id}
                className="flex items-center justify-between gap-3 text-sm py-2 border-b border-[var(--border)] last:border-0"
              >
                <span className="text-[var(--fg)] font-medium">
                  {trip.city.name}
                  <span className="text-[var(--muted)] font-normal">
                    {" "}
                    · {trip.city.country}
                  </span>
                </span>
                <span className="text-[var(--muted)] shrink-0">
                  €{trip.total} — €{Math.abs(trip.headroom)} more
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function TripCard({
  trip,
  query,
}: {
  trip: AffordableTrip;
  query: AffordabilityQuery;
}) {
  return (
    <MotionCard padding="lg" className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-h3 text-[var(--fg)] truncate">{trip.city.name}</h3>
          <p className="text-small text-[var(--muted)]">{trip.city.country}</p>
        </div>
        <Badge tone={TIER_TONE[trip.tier]}>{TIER_LABEL[trip.tier]}</Badge>
      </div>

      <div className="mt-auto flex items-end justify-between gap-3">
        <Price
          amount={`€${trip.total.toLocaleString("en-GB")}`}
          size="md"
          sub={
            trip.headroom > 0
              ? `€${trip.headroom} to spare`
              : "Uses the whole budget"
          }
        />
        <Button
          asLink
          href={plannerUrlFor(trip, query)}
          size="sm"
          variant="secondary"
          icon={<ArrowRight className="w-3.5 h-3.5" />}
          iconPosition="right"
        >
          Plan it
        </Button>
      </div>
    </MotionCard>
  );
}
