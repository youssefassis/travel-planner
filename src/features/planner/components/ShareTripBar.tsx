"use client";

import { useState } from "react";
import { Check, Link2, Map, Printer, Share2 } from "lucide-react";
import { Pace } from "@/domain/types";
import { TripIntent, TripPlan } from "../types";
import { buildShareUrl, googleMapsRouteUrl, planToText } from "../lib/share";

type Props = {
  plan: TripPlan;
  intent: TripIntent;
  pace: Pace;
};

const buttonClasses =
  "inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-[var(--card-subtle)] text-[var(--fg)] hover:bg-[var(--border)] transition-all";

/** Share & export: link, text summary, Google Maps route, print/PDF. */
export default function ShareTripBar({ plan, intent, pace }: Props) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const flash = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 2500);
  };

  const copyLink = async () => {
    const url = buildShareUrl(intent, window.location.origin);
    try {
      await navigator.clipboard.writeText(url);
      flash("Link copied — anyone who opens it sees this exact plan");
    } catch {
      flash("Couldn't access the clipboard");
    }
  };

  const share = async () => {
    const url = buildShareUrl(intent, window.location.origin);
    const text = planToText(plan, pace, intent.startDate);
    if (navigator.share) {
      try {
        await navigator.share({ title: "Trip plan", text, url });
        return;
      } catch {
        // User dismissed the share sheet — nothing to do.
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n\n${url}`);
      flash("Plan summary copied — paste it anywhere");
    } catch {
      flash("Couldn't access the clipboard");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <span className="w-full text-caption text-[var(--muted)]">Share &amp; export</span>

      <button type="button" onClick={copyLink} className={buttonClasses}>
        <Link2 className="w-3.5 h-3.5" /> Copy link
      </button>

      <button type="button" onClick={share} className={buttonClasses}>
        <Share2 className="w-3.5 h-3.5" /> Share plan
      </button>

      <a
        href={googleMapsRouteUrl(plan.stops)}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses}
      >
        <Map className="w-3.5 h-3.5" /> Route in Google Maps
      </a>

      <button type="button" onClick={() => window.print()} className={buttonClasses}>
        <Printer className="w-3.5 h-3.5" /> Print / PDF
      </button>

      {feedback && (
        <span className="inline-flex items-center gap-1.5 text-xs text-[var(--primary)]">
          <Check className="w-3.5 h-3.5" /> {feedback}
        </span>
      )}
    </div>
  );
}
