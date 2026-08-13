import type { NextConfig } from "next";

const DASHBOARD_ORIGIN = "https://dashboard.madeinarnhemland.com.au";

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://cdn.inspectlet.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https: http:",
  "media-src 'self' https://res.cloudinary.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://backend.madeinarnhemland.com.au https://api.stripe.com https://checkout.stripe.com https://r.stripe.com https://m.stripe.com https://www.google-analytics.com https://region1.google-analytics.com https://stats.g.doubleclick.net https://cdn.inspectlet.com https://api.inspectlet.com https://hn.inspectlet.com wss://ws.inspectlet.com https://api.mapbox.com https://api.zippopotam.us wss://backend.madeinarnhemland.com.au",
  "frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://hooks.stripe.com https://www.google.com https://www.youtube.com",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
];

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
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/logout-callback",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy.replace(
              "frame-ancestors 'self'",
              `frame-ancestors 'self' ${DASHBOARD_ORIGIN}`,
            ),
          },
          {
            key: "X-Frame-Options",
            value: `ALLOW-FROM ${DASHBOARD_ORIGIN}`,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
