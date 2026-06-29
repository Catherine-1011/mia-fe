"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useProducts } from "@/hooks/useProducts";
import OptimisticProductCard from "@/components/cards/OptimisticProductCard";
import Link from "next/link";
import { motion } from "framer-motion";
import Sponsored from "@/components/cards/Sponsored";

const SLIDE_COUNT = 2;
const API_BASE_URL = "https://backend.madeinarnhemland.com.au/api";
const HERO_VIDEO_SRC = "/home-video-safari.mp4";
const HERO_VIDEO_TYPE = 'video/mp4; codecs="avc1.640029"';
const HERO_VIDEO_FADE_SECONDS = 0.65;

// Blog post type for homepage
interface ApiBlogPost {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  coverImage: string;
  tags: string[];
  ctaText: string;
  status: string;
  createdAt: string;
}

interface HomeBlogPost {
  title: string;
  excerpt: string;
  tags: string[];
  readTime: string;
  cta: string;
  image: string;
  href: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const transformApiBlogToHomePost = (apiPost: ApiBlogPost): HomeBlogPost => ({
  title: apiPost.title,
  excerpt: apiPost.shortDescription,
  tags: apiPost.tags.length > 0 ? apiPost.tags : ["General"],
  readTime: "5 min read", // Default read time
  cta: apiPost.ctaText || "Read more",
  image: apiPost.coverImage || "/images/default-blog.jpg",
  href: `/blog/${apiPost.slug}`,
});

const Page = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const productScrollRef = useRef<HTMLDivElement>(null);
  const heroVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const heroActiveVideoRef = useRef(0);
  const heroSwitchingRef = useRef(false);
  const heroResetTimerRef = useRef<number | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const limitedProducts = products
    .filter((product) => product.featured)
    .slice(0, 12);

