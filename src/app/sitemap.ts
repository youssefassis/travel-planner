import type { MetadataRoute } from "next";

const BASE = "https://wanderly.app";

/** Only the real destinations — /flights and /stays are redirects, and
 *  /trips is personal to each browser. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/planner`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/explore`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
