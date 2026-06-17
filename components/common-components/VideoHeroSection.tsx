"use client";

import React, { useEffect, useRef } from "react";

const HERO_VIDEO_SRC = "/home-video-safari.mp4";
const HERO_VIDEO_TYPE = 'video/mp4; codecs="avc1.640029"';
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

    const primeVideo = (video: HTMLVideoElement) => {
      if (video.currentSrc) return;
      video.src = HERO_VIDEO_SRC;
      video.load();
    };

    const switchVideos = async () => {
      if (isSwitchingRef.current) return;

      const currentIndex = activeVideoRef.current;
      const nextIndex = currentIndex === 0 ? 1 : 0;
      const current = videos[currentIndex];
      const next = videos[nextIndex];

      if (!current || !next) return;

      isSwitchingRef.current = true;
      primeVideo(next);
      // Do NOT seek next.currentTime here — video.load() already resets it to 0,
      // and seeking before the video has buffered causes Safari to stall on a
      // network seek request, which is what causes the visible freeze on desktop.

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
      video.addEventListener("timeupdate", handleTimeUpdate);
    });

    showVideo(0);
    first.currentTime = 0;
    void first.play();

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

      const current = videos[activeVideoRef.current];
      if (current?.paused) {
        void current.play();
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
          style={{ opacity: index === 0 ? 1 : 0, willChange: "opacity" }}
          autoPlay={index === 0}
          muted
          playsInline
          preload={index === 0 ? "auto" : "none"}
          disablePictureInPicture
          aria-hidden="true"
        >
          {index === 0 ? (
            <source src={HERO_VIDEO_SRC} type={HERO_VIDEO_TYPE} />
          ) : null}
        </video>
      ))}

      <div className="absolute inset-0 bg-linear-to-b from-amber-900/70 via-amber-900/40 to-black/80" />
      <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-transparent" />

      {children}
    </div>
  );
}
