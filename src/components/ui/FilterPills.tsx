"use client";

import { pillClasses } from "./TogglePill";

type Option<T extends string> = {
  label: string;
  value: T;
};

/** A row of pill toggles for filtering result lists — one active at a time. */
export default function FilterPills<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={pillClasses(selected)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
