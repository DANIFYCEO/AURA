import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {},
  // Allow Yahoo Finance images if needed
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.yahoo.com' },
    ],
  },
};

export default nextConfig;
