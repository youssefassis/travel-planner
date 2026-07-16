import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page is a Client Component, so the route's metadata lives here.
export const metadata: Metadata = {
  title: "Discover",
  description: "Can't decide? Spin the globe and let a destination find you.",
};

export default function DiscoverLayout({ children }: { children: ReactNode }) {
  return children;
}
