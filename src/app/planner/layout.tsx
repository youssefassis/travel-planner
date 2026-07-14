import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page is a Client Component, so the route's metadata lives here.
export const metadata: Metadata = {
  title: "Plan a trip",
  description:
    "Answer three quick questions and get a full round trip: route, day-by-day itinerary, transport, and budget.",
};

export default function PlannerLayout({ children }: { children: ReactNode }) {
  return children;
}
