interface BlogPostSchemaProps {
  title: string;
  description?: string;
  image?: string;
  slug: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
}

export function BlogPostSchema({
  title,
  description,
  image,
  slug,
  datePublished,
  dateModified,
  author = "Made in Arnhem Land Editorial Team",
}: BlogPostSchemaProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    url: `https://madeinarnhemland.com.au/blog/${slug}`,
    ...(datePublished
      ? { datePublished: new Date(datePublished).toISOString() }
      : {}),
    ...(dateModified
      ? { dateModified: new Date(dateModified).toISOString() }
      : {}),
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "Made in Arnhem Land",
      logo: {
        "@type": "ImageObject",
        url: "https://madeinarnhemland.com.au/images/navbarLogo.png",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
