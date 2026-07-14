"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Compass } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";

const NAVIGATION = [
  { href: "/", label: "Discover" },
  { href: "/flights", label: "Flights" },
  { href: "/stays", label: "Stays" },
];

const BRAND_NAME = "Wanderly";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`
        fixed left-1/2 -translate-x-1/2 top-4 z-50
        w-[92%] max-w-[1100px] rounded-full border
        transition-all duration-base
        ${isScrolled ? "border-[var(--border)]" : "border-transparent"}
      `}
      style={{
        background: isScrolled
          ? "rgba(251, 248, 245, 0.92)"
          : "rgba(251, 248, 245, 0.65)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div
        className={`
          px-6 flex items-center justify-between
          transition-all duration-base
          ${isScrolled ? "h-14" : "h-16"}
        `}
      >
        <Link
          href="/"
          className={`flex items-center gap-2 font-semibold tracking-tight transition-all duration-base ${
            isScrolled ? "text-lg" : "text-xl"
          }`}
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
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--primary)]"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button
            onClick={() => router.push("/planner")}
            variant="primary"
            size="md"
            icon="→"
            iconPosition="right"
          >
            Plan a trip
          </Button>
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden w-8 h-8 flex items-center justify-center"
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

      <div
        className={`
          md:hidden absolute top-full left-0 w-full
          transition-all duration-base
          ${
            isMenuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }
        `}
      >
        <div className="m-4 p-6 rounded-2xl border bg-[var(--card)] border-[var(--border)]">
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
                    <span className="w-1 h-1 rounded-full bg-[var(--primary)]" />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 pt-4 border-t border-[var(--border)] flex justify-end">
            <Button
              onClick={() => {
                setIsMenuOpen(false);
                router.push("/planner");
              }}
              variant="primary"
              size="md"
              icon="→"
              iconPosition="right"
            >
              Plan a trip
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
