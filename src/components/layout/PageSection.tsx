type Props = {
  children: React.ReactNode;
  className?: string;
  spacing?: "sm" | "md" | "lg";
};

export default function PageSection({
  children,
  className = "",
  spacing = "lg",
}: Props) {
  const map = {
    sm: "py-10",
    md: "py-16",
    lg: "py-24",
  };

  return <section className={`${map[spacing]} ${className}`}>{children}</section>;
}
