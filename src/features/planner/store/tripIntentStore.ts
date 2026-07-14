import { create } from "zustand";
import { TripIntent } from "../types";

type Store = {
  intent: TripIntent;
  patchIntent: (patch: Partial<TripIntent>) => void;
};

const DEFAULT_INTENT: TripIntent = {
  mode: "surprise",
  originCityId: "paris-fr",
  selectedCityIds: [],
  duration: 7,
  companions: "solo",
  interests: [],
  region: "any",
  vibe: {
    pace: "balanced",
    budget: "comfort",
    climate: "any",
  },
};

export const useTripIntentStore = create<Store>((set) => ({
  intent: DEFAULT_INTENT,

  patchIntent: (patch) =>
    set((state) => ({ intent: { ...state.intent, ...patch } })),
}));
