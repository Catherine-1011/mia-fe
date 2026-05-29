// app/FooterWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/common-components/Footer";

export default function FooterWrapper() {
  const pathname = usePathname();

  const hideFooter =
    pathname === "/login" ||
    pathname === "/seller-login" ||
    pathname === "/signup" ||
    pathname === "/login-verify-otp" ||
    pathname === "/cart"|| 
    pathname === "/sellerOnboarding" || 
    pathname === "/order-confirmation" ||
    pathname === "/checkout" ||
    pathname === "/logout-callback" ||
    pathname === "/signup-otp" ||
    pathname === "/guest/order-success" ||
    // pathname === "/guest/refund" ||
    pathname === "/guest/track-order";

  if (hideFooter) return null;

  return <Footer />;
}
