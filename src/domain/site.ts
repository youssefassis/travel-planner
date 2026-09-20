/** Where this deployment lives — the one place the public origin is defined.
 *
 *  Canonical URLs, the sitemap and robots.txt all have to agree on it, and it
 *  differs per environment, so it comes from `NEXT_PUBLIC_SITE_URL` (inlined at
 *  build time) rather than being hardcoded. The fallback keeps `npm run dev`
 *  and the tests working with no env file at all.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "http://localhost:3000";
