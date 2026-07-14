type Props = {
  title: string;
  description?: string;
};

export default function PageHeader({ title, description }: Props) {
  return (
    <div className="mb-10 md:mb-12">
      <h1 className="text-h1 text-[var(--fg)] mb-3">{title}</h1>
      {description && (
        <p className="text-body-lg text-[var(--muted)]">{description}</p>
      )}
    </div>
  );
}
