import { Interest, Region } from "@/domain/types";

/** The light criteria that narrow the random pool. */
export type DiscoverFilters = {
  interests: Interest[]; // empty = any vibe
  region: Region | "any";
};

export const DEFAULT_FILTERS: DiscoverFilters = {
  interests: [],
  region: "any",
};