  // Blog state management
  const [blogPosts, setBlogPosts] = useState<HomeBlogPost[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [blogsError, setBlogsError] = useState<string | null>(null);

  // Fetch blogs for homepage
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setBlogsLoading(true);
        setBlogsError(null);

        const response = await fetch(`${API_BASE_URL}/blogs`);
        if (!response.ok) {
          throw new Error("Failed to fetch blogs");
        }

        const responseData = await response.json();
      // Debug log

        // Handle different response structures
        let blogData: ApiBlogPost[] = [];
        if (Array.isArray(responseData)) {
          blogData = responseData;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          blogData = responseData.data;
        } else if (responseData.blogs && Array.isArray(responseData.blogs)) {
          blogData = responseData.blogs;
        } else {
          throw new Error("Invalid API response structure");
        }

        const transformedPosts = blogData
          .filter((post) => post.status?.toLowerCase() === "published")
          .slice(0, 3) // Limit to 3 posts for homepage
          .map(transformApiBlogToHomePost);

        setBlogPosts(transformedPosts);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setBlogsError(
          error instanceof Error ? error.message : "Failed to fetch blogs",
        );
        setBlogPosts([]);
      } finally {
        setBlogsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const scrollToSlide = (index: number) => {
    if (scrollRef.current) {
      const slideWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: slideWidth * index,
        behavior: "smooth",
      });
      setActiveSlide(index);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const index = Math.round(el.scrollLeft / el.offsetWidth);
      setActiveSlide(index);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollProductByOne = (direction: 1 | -1) => {
    if (productScrollRef.current) {
      const card = productScrollRef.current.children[0] as HTMLElement;
      const gap =
        window.innerWidth >= 1024 ? 24 : window.innerWidth >= 640 ? 16 : 12;
      const cardWidth = card ? card.offsetWidth + gap : 300;
      productScrollRef.current.scrollBy({
        left: direction * cardWidth,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const videos = heroVideoRefs.current.filter(Boolean) as HTMLVideoElement[];
    const first = videos[0];
    const second = videos[1];

    if (!first || !second) return;

    const showVideo = (index: number) => {
      videos.forEach((video, videoIndex) => {
        video.style.opacity = videoIndex === index ? "1" : "0";
      });
    };

    const primeVideo = (video: HTMLVideoElement) => {
      if (video.currentSrc) return;

      video.src = HERO_VIDEO_SRC;
      video.load();
    };

    const switchVideos = async () => {
      if (heroSwitchingRef.current) return;

      const currentIndex = heroActiveVideoRef.current;
      const nextIndex = currentIndex === 0 ? 1 : 0;
      const current = videos[currentIndex];
      const next = videos[nextIndex];

      if (!current || !next) return;

      heroSwitchingRef.current = true;
      primeVideo(next);
      next.currentTime = 0;

      try {
        await next.play();
        showVideo(nextIndex);
        heroActiveVideoRef.current = nextIndex;

        if (heroResetTimerRef.current !== null) {
          window.clearTimeout(heroResetTimerRef.current);
        }

        heroResetTimerRef.current = window.setTimeout(() => {
          current.pause();
          current.currentTime = 0;
          heroSwitchingRef.current = false;
        }, HERO_VIDEO_FADE_SECONDS * 1000);
      } catch {
        heroSwitchingRef.current = false;
      }
    };

    const handleTimeUpdate = () => {
      const current = videos[heroActiveVideoRef.current];
      if (!current || heroSwitchingRef.current) return;

      const remaining = current.duration - current.currentTime;
      if (Number.isFinite(remaining) && remaining <= HERO_VIDEO_FADE_SECONDS) {
        void switchVideos();
      }
    };

    videos.forEach((video) => {
      video.muted = true;
      video.playsInline = true;
      video.addEventListener("timeupdate", handleTimeUpdate);
    });

    showVideo(0);
    first.currentTime = 0;
    first.play().catch(() => {});

    const warmStandbyVideo = () => {
      window.setTimeout(() => {
        primeVideo(second);
      }, 1200);
    };

    if (first.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      warmStandbyVideo();
    } else {
      first.addEventListener("playing", warmStandbyVideo, { once: true });
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;

      const current = videos[heroActiveVideoRef.current];
      if (current?.paused) {
        current.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      videos.forEach((video) => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.pause();
      });

      first.removeEventListener("playing", warmStandbyVideo);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (heroResetTimerRef.current !== null) {
        window.clearTimeout(heroResetTimerRef.current);
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#EAD7B7]">
      {/* ================= HERO ================= */}
      <section>
        <div className="macbook-home-hero relative min-h-[75vh] md:min-h-screen h-[75vh] md:h-screen overflow-hidden bg-black">
          {[0, 1].map((index) => (
            <video
              key={index}
              ref={(el) => {
                heroVideoRefs.current[index] = el;
              }}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-linear"
              style={{ opacity: index === 0 ? 1 : 0 }}
              autoPlay={index === 0}
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              aria-hidden="true"
            >
              {index === 0 ? (
                <source src={HERO_VIDEO_SRC} type={HERO_VIDEO_TYPE} />
              ) : null}
            </video>
          ))}
          {/* Layered gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-b from-amber-900/70 via-amber-900/40 to-black/80" />
          <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-transparent" />

          {/* Aboriginal waterhole — top right */}
          {/* <svg aria-hidden="true" viewBox="0 0 180 180" fill="none" className="absolute top-6 right-6 md:top-10 md:right-12 w-36 h-36 md:w-52 md:h-52 text-white opacity-[0.08] pointer-events-none">
            {[80,60,42,26,12].map((r, i) => (
              <circle key={r} cx="90" cy="90" r={r} stroke="currentColor" strokeWidth="1.3" strokeDasharray="4 3" opacity={1 - i * 0.15} />
            ))}
            <circle cx="90" cy="90" r="5" fill="currentColor" />
            {[[90,4],[90,176],[4,90],[176,90]].map(([cx,cy],i)=>(<circle key={i} cx={cx} cy={cy} r="3" fill="currentColor" />))}
            {[[90,22],[90,158],[22,90],[158,90]].map(([cx,cy],i)=>(<circle key={i} cx={cx} cy={cy} r="2" fill="currentColor" />))}
            {[[90,40],[90,140],[40,90],[140,90]].map(([cx,cy],i)=>(<circle key={i} cx={cx} cy={cy} r="2" fill="currentColor" />))}
            {[[32,32],[148,32],[32,148],[148,148]].map(([cx,cy],i)=>(<circle key={i} cx={cx} cy={cy} r="2" fill="currentColor" opacity="0.6" />))}
            {[[51,51],[129,51],[51,129],[129,129]].map(([cx,cy],i)=>(<circle key={i} cx={cx} cy={cy} r="1.5" fill="currentColor" opacity="0.5" />))}
          </svg> */}

          {/* Aboriginal spiral — bottom left */}
          {/* <svg aria-hidden="true" viewBox="0 0 120 120" fill="none" className="absolute bottom-20 left-4 md:bottom-28 md:left-10 w-24 h-24 md:w-36 md:h-36 text-amber-200 opacity-[0.10] pointer-events-none">
            <path d="M60,60 C65,60 70,55 70,50 C70,45 65,40 60,40 C50,40 40,50 40,60 C40,72 50,82 62,82 C76,82 90,70 90,56 C90,38 76,24 58,22 C36,20 18,38 18,60 C18,84 38,102 62,102" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="3 2" strokeLinecap="round" />
            <circle cx="60" cy="60" r="4" fill="currentColor" />
            {[{cx:70,cy:50},{cx:40,cy:60},{cx:62,cy:82},{cx:90,cy:56},{cx:18,cy:60},{cx:58,cy:22}].map((d,i)=>(<circle key={i} cx={d.cx} cy={d.cy} r="2" fill="currentColor" opacity="0.7" />))}
          </svg> */}

          {/* Dot field — scattered right side */}
          {/* <svg aria-hidden="true" viewBox="0 0 160 280" fill="none" className="absolute right-0 top-1/4 w-28 md:w-40 h-auto text-amber-100 opacity-[0.07] pointer-events-none">
            {[
              [20,20,3],[50,12,2],[80,28,2.5],[110,16,2],[140,30,3],
              [10,55,2],[45,48,2.5],[78,62,2],[105,50,2.5],[138,58,3],
              [25,88,2.5],[58,80,2],[90,95,3],[118,84,2],[148,92,2.5],
              [15,122,2],[52,115,2.5],[82,128,2],[112,118,3],[145,126,2],
              [30,158,3],[60,148,2],[92,162,2.5],[122,152,2],[150,160,2.5],
              [18,192,2],[55,185,3],[85,198,2],[116,188,2.5],[148,195,2],
            ].map(([cx,cy,r],i)=>(<circle key={i} cx={cx} cy={cy} r={r} fill="currentColor" />))}
          </svg> */}

          {/* Hero content */}
          <div className="macbook-home-hero-content relative z-10 flex flex-col justify-end md:justify-center min-h-[75vh] md:min-h-screen text-white px-6 sm:px-10 lg:px-24 pt-16 sm:pt-32 lg:pt-48 pb-10 sm:pb-12 lg:pb-20">
            {/* Animated badge */}
            {/* <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-300/40 bg-amber-900/30 backdrop-blur-sm text-amber-200 text-xs font-semibold tracking-[0.18em] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                Authentic Aboriginal Art &amp; Culture
              </span>
            </motion.div> */}

            {/* Headline */}
            <div className="overflow-hidden mb-1 md:mb-2">
              <motion.h1
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.75,
                  delay: 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="text-[2.25rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-7xl font-bold md:leading-[1.08] tracking-tight"
              >
                Discover the Spirit of
              </motion.h1>
            </div>
            <div className="overflow-hidden mb-5 md:mb-8">
              <motion.h1
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.75,
                  delay: 0.38,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="text-[2.25rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-7xl font-bold md:leading-[1.08] tracking-tight text-[#ead7b7]"
              >
                Arnhem Land
              </motion.h1>
            </div>

            {/* Description.. */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.58, ease: "easeOut" }}
              className="macbook-home-hero-copy text-sm sm:text-base lg:text-lg max-w-lg mb-10 leading-relaxed text-white/75"
            >
              Uncover authentic products and experiences that carry stories
              passed down through generations
            </motion.p>

            {/* CTA Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.74, ease: "easeOut" }}
              className="macbook-home-hero-actions flex flex-col sm:flex-row items-stretch sm:items-center w-full sm:w-auto gap-4 mb-4 md:mb-20"
            >
              <Link
                href="/about-us"
                className="group relative inline-flex justify-center items-center gap-2 px-8 py-4 sm:py-3.5 bg-[#5A1E12] hover:bg-[#7a2a1a] text-white font-semibold text-sm tracking-wide uppercase rounded-full transition-all duration-300 shadow-[0_8px_24px_rgba(90,30,18,0.45)] hover:shadow-[0_12px_32px_rgba(90,30,18,0.55)] hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
              >
                Explore More
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
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
              </Link>
              <Link
                href="/shop"
                className="inline-flex justify-center items-center gap-2 px-8 py-4 sm:py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/70 text-white/80 hover:text-white font-medium text-sm tracking-wide uppercase rounded-full backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
              >
                Shop Now
              </Link>
            </motion.div>

            {/* Stats strip */}
            {/* <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9, ease: "easeOut" }}
              className="flex flex-wrap items-center gap-6 sm:gap-10"
            >
              {[
                { value: "8,000+", label: "Happy Customers" },
                { value: "30,000+", label: "Products Listed" },
                { value: "100%", label: "Locally Operated" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  {i > 0 && <div className="hidden sm:block w-px h-8 bg-white/20" />}
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-amber-200 leading-none">{s.value}</p>
                    <p className="text-xs text-white/50 mt-0.5 tracking-wide">{s.label}</p>
                  </div>
                </div>
              ))}
            </motion.div> */}
          </div>

          {/* Scroll indicator */}
          {/* <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40"
          >
            <span className="text-[10px] tracking-[0.2em] uppercase font-medium">Scroll</span>
            <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
          </motion.div> */}
        </div>
      </section>

      {/* ================= FEATURES & SPONSOR CAROUSEL ================= */}

      <Sponsored />

      {/* Fetch the Product cards dynamically  */}
      <section
        id="featured-products"
        className="relative max-w-screen-2xl mx-auto py-10 sm:py-16 lg:py-20 sm:px-12 px-4 overflow-hidden"
      >
        {/* ── ABORIGINAL PATTERN: TOP-RIGHT ── */}
        <div
          className="absolute top-0 right-0 w-72 h-72 sm:w-96 sm:h-96 pointer-events-none opacity-[0.13]"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 380 380"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {[40, 80, 120, 160, 200, 240, 280, 330].map((r, i) => (
              <path
                key={r}
                d={`M ${380} ${380 - r} A ${r} ${r} 0 0 0 ${380 - r} ${380}`}
                stroke="#632013"
                strokeWidth={i % 2 === 0 ? 2.5 : 1.5}
                strokeLinecap="round"
              />
            ))}
            {Array.from({ length: 10 }).map((_, i) => {
              const angle = (Math.PI / 2) * (i / 9);
              const r = 60;
              const cx = 380 - r * Math.cos(angle);
              const cy = 380 - r * Math.sin(angle);
              return <circle key={i} cx={cx} cy={cy} r="4" fill="#803512" />;
            })}
            {Array.from({ length: 14 }).map((_, i) => {
              const angle = (Math.PI / 2) * (i / 13);
              const r = 140;
              const cx = 380 - r * Math.cos(angle);
              const cy = 380 - r * Math.sin(angle);
              return <circle key={i} cx={cx} cy={cy} r="3" fill="#632013" />;
            })}
            {Array.from({ length: 18 }).map((_, i) => {
              const angle = (Math.PI / 2) * (i / 17);
              const r = 220;
              const cx = 380 - r * Math.cos(angle);
              const cy = 380 - r * Math.sin(angle);
              return <circle key={i} cx={cx} cy={cy} r="2.5" fill="#a0451a" />;
            })}
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (Math.PI / 2) * ((i + 0.5) / 6);
              const r = 100;
              const cx = 380 - r * Math.cos(angle);
              const cy = 380 - r * Math.sin(angle);
              return (
                <g
                  key={i}
                  transform={`translate(${cx},${cy}) rotate(${(angle * 180) / Math.PI - 45})`}
                >
                  <line
                    x1="-5"
                    y1="0"
                    x2="5"
                    y2="0"
                    stroke="#632013"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="0"
                    y1="-5"
                    x2="0"
                    y2="5"
                    stroke="#632013"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* ── ABORIGINAL PATTERN: BOTTOM-LEFT ── */}
        <div
          className="absolute bottom-0 left-0 w-72 h-72 sm:w-96 sm:h-96 pointer-events-none opacity-[0.13]"
          aria-hidden="true"
        >
          {/* <svg viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {[0, 28, 56, 84, 112, 140, 168, 196].map((offset, i) => (
              <path
                key={offset}
                d={`M -20 ${320 - offset} C 40 ${310 - offset}, 90 ${330 - offset}, 150 ${318 - offset} S 240 ${305 - offset}, 300 ${320 - offset} S 370 ${330 - offset}, 410 ${318 - offset}`}
                stroke="#632013"
                strokeWidth={i % 3 === 0 ? 3 : 1.8}
                strokeLinecap="round"
              />
            ))}
            {[
              [30,295],[75,280],[130,300],[190,285],[250,295],[310,278],
              [55,265],[115,252],[175,268],[235,255],[295,265],
              [20,240],[80,228],[145,242],[210,230],[270,244],
              [50,215],[110,200],[170,216],[240,205],[300,218],
              [35,188],[100,175],[165,190],[225,178],[285,192],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={i % 4 === 0 ? 5 : 3} fill="#803512" />
            ))}
            {[[40,360],[90,355],[140,358]].map(([x, y], i) => (
              <path
                key={i}
                d={`M ${x - 12} ${y - 20} Q ${x} ${y + 8} ${x + 12} ${y - 20}`}
                stroke="#632013"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            ))}
          </svg> */}
        </div>

        <div>
          <div className="flex flex-col items-center text-center mb-6">
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-[#803512]/60 mb-3">
              Handpicked Collection
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-[#3a1208] leading-tight mb-3">
              Explore Our <span className="text-[#803512]">Products</span>
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="w-10 h-px bg-[#803512]/40" />
              <span className="w-2 h-2 rounded-full bg-[#803512]/50" />
              <span className="w-10 h-px bg-[#803512]/40" />
            </div>
          </div>

          {/* Navigation Buttons placed at top to avoid overlap */}
          <div className="flex justify-end gap-3 mb-4 pr-1 md:pr-4">
            <button
              onClick={() => scrollProductByOne(-1)}
              className="bg-[#5A1E12] hover:bg-[#7a2a1a] text-white p-2 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer disabled:opacity-50"
              aria-label="Previous products"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 md:h-6 w-5 md:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => scrollProductByOne(1)}
              className="bg-[#5A1E12] hover:bg-[#7a2a1a] text-white p-2 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer disabled:opacity-50"
              aria-label="Next products"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 md:h-6 w-5 md:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Product Carousel */}
          <div className="relative">
            {/* Scrollable Cards */}
            <div
              ref={productScrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory gap-3 sm:gap-4 lg:gap-6 pb-4 scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {productsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="shrink-0 snap-start snap-always w-[calc(100%-1px)] sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] rounded-xl border border-stone-100 shadow-sm overflow-hidden bg-white flex flex-col"
                  >
                    {/* ── IMAGE SECTION ── */}
                    <div className="relative aspect-6/4 overflow-hidden bg-[#EAD7B7]/30">
                      {/* Shimmer overlay */}
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-linear-to-r from-transparent via-white/60 to-transparent" />
                      {/* Logo placeholder top-left */}
                      <div className="absolute top-3 left-3 w-10 h-10 rounded-lg bg-[#EAD7B7]/80" />
                      {/* Low-stock badge placeholder top-right */}
                      <div className="absolute top-3 right-3 w-16 h-5 rounded-full bg-[#EAD7B7]/60" />
                    </div>

                    {/* ── DETAILS SECTION ── */}
                    <div className="flex flex-col grow p-4 bg-white gap-y-3">
                      {/* Artist label + stars */}
                      <div className="flex justify-between items-center">
                        <div className="h-2.5 w-20 rounded-full bg-stone-200 relative overflow-hidden">
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-linear-to-r from-transparent via-white/70 to-transparent" />
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <div
                              key={j}
                              className="h-3 w-3 rounded-sm bg-stone-200 relative overflow-hidden"
                            >
                              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-linear-to-r from-transparent via-white/70 to-transparent" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Title lines */}
                      <div className="space-y-1.5">
                        <div className="h-4 w-4/5 rounded-full bg-stone-200 relative overflow-hidden">
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-linear-to-r from-transparent via-white/70 to-transparent" />
                        </div>
                        <div className="h-4 w-2/5 rounded-full bg-stone-200 relative overflow-hidden">
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-linear-to-r from-transparent via-white/70 to-transparent" />
                        </div>
                      </div>

                      {/* Description lines */}
                      <div className="space-y-1.5">
                        <div className="h-3 w-full rounded-full bg-stone-200 relative overflow-hidden">
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-linear-to-r from-transparent via-white/70 to-transparent" />
                        </div>
                        <div className="h-3 w-3/4 rounded-full bg-stone-200 relative overflow-hidden">
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-linear-to-r from-transparent via-white/70 to-transparent" />
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex gap-1.5">
                        <div className="h-5 w-14 rounded-sm bg-[#EAD7B7]/70 relative overflow-hidden">
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-linear-to-r from-transparent via-white/70 to-transparent" />
                        </div>
                        <div className="h-5 w-16 rounded-sm bg-[#EAD7B7]/70 relative overflow-hidden">
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-linear-to-r from-transparent via-white/70 to-transparent" />
                        </div>
                      </div>

                      {/* Footer: price + buttons */}
                      <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between">
                        <div className="space-y-1.5">
                          <div className="h-2.5 w-8 rounded-full bg-stone-200 relative overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-linear-to-r from-transparent via-white/70 to-transparent" />
                          </div>
                          <div className="h-5 w-16 rounded-full bg-stone-200 relative overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-linear-to-r from-transparent via-white/70 to-transparent" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-9 w-9 rounded-full bg-[#EAD7B7]/70 relative overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-linear-to-r from-transparent via-white/70 to-transparent" />
                          </div>
                          <div className="h-10 w-24 rounded-full bg-[#973c00]/20 relative overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-linear-to-r from-transparent via-white/50 to-transparent" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : limitedProducts.length === 0 ? (
                <div className="w-full text-center py-12">
                  <p className="text-[#3a1208] font-semibold text-lg mb-1">
                    Coming Soon
                  </p>
                  <p className="text-[#803512]/60 text-sm">
                    Our Products are coming soon. Stay tuned!
                  </p>
                </div>
              ) : (
                limitedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="shrink-0 snap-start snap-always w-[calc(100%-1px)] sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)]"
                  >
                    <OptimisticProductCard
                      id={product.id}
                      photo={
                        product.featuredImage ||
                        product.images?.[0] ||
                        "/images/placeholder.png"
                      }
                      name={product.title || "Untitled"}
                      description={product.description || ""}
                      amount={parseFloat(product.price || "0")}
                      displayPrice={product.price || undefined}
                      stock={product.stock}
                      slug={product.slug}
                      rating={product.rating}
                      tags={product.tags}
                      featured={product.featured}
                      artistName={product.artistName}
                      productType={product.productType || product.type}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-center mt-10">
            <Link
              href="/shop"
              className="px-8 py-2.5 bg-[#5A1E12] text-white rounded-full hover:bg-[#7a2a1a] transition-all font-semibold text-sm tracking-wide"
            >
              View All
            </Link>
          </div>
        </div>
      </section>

      {/* ================= SPLIT EXPLORE STRIP ================= */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-70 lg:min-h-64 overflow-hidden">
        {/* ── LEFT: Register as Seller ── */}
        <Link
          href="/sellerOnboarding"
          className="group relative flex flex-col justify-between p-6 md:p-8 bg-[#3a1208] overflow-hidden cursor-pointer"
        >
          {/* Animated dot-grid background */}
          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.12]"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern
                id="dots-left"
                x="0"
                y="0"
                width="28"
                height="28"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1.5" fill="#EAD7B7" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots-left)" />
          </svg>

          {/* Animated scan line */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-amber-400/60 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-amber-400/40 to-transparent translate-x-full group-hover:-translate-x-full transition-transform duration-700 ease-in-out delay-100" />
          {/* Vertical scan line */}
          <div className="absolute top-0 right-0 w-0.5 h-full bg-linear-to-b from-transparent via-amber-400/30 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-700 ease-in-out delay-200" />

          {/* Corner bracket top-left */}
          <div className="relative z-10 flex items-start justify-between mb-auto">
            <div className="flex flex-col gap-1">
              <div className="w-8 h-0.5 bg-[#ead7b7]/60" />
              <div className="w-0.5 h-8 bg-[#ead7b7]/60" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#ead7b7]/50 mt-1">
              01 / Sell
            </span>
          </div>

          {/* Text block */}
          <div className="relative z-10 mt-4">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#ead7b7]/70 mb-2">
              Join Our Community
            </p>
            <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2 group-hover:text-amber-100 transition-colors duration-300">
              Become a
              <br />
              <span className="text-[#ead7b7]">Seller</span>
            </h3>
            <p className="text-sm text-white/50 max-w-xs leading-relaxed mb-4">
              Share your authentic art and crafts with a global audience. Join
              our community of artists and creators.
            </p>
            <div className="inline-flex items-center gap-3 text-[#ead7b7] text-sm font-semibold tracking-wide uppercase">
              <span className="w-8 h-px bg-[#ead7b7]/60 group-hover:w-14 transition-all duration-400" />
              Register Now
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
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
            </div>
          </div>

          {/* Corner bracket bottom-right */}
          <div className="absolute bottom-4 right-4 flex flex-col items-end gap-1 opacity-40">
            <div className="w-0.5 h-8 bg-[#ead7b7]" />
            <div className="w-8 h-0.5 bg-[#ead7b7]" />
          </div>
        </Link>

        {/* ── RIGHT: Explore Blog ── */}
        <Link
          href="/blog"
          className="group relative flex flex-col justify-between p-6 md:p-8 bg-[#803512] overflow-hidden cursor-pointer"
        >
          {/* Animated dot-grid background */}
          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.10]"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern
                id="dots-right"
                x="0"
                y="0"
                width="28"
                height="28"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1.5" fill="#fff" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots-right)" />
          </svg>

          {/* Aboriginal concentric ring — top right watermark */}
          <svg
            aria-hidden="true"
            viewBox="0 0 160 160"
            fill="none"
            className="absolute -top-6 -right-6 w-40 h-40 text-white opacity-[0.07] pointer-events-none"
          >
            {[72, 54, 38, 24, 11].map((r, i) => (
              <circle
                key={r}
                cx="80"
                cy="80"
                r={r}
                stroke="currentColor"
                strokeWidth="1.4"
                strokeDasharray="4 3"
                opacity={1 - i * 0.15}
              />
            ))}
            <circle cx="80" cy="80" r="5" fill="currentColor" />
            {[
              [80, 2],
              [80, 158],
              [2, 80],
              [158, 80],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="3" fill="currentColor" />
            ))}
            {[
              [80, 18],
              [80, 142],
              [18, 80],
              [142, 80],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="2" fill="currentColor" />
            ))}
          </svg>

          {/* Animated scan line */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-orange-200/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-orange-200/40 to-transparent translate-x-full group-hover:-translate-x-full transition-transform duration-700 ease-in-out delay-100" />
          <div className="absolute top-0 left-0 w-0.5 h-full bg-linear-to-b from-transparent via-orange-200/30 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-700 ease-in-out delay-200" />

          {/* Corner bracket top-right */}
          <div className="relative z-10 flex items-start justify-between mb-auto">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-orange-200/50 mt-1">
              02 / Blog
            </span>
            <div className="flex flex-col items-end gap-1">
              <div className="w-8 h-0.5 bg-orange-200/60" />
              <div className="w-0.5 h-8 bg-orange-200/60 self-end" />
            </div>
          </div>

          {/* Text block */}
          <div className="relative z-10 mt-4">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-orange-200/60 mb-2">
              Stories & Insights
            </p>
            <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2 group-hover:text-orange-100 transition-colors duration-300">
              Read Our
              <br />
              <span className="text-orange-200">Blog</span>
            </h3>
            <p className="text-sm text-white/50 max-w-xs leading-relaxed mb-4">
              Discover stories, cultural insights, artist features, and the
              latest news from our Aboriginal art community.
            </p>
            <div className="inline-flex items-center gap-3 text-orange-200 text-sm font-semibold tracking-wide uppercase">
              <span className="w-8 h-px bg-orange-300/60 group-hover:w-14 transition-all duration-400" />
              Read Articles
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
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
            </div>
          </div>

          {/* Corner bracket bottom-left */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-1 opacity-40">
            <div className="w-0.5 h-8 bg-orange-200" />
            <div className="w-8 h-0.5 bg-orange-200" />
          </div>
        </Link>
      </section>

      {/* STATIC VIDEO SECTION */}
      <section className="relative mx-auto sm:px-12 px-4 bg-[url('/images/about-pattern2.jpg')] bg-cover bg-center pt-12 sm:pt-22 pb-14 sm:pb-28">
        <div className="absolute inset-0 bg-white/80" />
        <div className="relative z-10 max-w-screen-2xl mx-auto flex flex-col justify-center items-center text-center">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#803512]/60 mb-3">
            Experience the Land
          </p>
          <h2 className="font-bold text-3xl sm:text-4xl lg:text-5xl max-w-3xl mb-4 leading-[1.1] tracking-tight text-[#3a1208]">
            Journey through the heart of{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#803512]">Arnhem Land.</span>
              <span className="absolute left-0 bottom-0 w-full h-1.5 bg-[#803512]/15 rounded-full z-0" />
            </span>
          </h2>
          <p className="text-sm text-[#803512]/55 max-w-xl mb-10 leading-relaxed">
            Immerse yourself in the world's oldest living culture — ancient
            stories, sacred land, and timeless art.
          </p>
          <div className="relative max-w-5xl w-full sm:h-120 h-48 rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              src="https://www.youtube.com/embed/5Szjemb24QA?si=JsPlufnKMBD809G5"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
        </div>
      </section>

      {/* ================= BLOG SECTION ================= */}
      <section className="bg-[#EAD7B7] py-12 sm:py-16 md:py-28 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-8 sm:mb-14">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-[#803512]/60 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#803512] animate-pulse" />
                From the Journal
              </span>
              <h2 className="text-4xl sm:text-5xl font-black leading-[1.1] tracking-tight text-[#3a1208]">
                Latest{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#803512]">Stories</span>
                  <span className="absolute left-0 -bottom-1 w-full h-0.75 rounded-full bg-[#803512]/25" />
                </span>
              </h2>
            </div>
            <Link
              href="/blog"
              className="shrink-0 inline-flex items-center gap-2 font-semibold underline underline-offset-4 text-[#803512] hover:text-[#5A1E12] transition-colors group"
            >
              View all posts
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
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogsLoading ? (
              // Blog loading skeletons
              [...Array(3)].map((_, i) => (
                <article
                  key={i}
                  className="flex flex-col bg-white border border-[#e8d5c0] rounded-2xl overflow-hidden shadow-sm animate-pulse"
                >
                  {/* Image skeleton */}
                  <div className="relative w-full aspect-video overflow-hidden bg-[#F4E9DC]">
                    <div className="w-full h-full bg-linear-to-r from-[#F4E9DC] via-[#e8d5c0] to-[#F4E9DC] bg-size-[200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                    <div className="absolute top-3 right-3">
                      <div className="w-20 h-6 rounded-full bg-[#e8d5c0]" />
                    </div>
                  </div>

                  {/* Content skeleton */}
                  <div className="flex flex-col flex-1 p-6">
                    {/* Tags skeleton */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <div className="w-16 h-5 rounded-full bg-[#F4E9DC]" />
                      <div className="w-12 h-5 rounded-full bg-[#F4E9DC]" />
                    </div>

                    {/* Title skeleton */}
                    <div className="space-y-2 mb-3">
                      <div className="w-full h-5 rounded bg-[#F4E9DC]" />
                      <div className="w-3/4 h-5 rounded bg-[#F4E9DC]" />
                    </div>

                    {/* Excerpt skeleton */}
                    <div className="space-y-2 flex-1 mb-5">
                      <div className="w-full h-4 rounded bg-[#F4E9DC]" />
                      <div className="w-full h-4 rounded bg-[#F4E9DC]" />
                      <div className="w-2/3 h-4 rounded bg-[#F4E9DC]" />
                    </div>

                    {/* CTA skeleton */}
                    <div className="pt-4 border-t border-[#e8d5c0]">
                      <div className="w-24 h-4 rounded bg-[#F4E9DC]" />
                    </div>
                  </div>
                </article>
              ))
            ) : blogsError ? (
              // Error state
              <div className="col-span-full text-center py-8">
                <p className="text-[#803512] font-semibold mb-2">
                  Unable to load blog posts
                </p>
                <p className="text-[#803512]/60 text-sm">{blogsError}</p>
              </div>
            ) : blogPosts.length === 0 ? (
              // No posts state
              <div className="col-span-full text-center py-10">
                <p className="text-[#803512] font-semibold text-lg mb-1">
                  Coming Soon
                </p>
                <p className="text-[#803512]/60 text-sm">
                  Stories and insights from Arnhem Land are on their way. Stay
                  tuned!
                </p>
              </div>
            ) : (
              // Actual blog posts
              blogPosts.map((post, index) => (
                <article
                  key={`${post.href}-${index}`}
                  className="group flex flex-col bg-white border border-[#e8d5c0] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative w-full aspect-video overflow-hidden bg-[#F4E9DC]">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/default-blog.jpg";
                      }}
                    />
                    {/* Read time pill — top right */}
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
                  <div className="flex flex-col flex-1 p-6">
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
                    <h3 className="text-lg font-bold text-[#1a0a06] leading-snug mb-3 group-hover:text-[#803512] transition-colors duration-200 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-5 line-clamp-4">
                      {post.excerpt}
                    </p>

                    {/* CTA */}
                    <div className="pt-4 border-t border-[#e8d5c0]">
                      <Link
                        href={post.href}
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
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Page;
// added url
