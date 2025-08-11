import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // skip ESLint errors in production build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // skip TypeScript errors in production build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
