import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/seo";
import { ProductSchema } from "@/components/seo/ProductSchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import ShopSlugPage from "./ShopSlugClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const title = product.title || "Product";
  const description = product.description
    ? product.description.slice(0, 155)
    : `Shop ${title} — authentic product from Arnhem Land.`;
  const image = product.featuredImage || product.images?.[0];

  return {
    title,
    description,
    alternates: { canonical: `/shop/${slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      ...(image ? { images: [image] } : {}),
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
  const product = await getProductBySlug(slug);

  return (
    <>
      {product && (
        <>
          <ProductSchema
            name={product.title || "Product"}
            description={product.description}
            image={product.featuredImage || product.images?.[0]}
            price={product.displayPrice || product.price}
            slug={slug}
            sellerName={product.sellerName}
            inStock={
              (product.stock ?? product.totalStock ?? 0) > 0
            }
            sku={product.sku}
          />
          <BreadcrumbSchema
            items={[
              { name: "Home", href: "/" },
              { name: "Shop", href: "/shop" },
              { name: product.title || "Product", href: `/shop/${slug}` },
            ]}
          />
        </>
      )}
      <ShopSlugPage />
    </>
  );
}
