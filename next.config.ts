import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Allow any HTTPS host (S3, CloudFront, other CDNs, etc.)
        protocol: "https",
        hostname: "**",
      },
      {
        // Allow any HTTP host for local/dev environments
        protocol: "http",
        hostname: "**",
      },
    ],
  },

  async headers() {
    return [
      {
        // Allow the Dashboard to load this page in a hidden iframe for cross-domain logout
        source: "/logout-callback",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://alpa-dashboard.vercel.app",
          },
          {
            key: "X-Frame-Options",
            value: "ALLOW-FROM https://alpa-dashboard.vercel.app",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;




export default nextConfig;
