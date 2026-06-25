import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Legal disclaimer for the Made in Arnhem Land marketplace website and services.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
