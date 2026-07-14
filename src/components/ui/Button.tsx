import { MouseEventHandler, ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "accent" | "white";
type Size = "sm" | "md" | "lg";

interface SharedProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  children: ReactNode;
}

interface ButtonAsButtonProps extends SharedProps {
  asLink?: false;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

interface ButtonAsLinkProps extends SharedProps {
  asLink: true;
  href: string;
  target?: string;
  rel?: string;
}

type Props = ButtonAsButtonProps | ButtonAsLinkProps;

const baseStyles =
  "inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-base cursor-pointer active:scale-[0.98]";

// Applied instead of the variant style when disabled, so a disabled button
// reads as a clean neutral control rather than a washed-out, half-opacity
// version of its color (e.g. a pale, muddy orange).
const disabledStyles =
  "bg-[var(--border)] text-[var(--muted)] shadow-none cursor-not-allowed";

const sizeStyles = {
  sm: "px-3.5 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm font-medium",
  lg: "px-7 py-3.5 text-base font-semibold",
};

const variantStyles = {
  primary:
    "bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] shadow-brand hover:shadow-lg active:shadow-md",
  secondary:
    "bg-[var(--card)] border border-[var(--border)] text-[var(--fg)] hover:border-[var(--primary)] hover:bg-[var(--card-subtle)]",
  outline:
    "border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white hover:shadow-brand",
  ghost: "text-[var(--fg)] hover:bg-black/5 dark:hover:bg-white/10",
  accent:
    "text-[var(--primary)] hover:text-[var(--primary-dark)] underline-offset-2 hover:underline",
  // Deliberately hardcoded dark text: this variant sits on colored/gradient
  // surfaces, and var(--fg) flips to near-white in dark mode.
  white: "bg-white text-[#1c140d] hover:bg-white/90 shadow-md hover:shadow-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  children,
  icon,
  iconPosition = "right",
  className = "",
  asLink = false,
  ...props
}: Props) {
  const isDisabled = !asLink && (props as ButtonAsButtonProps).disabled;
  const classes = `${baseStyles} ${sizeStyles[size]} ${
    isDisabled ? disabledStyles : variantStyles[variant]
  } ${className}`;

  const content = (
    <>
      {icon && iconPosition === "left" && <span>{icon}</span>}
      {children}
      {icon && iconPosition === "right" && (
        <span className="transition-transform group-hover:translate-x-1">{icon}</span>
      )}
    </>
  );

  if (asLink) {
    const { href, target, rel } = props as ButtonAsLinkProps;
    return (
      <Link href={href} target={target} rel={rel} className={`${classes} group`}>
        {content}
      </Link>
    );
  }

  const { onClick, disabled, type } = props as ButtonAsButtonProps;
  return (
    <button
      className={`${classes} group`}
      onClick={onClick}
      disabled={disabled}
      type={type ?? "button"}
    >
      {content}
    </button>
  );
}
