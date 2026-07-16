import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The standalone Discover/Weather pages merged into /explore, which accepts
  // the same query params (city, warmth, dry, sunny, month) — so query strings
  // carry over automatically and old links stay lossless.
  async redirects() {
    return [
      { source: "/discover", destination: "/explore", permanent: false },
      { source: "/weather", destination: "/explore", permanent: false },
    ];
  },
};

export default nextConfig;
