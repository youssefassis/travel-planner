"use client";

import { Region } from "@/domain/types";
import { useTripIntentStore } from "../../store/tripIntentStore";
import {
  INTEREST_OPTIONS,
  REGION_LABELS,
  capitalize,
} from "../../lib/options";
import Chip from "../Chip";
import FieldGroup from "./FieldGroup";

/** Step 3 — interests, plus region when we pick the cities. */
export default function StepStyle() {
  const { intent, patchIntent } = useTripIntentStore();
  const interests = intent.interests ?? [];

  const toggleInterest = (interest: (typeof INTEREST_OPTIONS)[number]) => {
    const next = interests.includes(interest)
      ? interests.filter((i) => i !== interest)
      : [...interests, interest];
    patchIntent({ interests: next });
  };

  return (
    <>
      <FieldGroup
        label="Interests"
        action={
          interests.length > 0 ? (
            <button
              type="button"
              onClick={() => patchIntent({ interests: [] })}
              className="text-xs text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
            >
              Clear
            </button>
          ) : undefined
        }
      >
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((interest) => (
            <Chip
              key={interest}
              label={capitalize(interest)}
              selected={interests.includes(interest)}
              onClick={() => toggleInterest(interest)}
            />
          ))}
        </div>
      </FieldGroup>

      {intent.mode === "surprise" && (
        <>
          <FieldGroup label="Region">
            <div className="flex flex-wrap gap-2">
              <Chip
                label="Any"
                selected={(intent.region ?? "any") === "any"}
                onClick={() => patchIntent({ region: "any" })}
              />
              {(Object.keys(REGION_LABELS) as Region[]).map((region) => (
                <Chip
                  key={region}
                  label={REGION_LABELS[region]}
                  selected={intent.region === region}
                  onClick={() => patchIntent({ region })}
                />
              ))}
            </div>
          </FieldGroup>
        </>
      )}
    </>
  );
}
