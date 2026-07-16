"use client";

import { ReactNode } from "react";

type Size = "sm" | "md";

const sizeStyles: Record<Size, string> = {
  sm: "py-1.5 px-3 text-xs",
  md: "py-2 px-4 text-sm",
};

/** The single source of truth for pill visuals (TogglePill + FilterPills). */
export function pillClasses(selected: boolean, size: Size = "sm"): string {
  return [
    sizeStyles[size],
    "inline-flex items-center gap-1.5 rounded-full font-medium transition-all",
    selected
      ? "bg-[var(--primary)] text-white shadow-sm"
      : "bg-[var(--card-subtle)] text-[var(--fg)] hover:bg-[var(--border)]",
  ].join(" ");
}

type Props = {
  selected: boolean;
  onClick: () => void;
  icon?: ReactNode;
  size?: Size;
  children: ReactNode;
};

/** A multi-select toggle pill. For single-select radiogroups use FilterPills. */
export default function TogglePill({
  selected,
  onClick,
  icon,
  size = "sm",
  children,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={pillClasses(selected, size)}
    >
      {icon}
      {children}
    </button>
  );
}
