"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Theme is unknown until hydration; render a placeholder to avoid a
  // server/client icon mismatch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time mount flag, not a cascading update
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className="w-9 h-9" aria-hidden />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--fg)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
