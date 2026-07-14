import { ReactNode } from "react";

interface Props {
  badge?: string;
  badgeIcon?: ReactNode;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeader({
  badge,
  badgeIcon,
  title,
  description,
  align = "center",
  className = "",
}: Props) {
  const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <div className={`flex flex-col gap-4 mb-16 md:mb-20 ${alignClass} ${className}`}>
      {badge && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-bold tracking-wide uppercase">
          {badgeIcon && <span className="w-4 h-4 flex items-center">{badgeIcon}</span>}
          <span>{badge}</span>
        </div>
      )}

      <h2 className="text-4xl md:text-5xl font-serif font-bold text-[var(--fg)] tracking-tight leading-tight">
        {title}
      </h2>

      {description && (
        <p className="text-base md:text-lg text-[var(--muted)] font-light max-w-xl">
          {description}
        </p>
      )}
    </div>
  );
}
