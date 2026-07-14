type Props = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export default function PageHeader({ title, description, actions }: Props) {
  return (
    <div className="text-center max-w-2xl mx-auto pt-16 pb-10">
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
        {title}
      </h1>

      {description && (
        <p className="mt-5 text-[var(--muted)] text-lg leading-relaxed">
          {description}
        </p>
      )}

      {actions && <div className="mt-8 flex justify-center gap-4">{actions}</div>}
    </div>
  );
}
