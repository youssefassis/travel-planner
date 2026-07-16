import { ReactNode } from "react";

type Size = "md" | "lg";

const sizeStyles: Record<Size, string> = {
  md: "text-xl",
  lg: "text-2xl",
};

type Props = {
  /** The formatted amount, e.g. "€58" — caller controls currency/formatting. */
  amount: string;
  size?: Size;
  sub?: ReactNode;
  align?: "left" | "right";
};

/** The serif brand-colored money display, shared across result cards. */
export default function Price({ amount, size = "lg", sub, align = "left" }: Props) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <p
        className={`${sizeStyles[size]} font-serif font-bold text-[var(--primary)] leading-none`}
      >
        {amount}
      </p>
      {sub && <p className="text-xs text-[var(--muted)] mt-1">{sub}</p>}
    </div>
  );
}
