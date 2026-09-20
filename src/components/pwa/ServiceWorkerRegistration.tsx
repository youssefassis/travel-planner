"use client";

import { useEffect } from "react";

/**
 * Registers the offline service worker, in production only — in development
 * it would sit in front of the dev server's hot-reload traffic and serve
 * stale chunks.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      // Nothing to do on failure: offline support is an enhancement, and the
      // app works exactly as before without it.
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    };

    if (document.readyState === "complete") {
      register();
      return;
    }
    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
