import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Stories, news and insights from Arnhem Land — explore Aboriginal culture, art and community through our blog.",
  alternates: { canonical: "/blog" },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
