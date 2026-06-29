"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";

// Skeleton Components
const SkeletonBox = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-linear-to-r from-[#F4E9DC] via-[#e8d5c0] to-[#F4E9DC] bg-size-[200%_100%] ${className}`} />
);

const RelatedCardSkeleton = () => (
  <article className="group flex flex-col bg-white border border-[#e8d5c0] rounded-2xl overflow-hidden shadow-sm h-96">
    {/* Image skeleton */}
    <div className="relative w-full h-48 overflow-hidden bg-[#F4E9DC]">
      <SkeletonBox className="w-full h-full" />
      <div className="absolute top-3 right-3">
        <SkeletonBox className="w-16 h-5 rounded-full" />
      </div>
    </div>
    
    {/* Content skeleton */}
    <div className="flex flex-col p-4 flex-1">
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        <SkeletonBox className="w-12 h-4 rounded-full" />
        <SkeletonBox className="w-16 h-4 rounded-full" />
      </div>
      
      {/* Date */}
      <SkeletonBox className="w-18 h-3 rounded mb-2" />
      
      {/* Title */}
      <div className="space-y-1 mb-2">
        <SkeletonBox className="w-full h-4 rounded" />
        <SkeletonBox className="w-3/4 h-4 rounded" />
      </div>
      
      {/* Excerpt */}
      <div className="space-y-1 mb-auto">
        <SkeletonBox className="w-full h-3 rounded" />
        <SkeletonBox className="w-5/6 h-3 rounded" />
      </div>
      
      {/* CTA */}
      <div className="pt-3 border-t border-[#e8d5c0] mt-3">
        <SkeletonBox className="w-20 h-3 rounded" />
      </div>
    </div>
  </article>
);

