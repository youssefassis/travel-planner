import type { MetadataRoute } from "next";

import { SITE_URL } from "@/domain/site";

/** Only the real destinations — /flights and /stays are redirects, and
 *  /trips is personal to each browser. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/planner`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/explore`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
