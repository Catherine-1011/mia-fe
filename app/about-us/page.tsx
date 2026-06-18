"use client";
import React from "react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import VideoHeroSection from "@/components/common-components/VideoHeroSection";

// ── Animated counter ──────────────────────────────────────────────────────────
type CounterProps = { end: number; suffix?: string };

function Counter({ end, suffix = "" }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const steps = 60;
          const increment = end / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, 2000 / steps);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ── Stats data ────────────────────────────────────────────────────────────────
const STATS = [
  {
    end: 7,
    suffix: "+",
    label: "Happy Customers",
    desc: "Customers who trust us and return for our quality products and service.",
  },
  {
    end: 11,
    suffix: "+",
    label: "Orders Delivered",
    desc: "Orders shipped across Australia with care, speed, and reliability.",
  },
  {
    end: 17,
    suffix: "+",
    label: "Products Listed",
    desc: "A curated catalogue spanning hundreds of categories and brands.",
  },
  {
    end: 8,
    suffix: "+",
    label: "Community Members",
    desc: "A growing community of shoppers who share our passion for quality.",
  },
];

// ── Values data ───────────────────────────────────────────────────────────────
const VALUES = [
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    title: "Authenticity & background ",
    desc: "We celebrate work made in Arnhem Land and are upfront about where products come from.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
    ),
    title: "Fairness & transparency ",
    desc: "One clear commission, no hidden costs, and honest pricing for buyers and makers alike. ",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    title: "Community & culture ",
    desc: "Every sale supports First Nations livelihoods and helps keep living culture strong.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    title: "Care & reliability",
    desc: "From checkout to doorstep, we obsess over getting your order to you and keeping you informed.",
  },
];

// ── Team / Leadership data ───────────────────────────────────────────────────
const TEAM = [
  {
    name: "James Wurramara",
    role: "Chief Executive Officer",
    bio: "A proud Yolŋu man from Arnhem Land, James leads Made in Arnhem Land's mission to bring authentic Aboriginal commerce to the world.",
    initials: "JW",
    image: "/images/team/james.jpg",
    accent: "#5A1E12",
  },
  {
    name: "Sarah Dhurrkay",
    role: "Head of Marketplace",
    bio: "With over a decade in e-commerce, Sarah ensures every seller and product meets Made in Arnhem Land`'s strict quality standards.",
    initials: "SD",
    image: "/images/team/sarah.jpg",
    accent: "#803512",
  },
  {
    name: "Tom Ganambarr",
    role: "Director of Culture & Partnerships",
    bio: "Tom bridges the gap between traditional Yolŋu knowledge and the modern digital economy, forging meaningful partnerships.",
    initials: "TG",
    image: "/images/team/tom.jpg",
    accent: "#632013",
  },
  {
    name: "Emily Munuŋgurr",
    role: "Head of Community",
    bio: "Emily champions the voices of Aboriginal artisans and communities, ensuring Made in Arnhem Land always stays rooted in culture.",
    initials: "EM",
    image: "/images/team/emily.jpg",
    accent: "#5A1E12",
  },
];

