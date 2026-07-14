import { ReactNode } from "react";

/** A labeled block inside a wizard step, with an optional action (e.g. Clear). */
export default function FieldGroup({
  label,
  action,
  children,
}: {
  label: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-caption text-[var(--fg)]">{label}</span>
        {action}
      </div>
      {children}
    </div>
  );
}
