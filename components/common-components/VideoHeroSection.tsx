"use client";
import React from "react";

interface VideoHeroSectionProps {
  /** Tailwind height / min-height classes, e.g. "min-h-[70vh]" */
  className?: string;
  children?: React.ReactNode;
}

/**
 * Reusable animated-video hero background.
 * Renders /home-video.mp4 as a looping background with the same
 * layered gradient overlays used on the home page hero.
 */
export default function VideoHeroSection({
  className = "min-h-[70vh]",
  children,
}: VideoHeroSectionProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src="/home-video.mp4" type="video/mp4" />
      </video>

      {/* Layered gradient overlays (same as home page hero) */}
      <div className="absolute inset-0 bg-linear-to-b from-amber-900/70 via-amber-900/40 to-black/80" />
      <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-transparent" />

      {children}
    </div>
  );
}
