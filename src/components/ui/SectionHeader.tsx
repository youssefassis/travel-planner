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
    <div className={`flex flex-col gap-4 mb-12 md:mb-16 ${alignClass} ${className}`}>
      {badge && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-caption">
          {badgeIcon && <span className="w-4 h-4 flex items-center">{badgeIcon}</span>}
          <span>{badge}</span>
        </div>
      )}

      <h2 className="text-h1 text-[var(--fg)]">{title}</h2>

      {description && (
        <p className="text-body-lg text-[var(--muted)] max-w-xl">{description}</p>
      )}
    </div>
  );
}
