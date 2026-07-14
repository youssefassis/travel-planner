"use client";

import SegmentedControl from "@/components/ui/SegmentedControl";
import { useTripIntentStore } from "../../store/tripIntentStore";
import {
  BUDGET_OPTIONS,
  COMPANION_OPTIONS,
  PACE_OPTIONS,
} from "../../lib/options";
import FieldGroup from "./FieldGroup";

/** Step 2 — who's traveling, spending level, and pace. */
export default function StepParty() {
  const { intent, patchIntent } = useTripIntentStore();

  return (
    <>
      <FieldGroup label="Who's going">
        <SegmentedControl
          options={COMPANION_OPTIONS}
          value={intent.companions || "solo"}
          onChange={(companions) => patchIntent({ companions })}
          className="max-w-md"
        />
      </FieldGroup>

      <FieldGroup label="Budget">
        <SegmentedControl
          options={BUDGET_OPTIONS}
          value={intent.vibe?.budget || "comfort"}
          onChange={(budget) =>
            patchIntent({ vibe: { ...intent.vibe, budget } })
          }
          className="max-w-md"
        />
      </FieldGroup>

      <FieldGroup label="Travel pace">
        <SegmentedControl
          options={PACE_OPTIONS}
          value={intent.vibe?.pace || "balanced"}
          onChange={(pace) => patchIntent({ vibe: { ...intent.vibe, pace } })}
          className="max-w-md"
        />
      </FieldGroup>
    </>
  );
}
