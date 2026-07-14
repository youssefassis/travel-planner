"use client";

type Option<T extends string> = {
  label: string;
  value: T;
};

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** "sm" for narrow containers (e.g. the planner sidebar). */
  size?: "sm" | "md";
  className?: string;
};

const sizeStyles = {
  sm: "py-1.5 px-2 text-xs",
  md: "py-1.5 px-2.5 text-sm",
};

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  className = "",
}: Props<T>) {
  return (
    <div
      role="radiogroup"
      className={`flex p-1 rounded-full bg-[var(--card-subtle)] border border-[var(--border)] ${className}`}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`flex-1 rounded-full font-medium whitespace-nowrap transition-all ${sizeStyles[size]} ${
              selected
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--fg)]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
