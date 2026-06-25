import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
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
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/logout-callback",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' http://dashboard.madeinarnhemland.com.au",
          },
          {
            key: "X-Frame-Options",
            value: "ALLOW-FROM http://dashboard.madeinarnhemland.com.au",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
