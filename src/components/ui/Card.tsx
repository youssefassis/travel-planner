import { ReactNode } from "react";

type Padding = "md" | "lg" | "none";

const paddingStyles: Record<Padding, string> = {
  md: "p-5",
  lg: "p-6 sm:p-8",
  none: "p-0",
};

type Props = {
  children: ReactNode;
  as?: "div" | "form" | "article";
  padding?: Padding;
  hover?: boolean;
  className?: string;
} & React.FormHTMLAttributes<HTMLElement>;

export default function Card({
  children,
  as: Tag = "div",
  padding = "md",
  hover = false,
  className = "",
  ...rest
}: Props) {
  return (
    <Tag
      className={`
        bg-[var(--card)]
        border border-[var(--border)]
        rounded-xl
        shadow-sm
        transition duration-300
        ${paddingStyles[padding]}
        ${hover ? "hover:-translate-y-0.5 hover:shadow-md" : ""}
        ${className}
      `}
      {...rest}
    >
      {children}
    </Tag>
  );
}
