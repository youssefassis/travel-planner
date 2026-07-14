"use client";

/** Circle with the airline's initials — a lightweight logo stand-in. */
export default function AirlineAvatar({ airline }: { airline: string }) {
  const initials = airline
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      aria-hidden
      className="shrink-0 w-9 h-9 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xs font-semibold"
    >
      {initials}
    </span>
  );
}
