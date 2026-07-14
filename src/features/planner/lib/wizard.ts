import { getCity } from "@/domain/cities";
import { TripIntent } from "../types";

/**
 * The planner wizard's step machine — pure functions so the gating logic is
 * testable without a DOM. The React layer only renders what these decide.
 */

export type WizardStepId = "route" | "party" | "style";

export type WizardStep = {
  id: WizardStepId;
  title: string;
  blurb: string;
};

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: "route",
    title: "Where & how long",
    blurb: "Where you start, how long you're away — and who picks the cities.",
  },
  {
    id: "party",
    title: "Who & budget",
    blurb: "Who's coming along and how you like to spend.",
  },
  {
    id: "style",
    title: "Your style",
    blurb: "What you're into — we'll pick the stops to match.",
  },
];

/** Problems blocking this step, in user-facing words. Empty = valid. */
export function validateStep(stepId: WizardStepId, intent: TripIntent): string[] {
  if (stepId !== "route") return []; // party/style fields are enum-cycled — always valid
  const errors: string[] = [];
  if (!getCity(intent.originCityId)) {
    errors.push("Pick the city you're starting from.");
  }
  if (
    !Number.isInteger(intent.duration) ||
    intent.duration < 1 ||
    intent.duration > 30
  ) {
    errors.push("Trips can be 1 to 30 days.");
  }
  if (intent.mode === "custom") {
    if (intent.selectedCityIds.length === 0) {
      errors.push("Pick at least one city to visit.");
    } else if (intent.selectedCityIds.some((id) => !getCity(id))) {
      errors.push("One of the selected cities isn't available.");
    }
  }
  return errors;
}

/** A step is enterable when every step before it is valid. */
export function canEnterStep(index: number, intent: TripIntent): boolean {
  if (index < 0 || index >= WIZARD_STEPS.length) return false;
  return WIZARD_STEPS.slice(0, index).every(
    (step) => validateStep(step.id, intent).length === 0,
  );
}

/** Index of the first invalid step; WIZARD_STEPS.length when all are valid. */
export function firstInvalidStep(intent: TripIntent): number {
  const index = WIZARD_STEPS.findIndex(
    (step) => validateStep(step.id, intent).length > 0,
  );
  return index === -1 ? WIZARD_STEPS.length : index;
}
