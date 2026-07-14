"use client";

import { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { WizardStep } from "../../lib/wizard";

/** Frame around a wizard step: title, blurb, fields, Back/Next footer. */
export default function StepShell({
  step,
  errors,
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
  children,
}: {
  step: WizardStep;
  errors: string[];
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Card padding="lg">
      <h2 className="text-h2 text-[var(--fg)]">{step.title}</h2>
      <p className="text-body-lg text-[var(--muted)] mt-1">{step.blurb}</p>

      <div className="mt-7 space-y-6">{children}</div>

      <div className="flex items-center justify-between gap-3 mt-8 pt-5 border-t border-[var(--border)]">
        {onBack ? (
          <Button
            variant="ghost"
            icon={<ArrowLeft size={16} />}
            iconPosition="left"
            onClick={onBack}
          >
            Back
          </Button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-4">
          {errors.length > 0 && (
            <p className="text-sm text-[var(--muted)]" role="status">
              {errors[0]}
            </p>
          )}
          <Button
            variant="primary"
            size="lg"
            icon={<ArrowRight size={18} />}
            onClick={onNext}
            disabled={nextDisabled || errors.length > 0}
          >
            {nextLabel}
          </Button>
        </div>
      </div>
    </Card>
  );
}
