"use client";

import React, { useEffect, useRef } from "react";

const HERO_VIDEO_FADE_SECONDS = 0.65;

interface VideoHeroSectionProps {
  className?: string;
  children?: React.ReactNode;
}

export default function VideoHeroSection({
  className = "min-h-[70vh]",
  children,
}: VideoHeroSectionProps) {
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const activeVideoRef = useRef(0);
  const isSwitchingRef = useRef(false);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const videos = videoRefs.current.filter(Boolean) as HTMLVideoElement[];
    const first = videos[0];
    const second = videos[1];

    if (!first || !second) return;

    const showVideo = (index: number) => {
      videos.forEach((video, videoIndex) => {
        video.style.opacity = videoIndex === index ? "1" : "0";
      });
    };

    const switchVideos = async () => {
      if (isSwitchingRef.current) return;

      const currentIndex = activeVideoRef.current;
      const nextIndex = currentIndex === 0 ? 1 : 0;
      const current = videos[currentIndex];
      const next = videos[nextIndex];

      if (!current || !next) return;

      isSwitchingRef.current = true;
      next.currentTime = 0;

      try {
        await next.play();
        showVideo(nextIndex);
        activeVideoRef.current = nextIndex;

        if (resetTimerRef.current !== null) {
          window.clearTimeout(resetTimerRef.current);
        }

        resetTimerRef.current = window.setTimeout(() => {
          current.pause();
          current.currentTime = 0;
          isSwitchingRef.current = false;
        }, HERO_VIDEO_FADE_SECONDS * 1000);
      } catch {
        isSwitchingRef.current = false;
      }
    };

    const handleTimeUpdate = () => {
      const current = videos[activeVideoRef.current];
      if (!current || isSwitchingRef.current) return;

      const remaining = current.duration - current.currentTime;
      if (Number.isFinite(remaining) && remaining <= HERO_VIDEO_FADE_SECONDS) {
        void switchVideos();
      }
    };

    videos.forEach((video) => {
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.addEventListener("timeupdate", handleTimeUpdate);
      video.load();
    });

    showVideo(0);
    first.currentTime = 0;
    void first.play();

    return () => {
      videos.forEach((video) => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.pause();
      });

      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      {[0, 1].map((index) => (
        <video
          key={index}
          ref={(el) => {
            videoRefs.current[index] = el;
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
          <source src="/home-video.mp4" type='video/mp4; codecs="avc1.640032"' />
        </video>
      ))}

      <div className="absolute inset-0 bg-linear-to-b from-amber-900/70 via-amber-900/40 to-black/80" />
      <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-transparent" />

      {children}
    </div>
  );
}
