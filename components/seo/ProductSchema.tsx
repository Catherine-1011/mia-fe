interface ProductSchemaProps {
  name: string;
  description?: string;
  image?: string | string[];
  price?: string;
  slug: string;
  sellerName?: string;
  inStock?: boolean;
  sku?: string;
}

export function ProductSchema({
  name,
  description,
  image,
  price,
  slug,
  sellerName,
  inStock = true,
  sku,
}: ProductSchemaProps) {
  const numericPrice = price ? parseFloat(price.replace(/[^0-9.]/g, "")) : 0;
  const images = Array.isArray(image)
    ? image.filter(Boolean)
    : image
      ? [image]
      : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    ...(description ? { description } : {}),
    ...(images.length > 0 ? { image: images } : {}),
    ...(sku ? { sku } : {}),
    ...(sellerName
      ? { brand: { "@type": "Brand", name: sellerName } }
      : {}),
    offers: {
      "@type": "Offer",
      url: `https://madeinarnhemland.com.au/shop/${slug}`,
      priceCurrency: "AUD",
      price: numericPrice > 0 ? numericPrice.toFixed(2) : undefined,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
