import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Strava serves activity photos from CloudFront under /pictures. The
      // subdomain is not stable across accounts, and the URLs are sometimes
      // signed, so `search` is deliberately left unrestricted.
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
        pathname: "/pictures/**",
      },
    ],
  },
};

export default nextConfig;
