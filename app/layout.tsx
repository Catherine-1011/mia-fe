// app/layout.tsx (SERVER COMPONENT)
import type { Metadata } from "next";
import NavbarWrapper from "./NavbarWrapper";
import FooterWrapper from "./FooterWrapper";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import QueryProvider from "@/providers/QueryProvider";
import { EnhancedCartProvider } from "@/hooks/useSharedEnhancedCart";
import { StickyLeftCouponDrawer } from "@/components/common-components/StickyLeftCouponDrawer";
import ToastProvider from "@/providers/ToastProvider";
import ScrollToTop from "@/components/common-components/ScrollToTop";
import { OrganizationSchema } from "@/components/seo/OrganizationSchema";
import GoogleAnalytics from "@/components/common-components/GoogleAnalytics";
import ConsentBanner from "@/components/common-components/ConsentBanner";

export const metadata: Metadata = {
  metadataBase: new URL("https://madeinarnhemland.com.au"),
  title: {
    default:
      "Made in Arnhem Land",
    template: "%s | Made in Arnhem Land",
  },
  description:
    "Shop authentic art, bush foods and handmade crafts direct from Arnhem Land artists. 100% certified, ethically sourced, community-supported.",
  openGraph: {
    siteName: "Made in Arnhem Land",
    locale: "en_AU",
    type: "website",
    images: ["/images/navbarLogo.png"],
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "/",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* GA4 with Consent Mode v2 — consent defaults to denied until the
            user accepts via the ConsentBanner rendered in <body>. */}
        <GoogleAnalytics />
        <script dangerouslySetInnerHTML={{ __html: "history.scrollRestoration='manual';window.scrollTo(0,0);" }} />
        <OrganizationSchema />
      </head>
      <body className="bg-[#ECE4D6]">
        <ToastProvider />
        <QueryProvider>
          <CartProvider>
            <EnhancedCartProvider>
              <AuthProvider>
                <StickyLeftCouponDrawer />
                <NavbarWrapper />
                {children}
                <FooterWrapper />
                <ScrollToTop />
                <ConsentBanner />
              </AuthProvider>
            </EnhancedCartProvider>
          </CartProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
