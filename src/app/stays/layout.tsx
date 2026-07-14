import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page is a Client Component, so the route's metadata lives here.
export const metadata: Metadata = {
  title: "Stays",
  description:
    "Neighborhood and accommodation recommendations that fit how you travel.",
};

export default function StaysLayout({ children }: { children: ReactNode }) {
  return children;
}
