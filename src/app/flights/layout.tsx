import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page is a Client Component, so the route's metadata lives here.
export const metadata: Metadata = {
  title: "Flights",
  description: "Compare flight picks between European cities.",
};

export default function FlightsLayout({ children }: { children: ReactNode }) {
  return children;
}
