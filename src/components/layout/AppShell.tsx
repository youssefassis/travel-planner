"use client";

import Container from "@/components/ui/Container";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)]">
      <main className="flex-1">
        <Container>{children}</Container>
      </main>
    </div>
  );
}
