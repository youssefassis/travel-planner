import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page is a Client Component, so the route's metadata lives here.
export const metadata: Metadata = {
  title: "Weather",
  description:
    "Find destinations by the weather you want, or the best months to visit a city.",
};

export default function WeatherLayout({ children }: { children: ReactNode }) {
  return children;
}
