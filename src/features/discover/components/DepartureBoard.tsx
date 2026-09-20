"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { City } from "@/domain/types";
import { bookingReference } from "@/domain/booking";

type Props = {
  /** Increment to flutter the board toward `winner`. 0 = nothing picked yet. */
  spinToken: number;
  /** The city the board settles on. */
  winner: City | null;
  /** Fired once every flap has locked. */
  onSettled: (city: City) => void;
};

/** The longest city name in the dataset — a fixed width keeps the board still. */
const NAME_CELLS = 10;
const FLAP_MS = 45;
/** Everything flutters this long before the first column commits. */
const FLUTTER_MS = 700;
const LOCK_STAGGER = 110;
const TOTAL_MS = FLUTTER_MS + (NAME_CELLS + 3) * LOCK_STAGGER + 250;

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";

const pad = (value: number) => value.toString().padStart(2, "0");

/**
 * Departure time and gate, derived from the city so a given destination
 * always boards the same way. Reuses the booking reference hash.
 */
function departure(city: City): { hh: string; mm: string; gate: string } {
  const seed = parseInt(bookingReference(city.id).slice(4), 36);
  return {
    hh: pad(6 + (seed % 16)),
    mm: pad((seed % 12) * 5),
    gate: `${"ABCD"[seed % 4]}${pad((seed % 30) + 1)}`,
  };
}

/** One flap cell. Re-keying on the glyph is what makes it flip. */
function Flap({ char, flipping }: { char: string; flipping: boolean }) {
  return (
    <span
      className="relative inline-flex h-10 w-[22px] sm:h-12 sm:w-7 items-center justify-center overflow-hidden rounded-[4px] bg-[var(--fg)] text-[var(--bg)] text-data text-base sm:text-xl font-semibold shadow-sm"
      aria-hidden
    >
      <motion.span
        key={`${char}-${flipping}`}
        initial={flipping ? { rotateX: -80, opacity: 0.4 } : false}
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ duration: 0.12, ease: "easeOut" }}
      >
        {char === " " ? " " : char}
      </motion.span>
      {/* The hinge every split-flap board has. */}
      <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-[var(--bg)] opacity-30" />
    </span>
  );
}

function FlapRow({
  target,
  alphabet,
  elapsed,
  offset,
}: {
  target: string;
  alphabet: string;
  /** ms since the flutter started, or null while the board is idle. */
  elapsed: number | null;
  /** Column index this group starts at, so locks ripple left to right. */
  offset: number;
}) {
  return (
    <span className="inline-flex gap-[2px] sm:gap-1">
      {Array.from(target).map((targetChar, i) => {
        if (elapsed === null) return <Flap key={i} char="" flipping={false} />;
        const locked = elapsed >= FLUTTER_MS + (offset + i) * LOCK_STAGGER;
        if (locked) return <Flap key={i} char={targetChar} flipping={false} />;
        const spin = Math.floor(elapsed / FLAP_MS) + (offset + i) * 7;
        return (
          <Flap key={i} char={alphabet[spin % alphabet.length]} flipping />
        );
      })}
    </span>
  );
}

const Caption = ({ children }: { children: React.ReactNode }) => (
  <span className="text-caption text-[var(--muted)]">{children}</span>
);

/**
 * A split-flap departure board: the destination flutters through glyphs and
 * locks column by column, the way an airport board settles on a city.
 */
export default function DepartureBoard({ spinToken, winner, onSettled }: Props) {
  const prefersReducedMotion = useReducedMotion();
  // Progress is tagged with the spin it belongs to, so a new spin reads as
  // idle until its first tick — no need to reset state from the effect body.
  const [run, setRun] = useState({ token: 0, elapsed: 0 });
  const onSettledRef = useRef(onSettled);
  useEffect(() => {
    onSettledRef.current = onSettled;
  }, [onSettled]);

  useEffect(() => {
    if (spinToken === 0 || !winner) return;

    if (prefersReducedMotion) {
      const timer = setTimeout(() => {
        setRun({ token: spinToken, elapsed: TOTAL_MS });
        onSettledRef.current(winner);
      }, 250);
      return () => clearTimeout(timer);
    }

    const start = performance.now();
    const timer = setInterval(() => {
      const next = Math.min(TOTAL_MS, performance.now() - start);
      setRun({ token: spinToken, elapsed: next });
      if (next < TOTAL_MS) return;
      clearInterval(timer);
      onSettledRef.current(winner);
    }, FLAP_MS);
    return () => clearInterval(timer);
  }, [spinToken, winner, prefersReducedMotion]);

  const elapsed = spinToken > 0 && run.token === spinToken ? run.elapsed : null;

  const name = (winner?.name ?? "").toUpperCase().slice(0, NAME_CELLS);
  const { hh, mm, gate } = winner
    ? departure(winner)
    : { hh: "--", mm: "--", gate: "---" };
  const settled = elapsed !== null && elapsed >= TOTAL_MS;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <Caption>Destination</Caption>
        <span
          className={`text-caption ${
            settled ? "text-[var(--success)]" : "text-[var(--muted)]"
          }`}
          aria-live="polite"
        >
          {elapsed === null ? "Awaiting spin" : settled ? "Boarding" : "Searching…"}
        </span>
      </div>

      <div className="flex justify-center">
        <FlapRow
          target={name.padEnd(NAME_CELLS)}
          alphabet={LETTERS}
          elapsed={elapsed}
          offset={0}
        />
      </div>
      {/* The board is decorative; the destination reaches assistive tech here. */}
      <p className="sr-only" aria-live="polite">
        {settled && winner ? `Destination: ${winner.name}, ${winner.country}` : ""}
      </p>

      <div className="flex justify-center gap-8 mt-5">
        <div className="flex flex-col items-center gap-1.5">
          <Caption>Dep</Caption>
          <span className="inline-flex items-center gap-1">
            <FlapRow target={hh} alphabet={DIGITS} elapsed={elapsed} offset={NAME_CELLS} />
            <span className="text-data text-[var(--muted)]">:</span>
            <FlapRow target={mm} alphabet={DIGITS} elapsed={elapsed} offset={NAME_CELLS} />
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <Caption>Gate</Caption>
          <FlapRow
            target={gate}
            alphabet={LETTERS + DIGITS}
            elapsed={elapsed}
            offset={NAME_CELLS + 1}
          />
        </div>
      </div>
    </div>
  );
}
