"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CityAutocomplete from "@/components/ui/CityAutocomplete";
import CycleField from "@/components/ui/CycleField";
import Stepper from "@/components/ui/Stepper";
import ResultsHeader from "@/components/ui/ResultsHeader";
import TogglePill from "@/components/ui/TogglePill";
import { fadeInUp } from "@/components/motion";
import { StayPreferences, StayStyle, TravelParty } from "../types";

type Props = {
  initial: Omit<StayPreferences, "cityId"> & { cityId: string };
  onAdvise: (prefs: StayPreferences) => void;
};

const PARTY_OPTIONS: { label: string; value: TravelParty }[] = [
  { label: "Solo", value: "solo" },
  { label: "With my partner", value: "couple" },
  { label: "Family", value: "family" },
  { label: "Friends", value: "friends" },
];

const STYLE_OPTIONS: { label: string; value: StayStyle }[] = [
  { label: "Walkable streets", value: "walkable" },
  { label: "Local cafés", value: "cafes" },
  { label: "Architecture", value: "architecture" },
  { label: "Nightlife", value: "nightlife" },
  { label: "Quiet evenings", value: "quiet" },
  { label: "Beach time", value: "beach" },
  { label: "Art & museums", value: "art" },
  { label: "Food scene", value: "food" },
];

export default function StayAdvisorForm({ initial, onAdvise }: Props) {
  const [cityId, setCityId] = useState(initial.cityId);
  const [party, setParty] = useState<TravelParty>(initial.party);
  const [nights, setNights] = useState(initial.nights);
  const [budgetPerNight, setBudgetPerNight] = useState(initial.budgetPerNight);
  const [styles, setStyles] = useState<StayStyle[]>(initial.styles);

  const toggleStyle = (style: StayStyle) => {
    setStyles((current) =>
      current.includes(style)
        ? current.filter((s) => s !== style)
        : [...current, style]
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!cityId) return;
    onAdvise({ cityId, party, nights, budgetPerNight, styles });
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
      <Card as="form" padding="lg" onSubmit={handleSubmit}>
        <ResultsHeader
          title="Tell us how you travel"
          blurb="A few answers — we'll recommend the neighborhoods and stays that fit."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 items-end mb-4 sm:mb-5">
          <div>
            <label htmlFor="stay-city" className="text-caption text-[var(--fg)] block mb-2">
              City
            </label>
            <CityAutocomplete
              id="stay-city"
              value={cityId}
              onChange={setCityId}
              placeholder="Where to?"
            />
          </div>

          <CycleField
            label="Who"
            icon={<Users className="w-4 h-4" />}
            options={PARTY_OPTIONS}
            value={party}
            onChange={setParty}
          />

          <div>
            <span className="text-caption text-[var(--fg)] block mb-2">Nights</span>
            <Stepper
              value={nights}
              onChange={setNights}
              min={1}
              max={30}
              format={(v) => `${v} ${v === 1 ? "night" : "nights"}`}
            />
          </div>

          <div>
            <span className="text-caption text-[var(--fg)] block mb-2">
              Budget per night
            </span>
            <Stepper
              value={budgetPerNight}
              onChange={setBudgetPerNight}
              min={30}
              max={600}
              step={10}
              format={(v) => `€${v}`}
            />
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <span className="text-caption text-[var(--fg)] block mb-2">
            What do you enjoy?
          </span>
          <div className="flex flex-wrap gap-2">
            {STYLE_OPTIONS.map((option) => (
              <TogglePill
                key={option.value}
                selected={styles.includes(option.value)}
                onClick={() => toggleStyle(option.value)}
              >
                {option.label}
              </TogglePill>
            ))}
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={!cityId}>
          Get recommendations
        </Button>
      </Card>
    </motion.div>
  );
}
