import type { Metadata } from "next";
import { getBlogPostBySlug } from "@/lib/seo";
import { BlogPostSchema } from "@/components/seo/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import BlogPostPage from "./BlogPostClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  const title = post.title;
  const description = post.shortDescription
    ? post.shortDescription.slice(0, 155)
    : `Read "${title}" on the Made in Arnhem Land journal.`;
  const image = post.coverImage;

  return {
    title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      ...(image ? { images: [image] } : {}),
      ...(post.createdAt
        ? { publishedTime: new Date(post.createdAt).toISOString() }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  return (
    <>
      {post && (
        <>
          <BlogPostSchema
            title={post.title}
            description={post.shortDescription}
            image={post.coverImage}
            slug={slug}
            datePublished={post.createdAt}
            dateModified={post.updatedAt}
          />
          <BreadcrumbSchema
            items={[
              { name: "Home", href: "/" },
              { name: "Journal", href: "/blog" },
              { name: post.title, href: `/blog/${slug}` },
            ]}
          />
        </>
      )}
      <BlogPostPage />
    </>
  );
}
