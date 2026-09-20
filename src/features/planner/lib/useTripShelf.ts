"use client";

import { useSyncExternalStore } from "react";
import { Draft, StoredTrip, loadDraft, loadTrips } from "./tripStorage";

/**
 * The trips this browser is holding, as a subscribable snapshot.
 *
 * localStorage isn't reactive, so components can't just read it in an effect
 * (and setting state from one cascades renders). This wraps it in the store
 * contract React actually wants: a cached snapshot, invalidated when another
 * tab writes (the `storage` event) or when this tab says it changed
 * (`refreshTripShelf`, called after every save/delete).
 *
 * `ready` is false only on the server render — storage doesn't exist there —
 * so pages can hold their empty states until the browser has answered.
 */
export type TripShelf = {
  trips: StoredTrip[];
  draft: Draft | null;
  ready: boolean;
};

const SERVER_SHELF: TripShelf = { trips: [], draft: null, ready: false };

let cached: TripShelf | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): TripShelf {
  if (cached === null) {
    cached = { trips: loadTrips(), draft: loadDraft(), ready: true };
  }
  return cached;
}

function getServerSnapshot(): TripShelf {
  return SERVER_SHELF;
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  const onStorage = () => refreshTripShelf();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Call after writing trips or the draft, so every subscriber re-reads. */
export function refreshTripShelf(): void {
  cached = null;
  listeners.forEach((notify) => notify());
}

export function useTripShelf(): TripShelf {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
