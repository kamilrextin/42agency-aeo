import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'intel.42agency.com',
      },
    ],
  },
};

export default nextConfig;
