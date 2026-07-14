"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiX, SiInstagram, SiTiktok } from "react-icons/si";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

const BRAND_NAME = "Wanderly";
const YEAR = new Date().getFullYear();

const NAVIGATION = [
  { label: "Discover", href: "/" },
  { label: "Flights", href: "/flights" },
  { label: "Stays", href: "/stays" },
  { label: "Trips", href: "/planner" },
];

const COMPANY_LINKS = [
  { label: "About", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Help", href: "#" },
];

const LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];

const SOCIAL_LINKS = [
  { label: "X / Twitter", href: "#", Icon: SiX },
  { label: "Instagram", href: "#", Icon: SiInstagram },
  { label: "TikTok", href: "#", Icon: SiTiktok },
];

export default function Footer() {
  return (
    <footer className="relative pt-24 pb-12 overflow-hidden border-t border-[var(--border)] bg-[var(--bg)] print:hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 pointer-events-none select-none">
        <span
          className="text-[14vw] font-serif whitespace-nowrap"
          style={{ color: "var(--border)" }}
        >
          {BRAND_NAME}
        </span>
      </div>

      <Container size="wide" className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-5 flex flex-col gap-5">
            <Link
              href="/"
              className="inline-block text-2xl font-semibold tracking-tight transition-colors hover:opacity-80"
              style={{ color: "var(--primary)" }}
            >
              {BRAND_NAME}
            </Link>

            <p className="text-[0.9rem] leading-relaxed max-w-sm text-[var(--muted)]">
              Plan travel with structured tools. Search routes, compare stays, and
              organize itineraries in one interface.
            </p>

            <div className="flex items-center gap-3 pt-3">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)] hover:border-[var(--primary)] transition-all duration-base"
                >
                  <Icon size={15} />
                </Link>
              ))}
            </div>
          </div>

          <nav className="md:col-span-2 flex flex-col">
            <h4 className="text-caption text-[var(--fg)] mb-6 pb-2">Navigate</h4>

            <div className="flex flex-col gap-2">
              {NAVIGATION.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-[0.9rem] text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-base"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <nav className="md:col-span-2 flex flex-col">
            <h4 className="text-caption text-[var(--fg)] mb-6 pb-2">Company</h4>

            <div className="flex flex-col gap-2">
              {COMPANY_LINKS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-[0.9rem] text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-base"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="md:col-span-3 rounded-2xl p-8 flex flex-col justify-between gap-8 border border-[var(--border)] bg-[var(--card-subtle)] transition-all duration-base hover:border-[var(--primary)]">
            <p className="text-[0.95rem] leading-relaxed text-[var(--fg)]">
              Organize your next trip with a single workflow.
            </p>

            <Button
              asLink
              href="/planner"
              variant="primary"
              size="sm"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Plan a trip
            </Button>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-[var(--muted)]">
            © {YEAR} {BRAND_NAME}
          </p>

          <div className="flex gap-6 text-xs text-[var(--muted)]">
            {LEGAL_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="hover:text-[var(--fg)] transition-colors duration-base"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
