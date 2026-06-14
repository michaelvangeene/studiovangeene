import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/HDZ',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
