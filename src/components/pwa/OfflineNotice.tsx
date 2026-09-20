"use client";

import { useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";

/** Connectivity is an external source, so React subscribes to it directly. */
function subscribe(onChange: () => void): () => void {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/**
 * Tells the traveler what still works when the signal goes. The plan, the
 * itinerary, and the budget are all local, so almost everything does — the
 * honest exception is the map, whose tiles come from the network.
 */
export default function OfflineNotice() {
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true, // Assume connected on the server; the client corrects it.
  );

  if (online) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 print:hidden
        flex items-center gap-2 px-4 py-2 rounded-full
        border border-[var(--border)] bg-[var(--card)] shadow-md
        text-small text-[var(--fg)]"
    >
      <WifiOff className="w-4 h-4 text-[var(--warning)]" />
      Offline — your trip still works. The map needs a signal.
    </div>
  );
}
