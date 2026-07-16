type Props = {
  title: string;
  description?: string;
  align?: "left" | "center";
};

export default function PageHeader({ title, description, align = "left" }: Props) {
  const centered = align === "center";
  return (
    <div className={`mb-10 md:mb-12 ${centered ? "text-center max-w-3xl mx-auto" : ""}`}>
      <h1 className="text-h1 text-[var(--fg)] mb-3">{title}</h1>
      {description && (
        <p className="text-body-lg text-[var(--muted)]">{description}</p>
      )}
    </div>
  );
}
