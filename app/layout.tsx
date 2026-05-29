// app/layout.tsx (SERVER COMPONENT)
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

export const metadata = {
  title: "Made in Arnhem Land",
  // You can add more meta fields here if needed
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: "history.scrollRestoration='manual';window.scrollTo(0,0);" }} />
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
