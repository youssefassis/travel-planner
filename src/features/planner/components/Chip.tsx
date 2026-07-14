"use client";

export default function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`py-1.5 px-3 rounded-full font-medium transition-all text-xs ${
        selected
          ? "bg-[var(--primary)] text-white shadow-sm"
          : "bg-[var(--card-subtle)] text-[var(--fg)] hover:bg-[var(--border)]"
      }`}
    >
      {label}
    </button>
  );
}
