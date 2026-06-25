import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Made in Arnhem Land — connecting buyers with authentic art, bush foods and handmade crafts from Arnhem Land communities since 1972.",
  alternates: { canonical: "/about-us" },
};

export default function AboutUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
