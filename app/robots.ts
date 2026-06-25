import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/cart",
          "/checkout",
          "/login",
          "/signup",
          "/seller-login",
          "/login-verify-otp",
          "/signup-otp",
          "/admin",
          "/api/",
          "/guest/track-order",
          "/guest/refund",
          "/order-confirmation",
          "/logout-callback",
          "/sellerOnboarding",
          "/seller/stripe/callback",
          "/feedback",
          "/home2",
        ],
      },
    ],
    sitemap: "https://madeinarnhemland.com.au/sitemap.xml",
  };
}