export default function Page() {
  return (
    <main className="bg-white text-gray-900 overflow-x-hidden">
      {/* ══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════ */}
      <VideoHeroSection className="macbook-about-hero h-[65vh] sm:h-[70vh] md:h-[75vh] lg:h-[75vh] xl:h-[93vh] flex items-center justify-center">
        <div className="macbook-about-hero-content relative mt-8 sm:mt-12 md:mt-16 z-10 text-white text-center px-4 max-w-275 mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-xs font-semibold tracking-[0.3em] uppercase text-white/60 mb-3 sm:mb-4"
          >
            Our Story
          </motion.p>

          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.75,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight"
            ></motion.h1>
              Real makers <span className="text-[#e5d3b3]">Real Country.</span>
            <motion.h1
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.75,
                delay: 0.38,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight"
            >
              One Marketplace.
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.58, ease: "easeOut" }}
            className="text-sm sm:text-base lg:text-lg text-white/75 max-w-xl mx-auto leading-relaxed"
          >
            Made in Arnhem Land brings the art and craft of Arnhem Land’s First
            Nations makers to the global platform. Sold directly by the people
            who create them.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.74, ease: "easeOut" }}
            className="mt-6 sm:mt-8 lg:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            <Link
              href="/shop"
              className="px-6 sm:px-7 py-2.5 sm:py-3 bg-[#5A1E12] hover:bg-[#441208] text-white rounded-full text-sm font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Shop Now
            </Link>
            <a
              href="#our-story"
              className="px-6 sm:px-7 py-2.5 sm:py-3 border border-white/40 hover:border-white text-white rounded-full text-sm font-semibold transition-all"
            >
              Learn More ↓
            </a>
          </motion.div>
        </div>
      </VideoHeroSection>

      {/* ══════════════════════════════════════════════════
          MISSION STRIP
      ══════════════════════════════════════════════════ */}
      <section className="bg-[#5A1E12] py-5 px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 max-w-4xl mx-auto">
          <span className="flex items-center gap-2 text-white/80 text-sm font-medium tracking-wide">
            <svg
              className="w-4 h-4 text-white shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
            Locally sourced
          </span>
          <span className="text-white/30 hidden sm:inline">·</span>
          <span className="flex items-center gap-2 text-white/80 text-sm font-medium tracking-wide">
            <svg
              className="w-4 h-4 text-white shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
              />
            </svg>
            Fast Australia-wide delivery
          </span>
          <span className="text-white/30 hidden sm:inline">·</span>
          <span className="flex items-center gap-2 text-white/80 text-sm font-medium tracking-wide">
            <svg
              className="w-4 h-4 text-white shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354l-4.543 2.826c-.998.608-2.231-.29-1.96-1.425l1.257-5.273L2.637 10.955c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.006z" />
            </svg>
            Trusted by our customers
          </span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          OUR STORY
      ══════════════════════════════════════════════════ */}
      <section id="our-story" className="py-14 md:py-28 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 md:gap-12 items-start lg:items-center">
          {/* Image */}
          <div className="w-full lg:w-3/5">
            <Image
              src="/images/about2.png"
              alt="Our story"
              width={800}
              height={600}
              className="w-full h-auto"
            />
          </div>

          {/* Text */}
          <div className="w-full lg:w-2/5">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#5A1E12] mb-3">
              Who We Are
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-snug mb-4 md:mb-5">
              A marketplace built on{" "}
              <span className="text-[#5A1E12]">
                {" "}
                culture, not just commerce.
              </span>
            </h2>
            <p className="text-gray-500 leading-relaxed mb-4 text-[15px] md:text-base">
              Made in Arnhem Land is an online marketplace dedicated to the
              artists, makers, and producers of Arnhem Land. Every product is
              created on Country and shared with community consent, connecting
              you directly with the people and stories behind the work, and
              giving makers a fair, direct route to market.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F4E9DC] flex items-center justify-center text-[#5A1E12] shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Made on Country &middot; Shared with community consent
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════════ */}
      {/* <section className="bg-[#F4E9DC] py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#5A1E12] mb-2">
              By The Numbers
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">
              Growing every day.
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e8d5c0] text-center"
              >
                <p className="text-3xl md:text-4xl font-black text-[#5A1E12] mb-1">
                  <Counter end={s.end} suffix={s.suffix} />
                </p>
                <p className="font-semibold text-sm mb-2">{s.label}</p>
                <p className="text-xs text-gray-400 leading-relaxed hidden md:block">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      <section className="bg-[#F4E9DC] py-16 md:py-24 px-4 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-[#5A1E12]/5" />
        <div className="absolute -bottom-12 -right-8 w-52 h-52 rounded-full bg-[#5A1E12]/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#5A1E12]/3" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#5A1E12] mb-2">
              By The Numbers
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">
              Growing every day.
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`rounded-2xl p-6 md:p-8 text-center transition-transform hover:-translate-y-1 duration-300 ${
                  i === 1 || i === 2
                    ? "bg-[#5A1E12] border border-[#5A1E12]"
                    : "bg-white border border-[#e8d5c0] shadow-sm"
                }`}
              >
                <p
                  className={`text-2xl md:text-3xl font-black mb-1 ${
                    i === 1 || i === 2 ? "text-white" : "text-[#5A1E12]"
                  }`}
                >
                  <Counter end={s.end} suffix={s.suffix} />
                </p>
                <p
                  className={`font-semibold text-sm mb-2 ${
                    i === 1 || i === 2 ? "text-white/80" : "text-gray-800"
                  }`}
                >
                  {s.label}
                </p>
                <div
                  className={`h-0.5 w-6 rounded-full mx-auto mb-2 ${
                    i === 1 || i === 2 ? "bg-white/30" : "bg-[#5A1E12]/30"
                  }`}
                />
                <p
                  className={`text-xs leading-relaxed hidden md:block ${
                    i === 1 || i === 2 ? "text-white/60" : "text-gray-400"
                  }`}
                >
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          WHAT WE OFFER  (two-column challenge section)
      ══════════════════════════════════════════════════ */}
      <section className="bg-white bg-[url('/images/about-pattern1.png')] bg-cover bg-center py-20 md:py-28 px-4 text-[#1a0a06]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-12 xl:gap-20 items-start">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#5A1E12] mb-3">
              What we offer
            </p>
            <h2 className="text-4xl md:text-5xl xl:text-6xl font-bold text-[#3a1208] leading-[1.05] mb-8">
              One place.
              <br />
              Every <span className="text-[#803512]">story.</span>
            </h2>
            <p className="text-base leading-[1.75] text-[#7a6558] border-l-2 border-[#C47A5A] pl-5 max-w-xl">
              A marketplace where culture, authenticity, and trust come together
              in one seamless experience.
            </p>
          </div>

          <div className="flex flex-col">
            <div className="flex items-start gap-5 py-7 border-y border-[#e8d5c0]">
              <p className="text-xs font-medium text-[#C47A5A] min-w-7 pt-1">
                01
              </p>
              <div>
                <h3 className="text-base font-semibold text-[#1a0a06] mb-1.5">
                  Genuinely Arnhem Land–made
                </h3>

                <p className="text-[13px] leading-[1.65] text-[#7a6558]">
                  Every maker lists under our 100% Made in Arnhem Land promise,
                  attesting that their work is created in the region. It’s the
                  standard our sellers commit to, so you can shop with
                  confidence in where each product comes from.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-5 py-7 border-b border-[#e8d5c0]">
              <p className="text-xs font-medium text-[#C47A5A] min-w-7 pt-1">
                02
              </p>
              <div>
                <h3 className="text-base font-semibold text-[#1a0a06] mb-1.5">
                  Direct from the maker
                </h3>
                <p className="text-[13px] leading-[1.65] text-[#7a6558]">
                  You buy directly from the artists and producers behind each
                  piece, supporting their work and communities.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-5 py-7 border-b border-[#e8d5c0]">
              <p className="text-xs font-medium text-[#C47A5A] min-w-7 pt-1">
                03
              </p>
              <div>
                <h3 className="text-base font-semibold text-[#1a0a06] mb-1.5">
                  Support for sellers
                </h3>
                <p className="text-[13px] leading-[1.65] text-[#7a6558]">
                  We give makers the tools, guidance, and support to sell online
                  with confidence, many for the first time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          OUR VALUES
      ══════════════════════════════════════════════════ */}
      <section className="bg-[#F4E9DC] bg-[url('/images/about-pattern4.png')] bg-cover bg-center bg-no-repeat bg-blend-soft-light py-20 md:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-14">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#5A1E12] mb-2">
              Our Values
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">
              What drives us forward.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="bg-white rounded-2xl p-6 border border-[#e8d5c0] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-11 h-11 rounded-xl bg-[#5A1E12]/10 flex items-center justify-center text-[#5A1E12] mb-4">
                  {v.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          LEADERSHIP
      ══════════════════════════════════════════════════ */}

      {/* ══════════════════════════════════════════════════
          IMAGE + COPY  (What We Offer detail row)
      ══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 px-4 bg-gray-100 ">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">
          <div>
            <span className="inline-flex items-center gap-2  text-[#5A1E12] text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-5">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl xl:text-5xl font-black leading-[1.1] tracking-tight mb-5">
              Shopping with{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-[#5A1E12]">meaning.</span>
                <span className="absolute left-0 -bottom-1 w-full h-0.75 rounded-full bg-[#5A1E12]/30" />
              </span>
            </h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              Every purchase supports a maker, a community, and a culture.
            </p>
            {/* <p className="text-gray-500 leading-relaxed mb-8">
              Whether you&apos;re buying for yourself or gifting someone you
              love, Alpa is built to make it easy, enjoyable, and reliable —
              every single time.
            </p> */}
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#5A1E12] hover:bg-[#441208] text-white rounded-full py-3 px-8 text-sm font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Explore Our Shop
              <svg
                className="w-4 h-4"
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

          {/* Image */}
          <div className="relative">
            <div className="absolute -bottom-4 -right-4 w-full h-full rounded-2xl bg-[#5A1E12]/8 -z-10" />
            <Image
              src="/images/about-us-what-we-offer.jpg"
              alt="What we offer"
              width={800}
              height={600}
              className="w-full h-80 md:h-115 object-cover rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </section>

      <section className="bg-[#F4E9DC] py-16 md:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#5a1e12] mb-3">
            Sell With Us
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Are you a maker in Arnhem Land?
          </h2>
          <p className="max-w-2xl mx-auto text-grey-500 leading-relaxed mb-8">
            Join a marketplace built for you. You set your products and prices;
            we handle the rest so you can focus on your craft.
          </p>
          <Link
            href="/sellerOnboarding"
            className="inline-flex items-center justify-center rounded-full bg-[#5A1E12] hover:bg-[#441208] text-white px-8 py-3 text-sm font-bold  shadow-md transition-all hover:shadow-lg"
          >
            Register as a Seller
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════════ */}
      {/* <section className="bg-[#5A1E12] py-16 md:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to start shopping?
          </h2>
          <p className="text-white/65 text-base mb-8 leading-relaxed">
            Join thousands of Australians who trust Alpa for quality products,
            fast delivery, and genuine service.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/shop"
              className="px-8 py-3 bg-white text-[#5A1E12] hover:bg-[#F4E9DC] rounded-full text-sm font-bold transition-all shadow-md"
            >
              Shop Now
            </Link>
            <Link
              href="/contact-us"
              className="px-8 py-3 border border-white/40 hover:border-white text-white rounded-full text-sm font-semibold transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section> */}

      {/* Certifications & Recognition */}
      {/* ══════════════════════════════════════════════════
    CERTIFICATIONS & RECOGNITION
══════════════════════════════════════════════════ */}
      {/* ══════════════════════════════════════════════════
    CERTIFICATIONS & RECOGNITION
══════════════════════════════════════════════════ */}
      {/*
<section className="bg-[#f4e9dc] py-12 sm:py-16 md:py-20 lg:py-28 px-3 sm:px-4 border-t border-[#e8d5c0]">
  <div className="max-w-5xl mx-auto">

    <div className="text-center mb-8 sm:mb-10 md:mb-14">
      <p className="text-xs font-bold tracking-[0.28em] uppercase text-[#5A1E12] mb-2 sm:mb-3">
        Recognition & Trust
      </p>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a0a06] mb-3 sm:mb-4 px-2">
        Certifications & Recognition
      </h2>
      <p className="text-[#7a6558] text-xs sm:text-sm md:text-base leading-relaxed px-2">
        Our commitment to quality and authenticity is recognized by leading organizations.
      </p>
    </div>

    <div className="grid grid-cols-2 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {[
        { badge: "Certified", name: "Cultural Heritage Certified", org: "Aboriginal Heritage Council",
          icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /> },
        { badge: "Gold Standard", name: "Eco-Tourism Gold Standard", org: "Sustainable Tourism Australia",
          icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
        { badge: "Listed", name: "Indigenous Business Directory", org: "Supply Nation",
          icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /> },
        { badge: "Approved", name: "Fair Trade Approved", org: "Fair Trade Australia",
          icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /> },
      ].map((cert) => (
        <div key={cert.name}
          className="group relative bg-white border border-[#e8d5c0] hover:border-[#c8856a] hover:shadow-[0_8px_28px_rgba(90,30,18,0.10)] hover:-translate-y-1 transition-all duration-300 rounded-2xl sm:rounded-[18px] p-4 sm:p-5 md:p-7 text-center overflow-hidden"
        >
    
          <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-linear-to-r from-[#5A1E12] to-[#c8856a] rounded-b-2xl sm:rounded-b-[18px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-13 md:h-13 rounded-xl sm:rounded-[14px] bg-[#F4E9DC] border border-[#e8d5c0] flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#5A1E12]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {cert.icon}
            </svg>
          </div>

          <span className="inline-block text-[9px] sm:text-[10px] font-bold tracking-[0.14em] uppercase text-[#5A1E12] bg-[#F4E9DC] border border-[#e8d5c0] rounded-full px-2 sm:px-3 py-0.5 sm:py-1 mb-2 sm:mb-3">
            {cert.badge}
          </span>
          <p className="text-xs sm:text-[13px] font-semibold text-[#1a0a06] leading-tight sm:leading-snug mb-1 sm:mb-1.5">{cert.name}</p>
          <p className="text-[10px] sm:text-[11.5px] text-[#a08070] leading-relaxed">{cert.org}</p>
        </div>
      ))}
    </div>

    <div className="flex items-center gap-2 sm:gap-3 max-w-xs mx-auto mt-8 sm:mt-10 md:mt-14 px-4">
      <div className="flex-1 h-px bg-[#e8d5c0]" />
      <span className="text-[9px] sm:text-[10.5px] tracking-[0.13em] uppercase text-[#b09080] whitespace-nowrap">
        Verified & Trusted
      </span>
      <div className="flex-1 h-px bg-[#e8d5c0]" />
    </div>

  </div>
</section> */}
    </main>
  );
}
