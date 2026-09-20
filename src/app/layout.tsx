import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Newsreader, Source_Sans_3 } from "next/font/google";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ThemeProvider from "@/components/theme/ThemeProvider";
import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";
import OfflineNotice from "@/components/pwa/OfflineNotice";
import { SITE_URL } from "@/domain/site";

import "./globals.css";

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const serif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Timetable digits — every time, fare, and distance the app shows.
const data = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-data",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Wanderly — Trip Planner",
    template: "%s · Wanderly",
  },
  description:
    "Plan routes, compare stays, and organize travel — a full itinerary, route, and budget in seconds.",
  keywords: ["travel", "planner", "trip", "itinerary", "flights", "stays"],
  manifest: "/manifest.webmanifest",
  applicationName: "Wanderly",
  appleWebApp: {
    capable: true,
    title: "Wanderly",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
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
      className={`${sans.variable} ${serif.variable} ${data.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta
          name="theme-color"
          content="#f3f1e8"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#10161d"
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
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-[var(--card)] focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg"
          >
            Skip to content
          </a>
          <Header />
          <main id="main" className="flex-1">{children}</main>
          <Footer />
          <OfflineNotice />
          <ServiceWorkerRegistration />
        </ThemeProvider>
      </body>
    </html>
  );
}
