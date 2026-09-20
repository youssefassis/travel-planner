import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ThemeProvider from "@/components/theme/ThemeProvider";

import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const serif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://wanderly.app"),
  title: {
    default: "Wanderly — Trip Planner",
    template: "%s · Wanderly",
  },
  description:
    "Plan routes, compare stays, and organize travel — a full itinerary, route, and budget in seconds.",
  keywords: ["travel", "planner", "trip", "itinerary", "flights", "stays"],
  openGraph: {
    title: "Wanderly — Trip Planner",
    description:
      "Plan routes, compare stays, and organize travel — a full itinerary, route, and budget in seconds.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta
          name="theme-color"
          content="#fbf8f5"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#0f0c08"
          media="(prefers-color-scheme: dark)"
        />
      </head>
      <body
        className={`
          min-h-screen
          bg-[var(--bg)]
          text-[var(--fg)]
          font-sans
          antialiased
          flex flex-col
          transition-colors duration-base
        `}
      >
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
