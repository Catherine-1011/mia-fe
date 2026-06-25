import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Authentic Aboriginal Products",
  description:
    "Browse and buy authentic Aboriginal art, bush foods, apparel and handmade crafts direct from Arnhem Land artists and communities.",
  alternates: { canonical: "/shop" },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
