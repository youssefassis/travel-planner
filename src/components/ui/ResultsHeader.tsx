import { ReactNode } from "react";

type Props = {
  title: string;
  blurb?: ReactNode;
  className?: string;
};

/**
 * The h2 + blurb header above an in-page result group. Sits below PageHeader
 * (the page's single h1) and is distinct from SectionHeader (marketing bands).
 */
export default function ResultsHeader({ title, blurb, className = "" }: Props) {
  return (
    <div className={`mb-6 ${className}`}>
      <h2 className="text-h2 text-[var(--fg)] mb-1">{title}</h2>
      {blurb && <p className="text-small text-[var(--muted)]">{blurb}</p>}
    </div>
  );
}
