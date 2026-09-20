"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Compass } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";

const NAVIGATION = [
  { href: "/planner", label: "Plan a trip" },
  { href: "/explore", label: "Explore" },
];

const BRAND_NAME = "Wanderly";

/** Full-width instrument bar: frosted paper, a hairline that appears on
 *  scroll, and the wordmark set in the display serif. */
export default function Header() {
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the mobile sheet when navigation happens under it — state adjusted
  // during render (not in an effect) so it can't cascade re-renders.
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setIsMenuOpen(false);
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 print:hidden border-b transition-all duration-base ${
        isScrolled || isMenuOpen ? "border-[var(--border)]" : "border-transparent"
      }`}
      style={{
        background:
          isScrolled || isMenuOpen ? "var(--header-bg-scrolled)" : "var(--header-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div
        className={`mx-auto max-w-[1200px] px-4 sm:px-6 flex items-center justify-between transition-all duration-base ${
          isScrolled ? "h-14" : "h-16"
        }`}
      >
        <Link
          href="/"
          className="flex items-center gap-2 font-serif font-semibold tracking-tight text-xl"
        >
          <Compass
            className={`text-[var(--primary)] transition-all duration-base ${
              isScrolled ? "w-4 h-4" : "w-5 h-5"
            }`}
          />
          {BRAND_NAME}
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAVIGATION.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-sm font-medium transition-colors py-1"
                style={{
                  color: isActive ? "var(--fg)" : "var(--muted)",
                }}
              >
                {item.label}
                {isActive && (
                  // The route line: a short red underline that travels
                  // between links like a leg on the map.
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full bg-[var(--primary)]"
                    transition={{ duration: 0.25 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Button
            asLink
            href="/planner"
            variant="primary"
            size="md"
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            Plan a trip
          </Button>
        </div>

        <div className="md:hidden flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative w-8 h-8 flex items-center justify-center"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            <span
              className={`absolute h-[1.5px] w-5 bg-current transition-transform duration-base ${
                isMenuOpen ? "rotate-45" : "-translate-y-1.5"
              }`}
            />
            <span
              className={`absolute h-[1.5px] w-5 bg-current transition-opacity duration-base ${
                isMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute h-[1.5px] w-5 bg-current transition-transform duration-base ${
                isMenuOpen ? "-rotate-45" : "translate-y-1.5"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile sheet — slides out under the bar, full width, hairline-framed. */}
      <div
        className={`md:hidden absolute top-full left-0 w-full transition-all duration-base ${
          isMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="border-b border-[var(--border)] bg-[var(--card)] px-6 py-5 shadow-lg">
          <nav className="flex flex-col gap-4">
            {NAVIGATION.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium transition-colors"
                  style={{
                    color: isActive ? "var(--fg)" : "var(--muted)",
                  }}
                >
                  {isActive && (
                    <span className="w-3 h-[2px] rounded-full bg-[var(--primary)]" />
                  )}
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/planner"
              onClick={() => setIsMenuOpen(false)}
              className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]"
            >
              Plan a trip <ArrowRight className="w-4 h-4" />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
