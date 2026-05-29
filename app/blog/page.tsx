"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// Skeleton Components
const SkeletonBox = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-linear-to-r from-[#F4E9DC] via-[#e8d5c0] to-[#F4E9DC] bg-size-[200%_100%] ${className}`} />
);

const FeaturedSkeleton = () => (
  <article className="grid grid-cols-1 lg:grid-cols-2 bg-white border border-[#e8d5c0] rounded-3xl overflow-hidden shadow-sm">
    {/* Image skeleton */}
    <div className="relative w-full min-h-72 lg:min-h-96 overflow-hidden bg-[#F4E9DC]">
      <SkeletonBox className="w-full h-full" />
      {/* Badges skeleton */}
      <div className="absolute top-4 right-4">
        <SkeletonBox className="w-20 h-7 rounded-full" />
      </div>
      <div className="absolute top-4 left-4">
        <SkeletonBox className="w-16 h-7 rounded-full" />
      </div>
    </div>
    
    {/* Content skeleton */}
    <div className="flex flex-col justify-center p-8 lg:p-12">
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <SkeletonBox className="w-16 h-6 rounded-full" />
        <SkeletonBox className="w-20 h-6 rounded-full" />
      </div>
      
      {/* Date */}
      <SkeletonBox className="w-24 h-3 rounded mb-3" />
      
      {/* Title */}
      <div className="space-y-2 mb-4">
        <SkeletonBox className="w-full h-8 rounded" />
        <SkeletonBox className="w-3/4 h-8 rounded" />
      </div>
      
      {/* Excerpt */}
      <div className="space-y-2 mb-8">
        <SkeletonBox className="w-full h-4 rounded" />
        <SkeletonBox className="w-full h-4 rounded" />
        <SkeletonBox className="w-2/3 h-4 rounded" />
      </div>
      
      {/* CTA */}
      <div className="pt-6 border-t border-[#e8d5c0]">
        <SkeletonBox className="w-32 h-5 rounded" />
      </div>
    </div>
  </article>
);

const BlogCardSkeleton = () => (
  <article className="flex flex-col bg-white border border-[#e8d5c0] rounded-2xl overflow-hidden shadow-sm h-130">
    {/* Image skeleton */}
    <div className="relative w-full h-56 min-h-56 overflow-hidden bg-[#F4E9DC]">
      <SkeletonBox className="w-full h-full" />
      {/* Read time pill */}
      <div className="absolute top-3 right-3">
        <SkeletonBox className="w-20 h-6 rounded-full" />
      </div>
    </div>
    
    {/* Content skeleton */}
    <div className="flex flex-col p-6 flex-1">
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        <SkeletonBox className="w-14 h-5 rounded-full" />
        <SkeletonBox className="w-18 h-5 rounded-full" />
      </div>
      
      {/* Date */}
      <SkeletonBox className="w-20 h-3 rounded mb-2" />
      
      {/* Title */}
      <div className="space-y-2 mb-3">
        <SkeletonBox className="w-full h-5 rounded" />
        <SkeletonBox className="w-4/5 h-5 rounded" />
      </div>
      
      {/* Excerpt */}
      <div className="space-y-2 mb-auto">
        <SkeletonBox className="w-full h-3 rounded" />
        <SkeletonBox className="w-full h-3 rounded" />
        <SkeletonBox className="w-3/4 h-3 rounded" />
      </div>
      
      {/* CTA */}
      <div className="pt-4 border-t border-[#e8d5c0] mt-4">
        <SkeletonBox className="w-24 h-4 rounded" />
      </div>
    </div>
  </article>
);

