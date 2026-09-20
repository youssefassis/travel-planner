import Link from "next/link";
import { Compass } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

/** Off the chart: the page equivalent of a wrong turn, with the way back. */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="pt-28 md:pt-32 pb-16 sm:pb-20">
        <Container size="wide">
          <div className="max-w-xl">
            <p className="text-caption text-[var(--muted)] mb-3">
              404 · Uncharted
            </p>
            <h1 className="text-h1 text-[var(--fg)] mb-4">
              This page isn&apos;t on the map
            </h1>
            <p className="text-body-lg text-[var(--muted)] mb-8">
              The address may have moved, or it never existed. Everything worth
              visiting is still where it should be.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asLink href="/planner">
                Plan a trip
              </Button>
              <Button asLink href="/explore" variant="secondary">
                Find somewhere to go
              </Button>
              <Button asLink href="/" variant="ghost" icon={<Compass className="w-4 h-4" />} iconPosition="left">
                Back home
              </Button>
            </div>
            <p className="mt-10 text-sm text-[var(--muted)]">
              Looking for a saved plan? It&apos;s under{" "}
              <Link href="/trips" className="text-[var(--primary)] hover:underline underline-offset-2">
                My trips
              </Link>
              .
            </p>
          </div>
        </Container>
      </div>
    </div>
  );
}
