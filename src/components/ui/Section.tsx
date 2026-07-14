import { ReactNode } from "react";

type Size = "sm" | "md" | "lg";

const sizeStyles: Record<Size, string> = {
  sm: "py-10 md:py-14",
  md: "py-16 md:py-24",
  lg: "py-24 md:py-32",
};

type Props = {
  children: ReactNode;
  size?: Size;
  className?: string;
  id?: string;
};

export default function Section({ children, size = "md", className = "", id }: Props) {
  return (
    <section id={id} className={`${sizeStyles[size]} ${className}`}>
      {children}
    </section>
  );
}