const BlogPageSkeleton = () => (
  <main className="min-h-screen bg-[#EAD7B7]">
    {/* Header Section Skeleton */}
    <section className="relative bg-[#3a1208] overflow-hidden pt-52 pb-32 px-6">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Breadcrumb skeleton */}
        <SkeletonBox className="w-32 h-3 rounded mb-6" />
        
        {/* Label skeleton */}
        <SkeletonBox className="w-40 h-4 rounded mb-4" />
        
        {/* Title skeleton */}
        <div className="space-y-4 mb-5">
          <SkeletonBox className="w-full max-w-2xl h-12 rounded" />
          <SkeletonBox className="w-3/4 max-w-xl h-12 rounded" />
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-2 max-w-xl">
          <SkeletonBox className="w-full h-4 rounded" />
          <SkeletonBox className="w-2/3 h-4 rounded" />
        </div>
      </div>
    </section>
    
    {/* Featured Post Skeleton */}
    <section className="bg-[#EAD7B7] pt-16 pb-0 px-4">
      <div className="max-w-7xl mx-auto">
        <SkeletonBox className="w-40 h-4 rounded mb-6" />
        <FeaturedSkeleton />
      </div>
    </section>
    
    {/* All Posts Skeleton */}
    <section className="bg-[#EAD7B7] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
          <div>
            <SkeletonBox className="w-32 h-4 rounded mb-2" />
            <SkeletonBox className="w-64 h-8 rounded" />
          </div>
          <SkeletonBox className="w-24 h-4 rounded" />
        </div>
        
        {/* Filter tags skeleton */}
        <div className="flex flex-wrap gap-3 mb-10">
          {[...Array(6)].map((_, i) => (
            <SkeletonBox key={i} className={`h-9 rounded-full ${
              i === 0 ? 'w-12' : i === 1 ? 'w-20' : i === 2 ? 'w-16' : i === 3 ? 'w-24' : i === 4 ? 'w-18' : 'w-14'
            }`} />
          ))}
        </div>
        
        {/* Blog cards grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  </main>
);

// Custom styles for text truncation
const truncateStyles = {
  title: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  excerpt: {
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  featuredTitle: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  featuredExcerpt: {
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface ApiBlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImage: string;
  shortDescription: string;
  tags: string[];
  ctaText: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface BlogPost {
  title: string;
  excerpt: string;
  tags: string[];
  readTime: string;  
  date: string;
  cta: string;
  image: string;
  href: string;
  featured: boolean;
}

// ─────────────────────────────────────────────
// Utility functions
// ─────────────────────────────────────────────
const API_BASE_URL = "https://alpa-be.onrender.com/api";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};
const slugify = (slug: string): string => {
  return slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/--+/g, '-');
};
const transformApiDataToBlogPost = (apiPost: ApiBlogPost, index: number): BlogPost => {
  return {
    title: apiPost.title,
    excerpt: apiPost.shortDescription,
    tags: apiPost.tags.length > 0 ? apiPost.tags : ["General"],
    readTime: "5 min read", // Default read time since API doesn't provide it
    date: formatDate(apiPost.createdAt),
    cta: apiPost.ctaText || "Read more",
    image: apiPost.coverImage || "/images/default-blog.jpg",
    href: `/blog/${slugify(apiPost.slug)}`, 
    featured: index === 0, // First blog post is featured
  };
};

// ─────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────
function BlogCard({
  post,
}: {
  post: BlogPost;
}) {
  return (
    <Link href={post.href} className="group block h-130"> 
    <article className="group flex flex-col bg-white border border-[#e8d5c0] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-130">
      {/* Image */}
      <div className="relative w-full h-56 min-h-56 overflow-hidden bg-[#F4E9DC]">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Read time pill */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[10px] font-semibold text-white/90">
            <svg
              className="w-3 h-3 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {post.readTime}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col p-6 flex-1">
        <div className="flex-1 min-h-0">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-[#F4E9DC] text-[#803512] text-[11px] font-semibold tracking-wide border border-[#e8d5c0]"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Date */}
          <p className="text-[11px] text-[#803512]/50 font-medium mb-2 tracking-wide">
            {post.date}
          </p>

          <h3 className="text-lg font-bold text-[#1a0a06] leading-snug mb-3 group-hover:text-[#803512] transition-colors duration-200" style={truncateStyles.title}>
            {post.title}
          </h3>
          <div className="overflow-hidden">
            <p className="text-sm text-gray-500 leading-relaxed" style={truncateStyles.excerpt}>
              {post.excerpt}
            </p>
          </div>
        </div>

        {/* CTA - Always at bottom */}
        <div className="pt-4 border-t border-[#e8d5c0] mt-auto">
          <span
            // href={post.href}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#803512] hover:text-[#5A1E12] transition-colors group/cta"
          >
            {post.cta}
            <svg
              className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </span>
        </div>
      </div>
    </article>
     </Link>
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function BlogPage() {
  const [activeTag, setActiveTag] = useState("All");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterState, setNewsletterState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [newsletterMsg, setNewsletterMsg] = useState("");
  
  // Unsubscribe modal state
  const [showUnsubModal, setShowUnsubModal] = useState(false);
  const [unsubEmail, setUnsubEmail] = useState("");
  const [unsubState, setUnsubState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [unsubMsg, setUnsubMsg] = useState("");

  // Fetch blog posts from API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/blogs`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch blogs');
        }

        const data = await response.json();
        
        // Handle different possible response formats
        let blogArray;
        if (Array.isArray(data)) {
          blogArray = data;
        } else if (data && Array.isArray(data.data)) {
          blogArray = data.data;
        } else if (data && Array.isArray(data.blogs)) {
          blogArray = data.blogs;
        } else {
          console.error('Unexpected API response format:', data);
          throw new Error('Invalid data format - expected array of blogs');
        }

        const transformedPosts = blogArray
          .filter((post: ApiBlogPost) => post.status === 'PUBLISHED')
          .map((post: ApiBlogPost, index: number) => transformApiDataToBlogPost(post, index));
        setBlogPosts(transformedPosts);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Newsletter subscription handler
  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmed = newsletterEmail.trim();
    if (!trimmed) {
      setNewsletterMsg("Please enter your email.");
      setNewsletterState("error");
      return;
    }
    
    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setNewsletterMsg("Please enter a valid email.");
      setNewsletterState("error");
      return;
    }

    setNewsletterState("loading");
    setNewsletterMsg("");
    
    try {
      const res = await fetch(`${API_BASE_URL}/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setNewsletterMsg(data.message || "Subscription failed. Please try again.");
        setNewsletterState("error");
        return;
      }
      
      setNewsletterMsg(data.message || "You're subscribed! Welcome aboard.");
      setNewsletterState("success");
      setNewsletterEmail("");
      
      // Auto-clear success message after 4 seconds
      setTimeout(() => {
        setNewsletterState("idle");
        setNewsletterMsg("");
      }, 4000);
    } catch (err) {
      setNewsletterMsg("Something went wrong. Please try again.");
      setNewsletterState("error");
    }
  };

  // Unsubscribe handler
  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmed = unsubEmail.trim();
    if (!trimmed) {
      setUnsubMsg("Please enter your email.");
      setUnsubState("error");
      return;
    }
    
    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setUnsubMsg("Please enter a valid email.");
      setUnsubState("error");
      return;
    }

    setUnsubState("loading");
    setUnsubMsg("");
    
    try {
      const res = await fetch(`${API_BASE_URL}/newsletter/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setUnsubMsg(data.message || "Failed to unsubscribe. Please try again.");
        setUnsubState("error");
        return;
      }
      
      setUnsubMsg(data.message || "You've been unsubscribed successfully.");
      setUnsubState("success");
      setUnsubEmail("");
      
      // Auto-clear and close modal after 3 seconds
      setTimeout(() => {
        setUnsubState("idle");
        setUnsubMsg("");
        setShowUnsubModal(false);
      }, 3000);
    } catch (err) {
      setUnsubMsg("Something went wrong. Please try again.");
      setUnsubState("error");
    }
  };

  // Generate tags from fetched posts
  const allTags = [
    "All",
    ...Array.from(new Set(blogPosts.flatMap((p) => p.tags))),
  ];

  const featured = blogPosts.find((p) => p.featured);
  const filtered =
    activeTag === "All"
      ? blogPosts.filter((p) => !p.featured)
      : blogPosts.filter(
          (p) => !p.featured && p.tags.includes(activeTag)
        );

  // Loading state
  if (loading) {
    return <BlogPageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-[#EAD7B7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">Error loading blogs</p>
          <p className="text-[#803512]">{error}</p>
        </div>
      </main>
    );
  }

  // No blogs state
  if (blogPosts.length === 0) {
    return (
      <main className="min-h-screen bg-[#EAD7B7] flex items-center justify-center">
        <div className="text-center bg-white/50 backdrop-blur-sm p-10 rounded-3xl shadow-sm border border-[#e8d5c0] max-w-lg mx-auto">
          <h2 className="text-3xl font-black text-[#3a1208] mb-4">Coming Soon</h2>
          <p className="text-[#803512]/80 leading-relaxed">
            We are working hard compiling the wonderful stories, crafts, and culture of Arnhem Land. 
            Check back here very soon for insights from our community!
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#3a1208] text-white text-sm font-semibold hover:bg-[#5A1E12] transition-colors">
              Return Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EAD7B7]">

      {/* ── PAGE HEADER ── */}
      <section className="relative bg-[#3a1208] overflow-hidden pt-52 pb-32 px-6">
        {/* dot-grid watermark */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.08]"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="blog-dots"
              x="0"
              y="0"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.5" fill="#EAD7B7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blog-dots)" />
        </svg>

        {/* Aboriginal concentric-ring watermark — top right */}
        <svg
          aria-hidden="true"
          viewBox="0 0 200 200"
          fill="none"
          className="absolute -top-8 -right-8 w-56 h-56 text-[#ead7b7] opacity-[0.06] pointer-events-none"
        >
          {[90, 68, 48, 30, 14].map((r, i) => (
            <circle
              key={r}
              cx="100"
              cy="100"
              r={r}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity={1 - i * 0.15}
            />
          ))}
          <circle cx="100" cy="100" r="6" fill="currentColor" />
          {[
            [100, 4],
            [100, 196],
            [4, 100],
            [196, 100],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="3.5" fill="currentColor" />
          ))}
        </svg>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#ead7b7]/40 mb-6">
            <Link href="/" className="hover:text-[#ead7b7]/70 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#ead7b7]/70">Journal</span>
          </div>

          {/* Label */}
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-[#ead7b7]/50 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ead7b7] animate-pulse" />
            From the Journal
          </span>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white mb-5">
            Stories &{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#ead7b7]">Insights</span>
              <span className="absolute left-0 -bottom-1 w-full h-1 rounded-full bg-[#ead7b7]/20" />
            </span>
          </h1>
          <p className="text-base text-white/55 max-w-xl leading-relaxed">
            Explore culture, craft, community, and the stories behind every
            product on our marketplace — straight from Arnhem Land.
          </p>
        </div>
      </section>

      {/* ── FEATURED POST ── */}
      <section className="bg-[#EAD7B7] pt-16 pb-0 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-[#803512]/60 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#803512] animate-pulse" />
            Featured Story
          </span>

          {featured && (
            <Link href={featured.href} className="group block">
            <article className="relative grid grid-cols-1 lg:grid-cols-2 bg-white border border-[#e8d5c0] rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              {/* Image */}
              <div className="relative w-full min-h-72 lg:min-h-96 overflow-hidden bg-[#F4E9DC]">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Read time pill */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-[11px] font-semibold text-white/90">
                    <svg
                      className="w-3.5 h-3.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {featured.readTime}
                  </span>
                </div>
                {/* Featured badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#803512] text-[11px] font-bold text-white tracking-wide uppercase">
                    Featured
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-col justify-center p-8 lg:p-12">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {featured.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-[#F4E9DC] text-[#803512] text-[11px] font-semibold tracking-wide border border-[#e8d5c0]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="text-[11px] text-[#803512]/50 font-medium mb-3 tracking-wide">
                  {featured.date}
                </p>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1a0a06] leading-snug mb-4 group-hover:text-[#803512] transition-colors duration-300" style={truncateStyles.featuredTitle}>
                  {featured.title}
                </h2>
                <p className="text-base text-gray-500 leading-relaxed mb-8" style={truncateStyles.featuredExcerpt}>
                  {featured.excerpt}
                </p>

                <div className="pt-6 border-t border-[#e8d5c0]">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#803512] group-hover:text-[#5A1E12] transition-colors">
                    {featured.cta}
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </article>
          </Link>
          )}
        </div>
      </section>

      {/* ── ALL POSTS ── */}
      <section className="bg-[#EAD7B7] py-16 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Section label + tag filter row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-[#803512]/60 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#803512] animate-pulse" />
                All Articles
              </span>
              <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-[#3a1208]">
                Browse by{" "}
                <span className="text-[#803512]">Topic</span>
              </h2>
            </div>

            {/* Result count */}
            <p className="text-sm text-[#803512]/60 font-medium shrink-0">
              {filtered.length} article{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Tag filter pills */}
          <div className="flex flex-wrap gap-2 mb-12">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-200 border ${
                  activeTag === tag
                    ? "bg-[#803512] text-white border-[#803512] shadow-md"
                    : "bg-white text-[#803512] border-[#e8d5c0] hover:border-[#803512] hover:bg-[#F4E9DC]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Cards grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((post) => (
                <BlogCard key={post.href} post={post} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-[#F4E9DC] flex items-center justify-center mb-5 border border-[#e8d5c0]">
                <svg
                  className="w-7 h-7 text-[#803512]/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-[#803512]/70 font-semibold text-base mb-1">
                No articles found
              </p>
              <p className="text-sm text-[#803512]/40">
                Try selecting a different category
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── NEWSLETTER / CTA STRIP ── */}
      <section className="bg-[#3a1208] py-20 px-4 overflow-hidden relative">
        {/* dot-grid */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.07]"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="cta-dots"
              x="0"
              y="0"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.5" fill="#EAD7B7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-dots)" />
        </svg>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-[#ead7b7]/50 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ead7b7] animate-pulse" />
            Stay in the loop
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
            Never miss a{" "}
            <span className="text-[#ead7b7]">story</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-10 max-w-md mx-auto">
            Get the latest articles, artist spotlights, and cultural stories
            from Arnhem Land delivered straight to your inbox.
          </p>
          <form
            onSubmit={handleNewsletterSubscribe}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Your email address"
              aria-label="Email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              disabled={newsletterState === "loading"}
              className="flex-1 px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ead7b7]/60 transition-colors disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={newsletterState === "loading"}
              className={`shrink-0 px-7 py-3.5 font-bold text-sm rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-lg disabled:opacity-60 ${
                newsletterState === "loading"
                  ? "bg-[#ead7b7]/60 text-[#3a1208] cursor-not-allowed"
                  : "bg-[#ead7b7] hover:bg-white text-[#3a1208]"
              }`}
            >
              {newsletterState === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
          
          {/* Message feedback */}
          {newsletterMsg && (
            <p className={`text-sm mt-4 transition-opacity duration-300 ${
              newsletterState === "success"
                ? "text-[#ead7b7] font-medium"
                : newsletterState === "error"
                ? "text-red-300 font-medium"
                : "text-white/50"
            }`}>
              {newsletterMsg}
            </p>
          )}
          
          <p className="text-white/25 text-[11px] mt-4">
            No spam, unsubscribe at any time.{" "}
            <button
              onClick={() => {
                setShowUnsubModal(true);
                setUnsubState("idle");
                setUnsubMsg("");
                setUnsubEmail("");
              }}
              className="text-[#ead7b7] hover:text-white underline transition-colors"
            >
              Manage preferences
            </button>
          </p>
        </div>
      </section>

      {/* ── UNSUBSCRIBE MODAL ── */}
      {showUnsubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-[#5A1E12] px-6 pt-6 pb-5 text-center">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-white font-bold text-lg">Unsubscribe from Newsletter</p>
              <p className="text-white/70 text-sm mt-1">We'll miss you, but we understand</p>
            </div>

            {/* Body */}
            <div className="p-6">
              <form onSubmit={handleUnsubscribe} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={unsubEmail}
                    onChange={(e) => setUnsubEmail(e.target.value)}
                    disabled={unsubState === "loading"}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5A1E12]/40 focus:ring-2 focus:ring-[#5A1E12]/10 transition-colors disabled:opacity-60"
                  />
                </div>

                {/* Message feedback */}
                {unsubMsg && (
                  <p className={`text-sm rounded-lg px-3 py-2 ${
                    unsubState === "success"
                      ? "bg-green-50 text-green-700"
                      : unsubState === "error"
                      ? "bg-red-50 text-red-700"
                      : "bg-gray-50 text-gray-700"
                  }`}>
                    {unsubMsg}
                  </p>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUnsubModal(false);
                      setUnsubState("idle");
                      setUnsubMsg("");
                      setUnsubEmail("");
                    }}
                    disabled={unsubState === "loading"}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={unsubState === "loading"}
                    className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                      unsubState === "loading"
                        ? "bg-[#5A1E12]/60 text-white cursor-not-allowed"
                        : "bg-[#5A1E12] hover:bg-[#4a180f] text-white"
                    }`}
                  >
                    {unsubState === "loading" ? "Unsubscribing..." : "Unsubscribe"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
