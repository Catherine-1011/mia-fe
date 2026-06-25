import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about buying, selling, shipping and returns on the Made in Arnhem Land marketplace.",
  alternates: { canonical: "/faqs" },
};

export default function FaqsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
