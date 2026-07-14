"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { DUR, EASE_OUT } from "@/components/motion";
import Button from "@/components/ui/Button";
import { useTripIntentStore } from "../../store/tripIntentStore";
import { WIZARD_STEPS, canEnterStep, validateStep } from "../../lib/wizard";
import StepShell from "./StepShell";
import StepRoute from "./StepRoute";
import StepParty from "./StepParty";
import StepStyle from "./StepStyle";
import WizardProgress from "./WizardProgress";

const STEP_CONTENT = {
  route: StepRoute,
  party: StepParty,
  style: StepStyle,
} as const;

/** The three-question flow that produces a trip intent, then generates. */
export default function TripWizard({
  stepIndex,
  onStepChange,
  onGenerate,
  loading,
  onCancel,
}: {
  stepIndex: number;
  onStepChange: (index: number) => void;
  onGenerate: () => void;
  loading: boolean;
  /** Present when a plan already exists — lets the user bail out of editing. */
  onCancel?: () => void;
}) {
  const { intent } = useTripIntentStore();

  const step = WIZARD_STEPS[stepIndex];
  const isLast = stepIndex === WIZARD_STEPS.length - 1;
  const errors = validateStep(step.id, intent);
  const StepContent = STEP_CONTENT[step.id];

  const handleNext = () => {
    if (errors.length > 0) return;
    if (isLast) onGenerate();
    else onStepChange(stepIndex + 1);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="relative">
        <WizardProgress
          currentIndex={stepIndex}
          isStepEnterable={(index) => canEnterStep(index, intent)}
          onSelectStep={onStepChange}
        />
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            icon={<X size={14} />}
            onClick={onCancel}
            className="absolute right-0 top-1/2 -translate-y-1/2"
          >
            Back to plan
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: DUR.base, ease: EASE_OUT }}
        >
          <StepShell
            step={step}
            errors={errors}
            onBack={
              stepIndex > 0 ? () => onStepChange(stepIndex - 1) : undefined
            }
            onNext={handleNext}
            nextLabel={
              isLast ? (loading ? "Creating..." : "Create my trip") : "Next"
            }
            nextDisabled={loading}
          >
            <StepContent />
          </StepShell>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
