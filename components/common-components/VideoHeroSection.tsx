"use client";

import React, { useRef, useState } from "react";

interface VideoHeroSectionProps {
  className?: string;
  children?: React.ReactNode;
}

export default function VideoHeroSection({
  className = "min-h-[70vh]",
  children,
}: VideoHeroSectionProps) {
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const [activeVideo, setActiveVideo] = useState(0);
  const isSwitchingRef = useRef(false);

  const handleVideoTimeUpdate = (index: number) => {
    const currentVideo = videoRefs.current[index];
    const nextIndex = index === 0 ? 1 : 0;
    const nextVideo = videoRefs.current[nextIndex];

    if (!currentVideo || !nextVideo || !currentVideo.duration) return;
    if (activeVideo !== index || isSwitchingRef.current) return;

    if (currentVideo.currentTime >= currentVideo.duration - 0.6) {
      isSwitchingRef.current = true;

      nextVideo.currentTime = 0;
      nextVideo.play().catch(() => {});

      setActiveVideo(nextIndex);

      window.setTimeout(() => {
        currentVideo.pause();
        currentVideo.currentTime = 0;
        isSwitchingRef.current = false;
      }, 700);
    }
  };

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      {[0, 1].map((index) => (
        <video
          key={index}
          ref={(el) => {
            videoRefs.current[index] = el;
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            activeVideo === index ? "opacity-100" : "opacity-0"
          }`}
          autoPlay={index === 0}
          muted
          playsInline
          preload="auto"
          onTimeUpdate={() => handleVideoTimeUpdate(index)}
        >
          <source src="/home-video.mp4" type="video/mp4" />
        </video>
      ))}

      <div className="absolute inset-0 bg-linear-to-b from-amber-900/70 via-amber-900/40 to-black/80" />
      <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-transparent" />

      {children}
    </div>
  );
}