import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      }
    ],
  },

  productionBrowserSourceMaps: false,
};

export default nextConfig;
