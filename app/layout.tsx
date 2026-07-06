// app/layout.tsx (SERVER COMPONENT)
import type { Metadata } from "next";
import Script from "next/script";
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
        <Script id="inspectlet" strategy="afterInteractive">
          {`
            window.__insp = window.__insp || [];
            window.__insp.push(["wid", 1771092486]);
            (function() {
              function ldinsp() {
                if (typeof window.__inspld !== "undefined") return;
                window.__inspld = 1;
                var insp = document.createElement("script");
                insp.type = "text/javascript";
                insp.async = true;
                insp.id = "inspsync";
                insp.src = ("https:" === document.location.protocol ? "https" : "http") + "://cdn.inspectlet.com/inspectlet.js?wid=1771092486&r=" + Math.floor(new Date().getTime() / 3600000);
                var x = document.getElementsByTagName("script")[0];
                x.parentNode.insertBefore(insp, x);
              }
              setTimeout(ldinsp, 0);
            })();
          `}
        </Script>
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
              </AuthProvider>
            </EnhancedCartProvider>
          </CartProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
