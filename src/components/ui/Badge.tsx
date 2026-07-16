import { ReactNode } from "react";

type Tone = "brand" | "warning" | "success" | "neutral";

const toneStyles: Record<Tone, string> = {
  brand: "bg-[var(--primary)]/10 text-[var(--primary)]",
  warning: "bg-[var(--warning-bg)] text-[var(--warning)]",
  success: "bg-[var(--success-bg)] text-[var(--success)]",
  neutral: "bg-[var(--card-subtle)] text-[var(--muted)]",
};

type Props = {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** A small status/label pill. Enforces the 12px type floor via .text-caption. */
export default function Badge({
  tone = "brand",
  icon,
  children,
  className = "",
}: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption ${toneStyles[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
