import { ReactNode } from "react";

type Size = "default" | "wide" | "narrow";

const sizeStyles: Record<Size, string> = {
  default: "max-w-[1200px]",
  wide: "max-w-[1400px]",
  narrow: "max-w-[800px]",
};

type Props = {
  children: ReactNode;
  size?: Size;
  className?: string;
};

export default function Container({ children, size = "default", className = "" }: Props) {
  return (
    <div className={`${sizeStyles[size]} mx-auto px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}
