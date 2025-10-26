import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Only run ESLint on these directories during production builds
    dirs: ['src'],
    // Allow production builds to successfully complete even if there are ESLint warnings
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Allow production builds to successfully complete even if there are type errors
    // Set to true only if you want to skip type checking during build
    ignoreBuildErrors: false,
  },
  // Webpack configuration
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
