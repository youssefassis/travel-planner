import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
};

export default function Card({ children, className = "", hover = true }: Props) {
  return (
    <div
      className={`
        bg-[var(--card)]
        border border-[var(--border)]
        rounded-3xl
        p-6
        ios-shadow
        transition duration-300
        ${hover ? "hover:-translate-y-1 hover:shadow-md" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
