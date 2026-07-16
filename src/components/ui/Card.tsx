import { ReactNode } from "react";

type Padding = "sm" | "md" | "lg" | "none";

const paddingStyles: Record<Padding, string> = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6 sm:p-8",
  none: "p-0",
};

type CardClassOpts = {
  padding?: Padding;
  hover?: boolean;
  selected?: boolean;
  className?: string;
};

/**
 * The single source of truth for card surfaces. Both Card (server) and
 * MotionCard (client) build from this so their look can't drift.
 * The ONLY hover is the CSS lift below — never framer whileHover on cards.
 */
export function cardClasses({
  padding = "md",
  hover = false,
  selected = false,
  className = "",
}: CardClassOpts): string {
  return [
    "bg-[var(--card)]",
    "border",
    selected
      ? "border-transparent ring-2 ring-[var(--primary)]"
      : "border-[var(--border)]",
    "rounded-xl",
    "shadow-sm",
    "transition duration-300",
    paddingStyles[padding],
    hover ? "hover:-translate-y-0.5 hover:shadow-md" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type Props = CardClassOpts & {
  children: ReactNode;
  as?: "div" | "form" | "article";
} & React.FormHTMLAttributes<HTMLElement>;

export default function Card({
  children,
  as: Tag = "div",
  padding = "md",
  hover = false,
  selected = false,
  className = "",
  ...rest
}: Props) {
  return (
    <Tag className={cardClasses({ padding, hover, selected, className })} {...rest}>
      {children}
    </Tag>
  );
}
