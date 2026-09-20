"use client";

import CityAutocomplete from "@/components/ui/CityAutocomplete";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Stepper from "@/components/ui/Stepper";
import { MONTH_NAMES } from "@/domain/climate";
import { useTripIntentStore } from "../../store/tripIntentStore";
import { MODE_OPTIONS } from "../../lib/options";
import CityCatalogPicker from "../CityCatalogPicker";
import FieldGroup from "./FieldGroup";

/** Step 1 — origin, duration, and who picks the cities. */
export default function StepRoute() {
  const { intent, patchIntent } = useTripIntentStore();
  const selectedCityIds = intent.selectedCityIds ?? [];

  const toggleCity = (cityId: string) => {
    const next = selectedCityIds.includes(cityId)
      ? selectedCityIds.filter((id) => id !== cityId)
      : [...selectedCityIds, cityId];
    patchIntent({ selectedCityIds: next });
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
        <div>
          <label
            htmlFor="origin-city"
            className="text-caption text-[var(--fg)] block mb-2"
          >
            Travelling from
          </label>
          <CityAutocomplete
            id="origin-city"
            value={intent.originCityId}
            onChange={(cityId) => patchIntent({ originCityId: cityId })}
            placeholder="Your home city"
          />
        </div>

        <FieldGroup label="Duration">
          <Stepper
            value={intent.duration ?? 7}
            onChange={(duration) => patchIntent({ duration })}
            min={1}
            max={30}
            format={(v) => `${v} ${v === 1 ? "day" : "days"}`}
          />
        </FieldGroup>

        <FieldGroup label="When">
          <select
            aria-label="Travel month"
            value={intent.travelMonth ?? "any"}
            onChange={(e) =>
              patchIntent({
                travelMonth:
                  e.target.value === "any" ? undefined : Number(e.target.value),
              })
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
        </FieldGroup>
      </div>

      <FieldGroup label="Cities">
        <SegmentedControl
          options={MODE_OPTIONS}
          value={intent.mode}
          onChange={(mode) => patchIntent({ mode })}
          className="max-w-sm"
        />
      </FieldGroup>

      {intent.mode === "custom" && (
        <FieldGroup
          label={
            selectedCityIds.length > 0
              ? `Your cities · ${selectedCityIds.length} selected`
              : "Your cities"
          }
          action={
            selectedCityIds.length > 0 ? (
              <button
                type="button"
                onClick={() => patchIntent({ selectedCityIds: [] })}
                className="text-xs text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
              >
                Clear
              </button>
            ) : undefined
          }
        >
          <CityCatalogPicker
            selectedCityIds={selectedCityIds}
            onToggleCity={toggleCity}
          />
        </FieldGroup>
      )}
    </>
  );
}
