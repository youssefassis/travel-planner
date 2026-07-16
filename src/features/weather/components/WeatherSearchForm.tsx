"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { CloudSun, Sun } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CityAutocomplete from "@/components/ui/CityAutocomplete";
import SegmentedControl from "@/components/ui/SegmentedControl";
import ResultsHeader from "@/components/ui/ResultsHeader";
import TogglePill from "@/components/ui/TogglePill";
import { fadeInUp } from "@/components/motion";
import { MONTH_FULL, WarmthTarget, WeatherMode, WeatherPrefs, WeatherQuery } from "../types";

type Props = {
  initialMode: WeatherMode;
  initialPrefs: WeatherPrefs;
  initialCityId: string;
  onSearch: (query: WeatherQuery) => void;
  /** When set, hides the mode toggle and locks the form to one mode. */
  lockedMode?: WeatherMode;
};

const MODE_OPTIONS: { label: string; value: WeatherMode }[] = [
  { label: "Find where to go", value: "conditions" },
  { label: "Best time to visit", value: "city" },
];

const WARMTH_OPTIONS: { label: string; value: WarmthTarget }[] = [
  { label: "Warm", value: "warm" },
  { label: "Mild", value: "mild" },
  { label: "Cool", value: "cool" },
  { label: "Any", value: "any" },
];

export default function WeatherSearchForm({
  initialMode,
  initialPrefs,
  initialCityId,
  onSearch,
  lockedMode,
}: Props) {
  const [mode, setMode] = useState<WeatherMode>(lockedMode ?? initialMode);
  const [warmth, setWarmth] = useState<WarmthTarget>(initialPrefs.warmth);
  const [dry, setDry] = useState(initialPrefs.dry);
  const [sunny, setSunny] = useState(initialPrefs.sunny);
  const [monthIndex, setMonthIndex] = useState<number | null>(initialPrefs.monthIndex);
  const [cityId, setCityId] = useState(initialCityId);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === "conditions") {
      onSearch({ mode, prefs: { warmth, dry, sunny, monthIndex } });
    } else if (cityId) {
      onSearch({ mode, cityId });
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
      <Card as="form" padding="lg" onSubmit={handleSubmit}>
        {!lockedMode && (
          <div className="mb-6">
            <SegmentedControl options={MODE_OPTIONS} value={mode} onChange={setMode} />
          </div>
        )}

        {mode === "conditions" ? (
          <>
            <ResultsHeader
              title="What weather are you after?"
              blurb="Pick the conditions and we'll rank destinations that deliver."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div>
                <span className="text-caption text-[var(--fg)] block mb-2">Warmth</span>
                <SegmentedControl
                  options={WARMTH_OPTIONS}
                  value={warmth}
                  onChange={setWarmth}
                />
              </div>

              <div>
                <label
                  htmlFor="weather-month"
                  className="text-caption text-[var(--fg)] block mb-2"
                >
                  When
                </label>
                <select
                  id="weather-month"
                  value={monthIndex ?? "any"}
                  onChange={(e) =>
                    setMonthIndex(e.target.value === "any" ? null : Number(e.target.value))
                  }
                  className="w-full text-sm"
                >
                  <option value="any">Any month (best per city)</option>
                  {MONTH_FULL.map((name, index) => (
                    <option key={name} value={index}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-8">
              <span className="text-caption text-[var(--fg)] block mb-2">
                Must-haves (optional)
              </span>
              <div className="flex flex-wrap gap-2">
                <TogglePill
                  size="md"
                  selected={dry}
                  onClick={() => setDry((v) => !v)}
                  icon={<CloudSun className="w-4 h-4" />}
                >
                  Mostly dry
                </TogglePill>
                <TogglePill
                  size="md"
                  selected={sunny}
                  onClick={() => setSunny((v) => !v)}
                  icon={<Sun className="w-4 h-4" />}
                >
                  Plenty of sun
                </TogglePill>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full">
              Find destinations
            </Button>
          </>
        ) : (
          <>
            <ResultsHeader
              title="When should you go?"
              blurb="Pick a city — we'll show the best months and its year-round climate."
            />

            <div className="mb-8 max-w-sm">
              <label
                htmlFor="weather-city"
                className="text-caption text-[var(--fg)] block mb-2"
              >
                City
              </label>
              <CityAutocomplete
                id="weather-city"
                value={cityId}
                onChange={setCityId}
                placeholder="Where to?"
              />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={!cityId}>
              Show best time to visit
            </Button>
          </>
        )}
      </Card>
    </motion.div>
  );
}
