import Link from "next/link";
import Container from "@/components/ui/Container";

const BRAND_NAME = "Wanderly";
const YEAR = new Date().getFullYear();

const NAVIGATION = [
  { label: "Plan a trip", href: "/planner" },
  { label: "Explore", href: "/explore" },
];

export default function Footer() {
  return (
    <footer className="relative pt-16 pb-12 overflow-hidden border-t border-[var(--border)] bg-[var(--bg)] print:hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 pointer-events-none select-none">
        <span
          className="text-[14vw] font-serif whitespace-nowrap"
          style={{ color: "var(--border)" }}
        >
          {BRAND_NAME}
        </span>
      </div>

      <Container size="wide" className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 mb-14">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="inline-block text-2xl font-semibold tracking-tight transition-colors hover:opacity-80"
              style={{ color: "var(--primary)" }}
            >
              {BRAND_NAME}
            </Link>
            <p className="text-[0.9rem] leading-relaxed max-w-sm text-[var(--muted)]">
              Plan the route, the days, and the budget — in one place.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {NAVIGATION.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[0.9rem] text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-base"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[var(--muted)]">
            © {YEAR} {BRAND_NAME}
          </p>
          <p className="text-xs text-[var(--muted)]">
            Built as a demo — plans are generated in your browser, no account
            needed.
          </p>
        </div>
      </Container>
    </footer>
  );
}
