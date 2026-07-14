const API_BASE_URL = "https://backend.madeinarnhemland.com.au/api";

export interface SeoProduct {
  id: string;
  title: string;
  description?: string;
  price?: string;
  slug?: string;
  featuredImage?: string;
  images?: string[];
  category?: string;
  sellerName?: string;
  artistName?: string;
  stock?: number;
  totalStock?: number;
  displayPrice?: string;
  updatedAt?: string;
  createdAt?: string;
  sku?: string;
  brand?: string;
  isActive?: boolean;
  productType?: string;
  type?: string;
}

export interface SeoBlogPost {
  id: string;
  title: string;
  slug: string;
  content?: string;
  coverImage?: string;
  shortDescription?: string;
  tags?: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function getAllProductsForSeo(): Promise<SeoProduct[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/all`, {
      next: { revalidate: 3600, tags: ["products"] },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const products: SeoProduct[] = data.products || [];
    return products
      .filter((p) => p.isActive !== false)
      .map((p) => ({
        ...p,
        slug:
          p.slug ||
          (p.title
            ? p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
            : `product-${p.id}`),
      }));
  } catch {
    return [];
  }
}

export async function getProductBySlug(
  slug: string
): Promise<SeoProduct | null> {
  try {
    const products = await getAllProductsForSeo();
    const match = products.find(
      (p) =>
        p.slug === slug ||
        (p.title &&
          p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug)
    );
    if (!match) return null;

    const res = await fetch(`${API_BASE_URL}/products/${match.id}`, {
      next: { revalidate: 3600, tags: ["products"] },
    });
    if (!res.ok) return match;
    const data = await res.json();
    const full = data.product || data;
    return {
      ...match,
      ...full,
      slug: match.slug,
    };
  } catch {
    return null;
  }
}

export async function getAllBlogPostsForSeo(): Promise<SeoBlogPost[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/blogs`, {
      next: { revalidate: 3600, tags: ["blogs"] },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const blogs: SeoBlogPost[] = Array.isArray(data)
      ? data
      : data.data || data.blogs || [];
    return blogs.filter((b) => b.status === "PUBLISHED");
  } catch {
    return [];
  }
}

export async function getBlogPostBySlug(
  slug: string
): Promise<SeoBlogPost | null> {
  try {
    const posts = await getAllBlogPostsForSeo();
    const match = posts.find((p) => p.slug === slug);
    if (!match) return null;

    const res = await fetch(`${API_BASE_URL}/blogs/${match.id}`, {
      next: { revalidate: 3600, tags: ["blogs"] },
    });
    if (!res.ok) return match;
    const data = await res.json();
    const full = data.blog || data;
    return { ...match, ...full };
  } catch {
    return null;
  }
}
