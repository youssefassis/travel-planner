import Link from "next/link";
import { Compass } from "lucide-react";
import Container from "@/components/ui/Container";

const BRAND_NAME = "Wanderly";
const YEAR = new Date().getFullYear();

const NAV_GROUPS = [
  {
    title: "Plan",
    links: [
      { label: "Plan a trip", href: "/planner" },
      { label: "My trips", href: "/trips" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Spin the globe", href: "/explore?tool=spin" },
      { label: "Match the weather", href: "/explore?tool=weather" },
      { label: "What can I afford?", href: "/explore?tool=budget" },
    ],
  },
];

/** A decorative leg of the route: dot — dotted line — dot. */
function RouteOrnament() {
  return (
    <div
      aria-hidden
      className="flex items-center gap-3 mb-12 text-[var(--border)]"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
      <span className="flex-1 border-t-2 border-dotted border-current" />
      <Compass className="w-4 h-4 text-[var(--muted)]" />
      <span className="flex-1 border-t-2 border-dotted border-current" />
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative pt-14 pb-12 overflow-hidden border-t border-[var(--border)] bg-[var(--bg)] print:hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 pointer-events-none select-none">
        <span
          className="text-[14vw] font-serif whitespace-nowrap"
          style={{ color: "var(--border)" }}
        >
          {BRAND_NAME}
        </span>
      </div>

      <Container size="wide" className="relative z-10">
        <RouteOrnament />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 mb-14">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="inline-block font-serif text-2xl font-semibold tracking-tight transition-colors hover:opacity-80"
              style={{ color: "var(--primary)" }}
            >
              {BRAND_NAME}
            </Link>
            <p className="text-[0.9rem] leading-relaxed max-w-sm text-[var(--muted)]">
              Plan the route, the days, and the budget — in one place.
            </p>
            <p className="text-caption text-[var(--muted)]">
              Charted for 41 cities · 20 countries
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-14 gap-y-6">
            {NAV_GROUPS.map((group) => (
              <div key={group.title} className="flex flex-col gap-3">
                <span className="text-caption text-[var(--muted)]">{group.title}</span>
                {group.links.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-[0.9rem] text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-base"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>

        <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[var(--muted)]">
            © {YEAR} {BRAND_NAME}
          </p>
          <p className="text-xs text-[var(--muted)]">
            Built as a demo — plans are generated in your browser, no account
            needed.{" "}
            {/* CC BY-SA requires the credit to be visible to the reader, not
                just recorded in the repo. */}
            <a
              href="/credits.txt"
              className="underline underline-offset-2 hover:text-[var(--fg)] transition-colors"
            >
              Photo credits
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
