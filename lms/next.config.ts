import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [`${process.env.NEXT_PUBLIC_API_URL}`],
    unoptimized: true
  },
  experimental: {
    scrollRestoration: true
  }
};

export default nextConfig;