const BlogPostSkeleton = () => (
  <main className="min-h-screen bg-[#EAD7B7]">
    {/* Hero Section Skeleton */}
    <section className="relative bg-[#3a1208] overflow-hidden pt-52 pb-20 px-6">
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Breadcrumb skeleton */}
        <SkeletonBox className="w-40 h-3 rounded mb-8 mx-auto" />
        
        {/* Tags skeleton */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          <SkeletonBox className="w-16 h-5 rounded-full" />
          <SkeletonBox className="w-20 h-5 rounded-full" />
        </div>
        
        {/* Title skeleton */}
        <div className="space-y-4 mb-8">
          <SkeletonBox className="w-full max-w-3xl h-12 rounded mx-auto" />
          <SkeletonBox className="w-2/3 max-w-2xl h-12 rounded mx-auto" />
        </div>
        
        {/* Meta info skeleton */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <SkeletonBox className="w-8 h-8 rounded-full" />
            <SkeletonBox className="w-24 h-4 rounded" />
          </div>
          <SkeletonBox className="w-20 h-4 rounded" />
          <SkeletonBox className="w-16 h-4 rounded" />
        </div>
      </div>
    </section>
    
    {/* Article Content Skeleton */}
    <section className="bg-[#EAD7B7] py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Featured image skeleton */}
        <div className="relative w-full aspect-video mb-12 rounded-3xl overflow-hidden bg-white border border-[#e8d5c0] shadow-sm">
          <SkeletonBox className="w-full h-full" />
        </div>
        
        {/* Content skeleton */}
        <div className="bg-white rounded-3xl border border-[#e8d5c0] shadow-sm p-8 lg:p-12">
          <div className="prose prose-lg max-w-none">
            {/* Paragraphs */}
            {[...Array(8)].map((_, i) => (
              <div key={i} className="mb-6">
                <div className="space-y-3">
                  <SkeletonBox className="w-full h-5 rounded" />
                  <SkeletonBox className="w-full h-5 rounded" />
                  <SkeletonBox className="w-4/5 h-5 rounded" />
                  {i === 2 && (
                    <div className="my-8">
                      <SkeletonBox className="w-3/4 h-8 rounded mb-4" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
    
    {/* Related Posts Skeleton */}
    <section className="bg-[#EAD7B7] pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <SkeletonBox className="w-32 h-4 rounded mb-3 mx-auto" />
          <SkeletonBox className="w-48 h-8 rounded mx-auto" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <RelatedCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  </main>
);

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

type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string; attribution: string };

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  readTime: string;
  date: string;
  author: string;
  image: string;
  href: string;
  cta: string;
  featured: boolean;
  content: ContentBlock[];
}

// ─────────────────────────────────────────────
// Utility functions
// ─────────────────────────────────────────────
const API_BASE_URL = "https://backend.madeinarnhemland.com.au/api";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const transformApiDataToBlogPost = (apiPost: ApiBlogPost): BlogPost => {
  // Transform content string to ContentBlock array
  const contentBlocks: ContentBlock[] = [];
  

  
  // Split content by paragraphs and create basic structure
  if (apiPost.content && typeof apiPost.content === 'string' && apiPost.content.trim()) {
    const paragraphs = apiPost.content.split('\n\n').filter(p => p.trim());
   
    
    paragraphs.forEach(paragraph => {
      const trimmed = paragraph.trim();
      if (trimmed) {
        contentBlocks.push({
          type: "paragraph",
          text: trimmed
        });
      }
    });
  } else {
    console.warn('⚠️ No content found or content is empty:', apiPost.content);
    // Add a fallback paragraph
    contentBlocks.push({
      type: "paragraph",
      text: "Content is being loaded. Please try refreshing the page."
    });
  }
  


  return {
    slug: apiPost.slug,
    title: apiPost.title,
    excerpt: apiPost.shortDescription,
    tags: apiPost.tags.length > 0 ? apiPost.tags : ["General"],
    readTime: "5 min read", // Default read time
    date: formatDate(apiPost.createdAt),
    author: "Made in Arnhem Land Editorial Team", // Default author
    image: apiPost.coverImage || "/images/default-blog.jpg",
    href: `/blog/${apiPost.slug}`,
    cta: apiPost.ctaText || "Read more",
    featured: false,
    content: contentBlocks
  };
};

const extractBlogArray = (data: any): ApiBlogPost[] => {
  // Handle different possible response formats
  if (Array.isArray(data)) {
    return data;
  } else if (data && Array.isArray(data.data)) {
    return data.data;
  } else if (data && Array.isArray(data.blogs)) {
    return data.blogs;
  } else {
    console.error('Unexpected API response format:', data);
    throw new Error('Invalid data format - expected array of blogs');
  }
};

// ─────────────────────────────────────────────
// Page component
// ─────────────────────────────────────────────
export default function BlogPostPage() {
  const params = useParams();
  const rawSlug = params?.slug as string;
  const slug = rawSlug ? decodeURIComponent(rawSlug) : '';

  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch blog post from API
  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        
    
        
        // Step 1: Get all blogs to find the blog ID by slug
        const allBlogsResponse = await fetch(`${API_BASE_URL}/blogs`);
        
        if (!allBlogsResponse.ok) {
          throw new Error('Failed to fetch blogs');
        }

        const allBlogsData = await allBlogsResponse.json();
        const blogArray = extractBlogArray(allBlogsData);
        

        // Find the blog post by slug
        const foundBlog = blogArray.find((blog: ApiBlogPost) => 
          blog.status === 'PUBLISHED' && blog.slug === slug
        );

        if (!foundBlog) {
          throw new Error('Blog post not found');
        }
        
        

        // Step 2: Fetch the full blog content by ID
        const blogByIdResponse = await fetch(`${API_BASE_URL}/blogs/${foundBlog.id}`);
        
        if (!blogByIdResponse.ok) {
          throw new Error('Failed to fetch blog content');
        }
        
        const blogByIdData = await blogByIdResponse.json();
        
        
        let fullBlogData;
        if (blogByIdData.success && blogByIdData.blog) {
          fullBlogData = blogByIdData.blog;
        } else if (blogByIdData.id) {
          // Direct blog object response
          fullBlogData = blogByIdData;
        } else {
          throw new Error('Invalid blog response format');
        }
        

        const transformedPost = transformApiDataToBlogPost(fullBlogData);
        setPost(transformedPost);
        
        // Step 3: Find related posts
        const relatedPosts = blogArray
          .filter((blog: ApiBlogPost) => {
            if (!blog || blog.status !== 'PUBLISHED' || blog.slug === slug) {
              return false;
            }
            
            // Check for shared tags
            const blogTags = blog.tags && Array.isArray(blog.tags) ? blog.tags : [];
            const currentTags = fullBlogData.tags && Array.isArray(fullBlogData.tags) ? fullBlogData.tags : [];
            
            return blogTags.length > 0 && currentTags.length > 0 && 
                   blogTags.some(tag => currentTags.includes(tag));
          })
          .slice(0, 3)
          .map(transformApiDataToBlogPost);
        
       
        
        // If no related posts found, show recent posts instead
        if (relatedPosts.length === 0) {
        
          const recentPosts = blogArray
            .filter((blog: ApiBlogPost) => 
              blog && blog.status === 'PUBLISHED' && blog.slug !== slug
            )
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3)
            .map(transformApiDataToBlogPost);
          
          setRelated(recentPosts);
        } else {
          setRelated(relatedPosts);
        }

      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [slug]);

  // Loading state
  if (loading) {
    return <BlogPostSkeleton />;
  }

  // Error or not found state
  if (error || !post) {
    return (
      <main className="min-h-screen bg-[#EAD7B7] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-white border border-[#e8d5c0] flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-[#803512]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-[#3a1208] mb-3">Post not found</h1>
        <p className="text-[#803512]/60 mb-8">{error || "This story doesn't exist or may have been moved."}</p>
        <Link href="/blog" className="inline-flex items-center gap-2 px-7 py-3 bg-[#5A1E12] text-white rounded-full font-semibold text-sm hover:bg-[#7a2a1a] transition-colors">
          Back to Journal
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EAD7B7]">

      {/* ── HERO ── */}
      <section className="relative bg-[#3a1208] overflow-hidden">
        {/* Dot-grid watermark */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.07]"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern id="post-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#EAD7B7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#post-dots)" />
        </svg>

        {/* Hero image */}
        <div className="relative w-full h-72 sm:h-96 lg:h-130 overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#3a1208] via-[#3a1208]/60 to-transparent" />
        </div>

        {/* Header content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 -mt-32 sm:-mt-40 lg:-mt-52 pb-14">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#ead7b7]/40 mb-5">
            <Link href="/" className="hover:text-[#ead7b7]/70 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#ead7b7]/70 transition-colors">Journal</Link>
            <span>/</span>
            <span className="text-[#ead7b7]/60 truncate max-w-50">{post.title}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#ead7b7] text-[11px] font-bold tracking-wide uppercase backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.08] tracking-tight mb-6">
            {post.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#ead7b7]/50">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {post.author}
            </span>
            <span className="w-1 h-1 rounded-full bg-[#ead7b7]/30" />
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {post.date}
            </span>
            <span className="w-1 h-1 rounded-full bg-[#ead7b7]/30" />
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {post.readTime}
            </span>
          </div>
        </div>
      </section>

      {/* ── ARTICLE BODY ── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Excerpt / lead */}
          <p className="text-lg sm:text-xl text-[#3a1208]/70 leading-relaxed font-medium border-l-4 border-[#803512] pl-5 mb-12">
            {post.excerpt}
          </p>

          {/* Content blocks */}
          <div className="space-y-8">
            {(post.content as ContentBlock[]).map((block, i) => {
              if (block.type === "heading") {
                return (
                  <h2
                    key={i}
                    className="text-2xl sm:text-3xl font-black text-[#3a1208] leading-snug tracking-tight pt-4"
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.type === "quote") {
                return (
                  <blockquote
                    key={i}
                    className="relative my-10 pl-6 border-l-4 border-[#803512]"
                  >
                    <svg
                      className="absolute -top-2 -left-1 w-6 h-6 text-[#803512]/30"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                    <p className="text-xl sm:text-2xl font-bold italic text-[#3a1208] leading-snug mb-3">
                      "{block.text}"
                    </p>
                    <cite className="text-sm font-semibold text-[#803512]/70 not-italic">
                      — {block.attribution}
                    </cite>
                  </blockquote>
                );
              }
              return (
                <p key={i} className="text-base sm:text-lg text-[#3a1208]/70 leading-relaxed">
                  {block.text}
                </p>
              );
            })}
          </div>

          {/* Tags footer */}
          <div className="flex flex-wrap gap-2 mt-14 pt-8 border-t border-[#803512]/20">
            <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#803512]/50 mr-2 self-center">Tags:</span>
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${tag}`}
                className="px-4 py-1.5 rounded-full bg-white border border-[#e8d5c0] text-[#803512] text-[11px] font-bold tracking-wide uppercase hover:bg-[#F4E9DC] transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>

          {/* Back link */}
          <div className="mt-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#803512] hover:text-[#5A1E12] transition-colors group"
            >
              <svg
                className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Back to all articles
            </Link>
          </div>
        </div>
      </section>

      {/* ── RELATED POSTS ── */}
      {related.length > 0 && (
        <section className="bg-white py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-[#803512]/60 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#803512] animate-pulse" />
                  Keep Reading
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-[#3a1208] leading-tight tracking-tight">
                  More <span className="text-[#803512]">Stories</span>
                </h2>
              </div>
              <Link
                href="/blog"
                className="shrink-0 inline-flex items-center gap-2 font-semibold underline underline-offset-4 text-[#803512] hover:text-[#5A1E12] transition-colors group text-sm"
              >
                View all articles
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Cards — same design as homepage / blog listing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((relPost) => (
                <Link key={relPost.slug} href={relPost.href} className="group">
                  <article className="flex flex-col bg-[#EAD7B7] border border-[#e8d5c0] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                    {/* Image */}
                    <div className="relative w-full aspect-video overflow-hidden bg-[#F4E9DC]">
                      <Image
                        src={relPost.image}
                        alt={relPost.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Read time pill */}
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[10px] font-semibold text-white/90">
                          <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {relPost.readTime}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col flex-1 p-6">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {relPost.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-full bg-white text-[#803512] text-[11px] font-semibold tracking-wide border border-[#e8d5c0]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] text-[#803512]/50 font-medium mb-2 tracking-wide">
                        {relPost.date}
                      </p>
                      <h3 className="text-lg font-bold text-[#1a0a06] leading-snug mb-3 group-hover:text-[#803512] transition-colors duration-200 line-clamp-2">
                        {relPost.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-5 line-clamp-3">
                        {relPost.excerpt}
                      </p>

                      {/* CTA */}
                      <div className="pt-4 border-t border-[#e8d5c0]">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#803512] group-hover:text-[#5A1E12] transition-colors">
                          {relPost.cta}
                          <svg
                            className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA STRIP ── */}
      <section className="bg-[#EAD7B7] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-white border border-[#e8d5c0] rounded-3xl overflow-hidden shadow-sm px-8 py-14 sm:px-16">
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.07]"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern id="cta-dots2" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#EAD7B7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-dots2)" />
        </svg>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-[#3a1208] leading-tight mb-4">
            Explore Our <span className="text-[#803512]">Marketplace</span>
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-sm mx-auto">
            Discover authentic Aboriginal art, crafts, and cultural products — each with a story directly from Arnhem Land.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#ead7b7] hover:bg-[#d4b98a] text-[#3a1208] font-bold text-sm rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-lg"
          >
            Shop Now
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
        </div>
        </div>
      </section>

    </main>
  );
}
