import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page is a Client Component, so the route's metadata lives here.
export const metadata: Metadata = {
  title: "Explore",
  description:
    "Not sure where to go? Spin the globe or match the weather, then plan the trip.",
};

export default function ExploreLayout({ children }: { children: ReactNode }) {
  return children;
}
