"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { FaArrowUp } from "react-icons/fa";
import { createPortal } from "react-dom";

export default function ScrollToTop() {
  const pathname = usePathname();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isNearFooter, setIsNearFooter] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  useEffect(() => {
    if (!mounted) return;

    const footer = document.querySelector("footer");
    if (!footer) {
      setIsNearFooter(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsNearFooter(entry.isIntersecting);
      },
      {
        threshold: 0.02,
      }
    );

    observer.observe(footer);

    return () => {
      observer.disconnect();
    };
  }, [mounted, pathname]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const hiddenPaths = ["/cart", "/checkout", "/shop/cart/checkout", "/guest/track-order"];
  if (hiddenPaths.includes(pathname)) return null;
  if (!mounted || !showScrollTop) return null;

  return createPortal(
    <button
      onClick={scrollToTop}
      className={`fixed ${isNearFooter ? "bottom-24 md:bottom-20 lg:bottom-12" : "bottom-6 md:bottom-6"} right-4 md:right-6 z-50 bg-[#5A1E12] hover:bg-[#4a180f] text-[#EAD7B7] p-3 md:p-4 rounded-full shadow-[0_8px_32px_rgba(90,30,18,0.25)] hover:shadow-[0_12px_40px_rgba(90,30,18,0.35)] transform hover:scale-110 transition-all duration-300 ease-in-out group border-2 border-[#EAD7B7]/20 backdrop-blur-sm`}
      aria-label="Scroll to top"
    >
      <FaArrowUp className="w-5 h-5 group-hover:animate-bounce group-hover:scale-110 transition-transform duration-200" />
    </button>,
    document.body
  );
}