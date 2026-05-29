// app/NavbarWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/common-components/Header";

export default function NavbarWrapper() {
  const pathname = usePathname();

  const hideNavbar =
    pathname === "/login" ||
    pathname === "/seller-login" ||
    pathname === "/signup" ||
    pathname === "/sellerOnboarding" ||
    pathname === "/login-verify-otp" ||
    pathname === "/cart/single-page" ||
    pathname === "/shop/cart/checkout" ||
    pathname === "/checkout" ||
    pathname === "/order-confirmation" ||
    pathname === "/logout-callback" ||
    pathname === "/signup-otp" ||
    pathname === "/guest/order-success" ||
    pathname === "/guest/track-order";


  if (hideNavbar) return null;

  return (
    <div className="absolute top-6 left-0 w-full px-6 z-50">
      <Navbar />
    </div>
  );
}
