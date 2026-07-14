import { create } from "zustand";
import { TripIntent } from "../types";

type Store = {
  intent: TripIntent;
  patchIntent: (intent: TripIntent) => void;
};

export const useTripIntentStore = create<Store>((set) => ({
  intent: {
    query: null,
    duration: null,
    companions: "solo",
    vibe: {
      pace: "balanced",
      budget: "comfort",
      activities: [],
    },
  },

  patchIntent: (intent) => set({ intent }),
}));
