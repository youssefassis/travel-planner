"use client";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

/** The route-level crash screen: plain words, one way to recover. */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="pt-28 md:pt-32 pb-16 sm:pb-20">
        <Container size="wide">
          <div className="max-w-xl">
            <p className="text-caption text-[var(--muted)] mb-3">
              Something broke
            </p>
            <h1 className="text-h1 text-[var(--fg)] mb-4">
              That didn&apos;t go to plan
            </h1>
            <p className="text-body-lg text-[var(--muted)] mb-2">
              The page hit an error it couldn&apos;t recover from. Your saved
              trips are safe — they live in this browser, not on this page.
            </p>
            {error.digest && (
              <p className="text-xs text-data text-[var(--muted)] mb-6">
                Reference: {error.digest}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mt-6">
              <Button onClick={reset}>Try again</Button>
              <Button asLink href="/" variant="secondary">
                Back home
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
