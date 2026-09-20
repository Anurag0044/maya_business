"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function BackgroundVideo() {
  const { theme } = useTheme();
  const nightVideoRef = useRef<HTMLVideoElement>(null);
  const dayVideoRef = useRef<HTMLVideoElement>(null);

  const isLight = theme === "light";

  // Autoplay setup & resilience for strict browser policies
  useEffect(() => {
    const videos = [nightVideoRef.current, dayVideoRef.current].filter(
      Boolean
    ) as HTMLVideoElement[];

    videos.forEach((video) => {
      video.defaultMuted = true;
      video.muted = true;
      video.playsInline = true;
    });

    const attemptPlayAll = () => {
      videos.forEach((video) => {
        if (video.paused) {
          video.play().catch(() => { });
        }
      });
    };

    attemptPlayAll();

    videos.forEach((video) => {
      video.addEventListener("canplay", attemptPlayAll);
      video.addEventListener("loadedmetadata", attemptPlayAll);
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        attemptPlayAll();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handleUserGesture = () => {
      attemptPlayAll();
      window.removeEventListener("pointerdown", handleUserGesture);
      window.removeEventListener("keydown", handleUserGesture);
    };
    window.addEventListener("pointerdown", handleUserGesture, { once: true });
    window.addEventListener("keydown", handleUserGesture, { once: true });

    return () => {
      videos.forEach((video) => {
        video.removeEventListener("canplay", attemptPlayAll);
        video.removeEventListener("loadedmetadata", attemptPlayAll);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pointerdown", handleUserGesture);
      window.removeEventListener("keydown", handleUserGesture);
    };
  }, []);

  // Ensure active video is playing whenever the mode switches
  useEffect(() => {
    const activeVideo = isLight ? dayVideoRef.current : nightVideoRef.current;
    if (activeVideo && activeVideo.paused) {
      activeVideo.play().catch(() => { });
    }
  }, [isLight]);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#060709]">
      {/* 1. Base Night Video Layer */}
      <video
        ref={nightVideoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        src="/videos/Night.mp4"
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out ${isLight ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
      >
        <source src="/videos/Night.mp4" type="video/mp4" />
        <source src="/Night.mp4" type="video/mp4" />
      </video>

      {/* 2. Base Day Video Layer */}
      <video
        ref={dayVideoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        src="/videos/Day.mp4"
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out ${isLight ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        <source src="/videos/Day.mp4" type="video/mp4" />
        <source src="/Day.mp4" type="video/mp4" />
      </video>

      {/* 3. Night Mode Atmospheric Photon Radiance (Warm architectural light bloom) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out mix-blend-screen pointer-events-none ${isLight ? "opacity-0" : "opacity-100"
          }`}
        style={{
          background: `
            radial-gradient(ellipse 55% 45% at 48% 36%, rgba(245, 158, 11, 0.055) 0%, rgba(217, 119, 6, 0.02) 45%, transparent 75%),
            radial-gradient(ellipse 45% 30% at 75% 84%, rgba(245, 158, 11, 0.04) 0%, rgba(180, 83, 9, 0.015) 45%, transparent 70%)
          `,
        }}
      />

      {/* 4. Day Mode Atmospheric Skylight Bloom (Manhattan natural daylight diffusion) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out mix-blend-screen pointer-events-none ${isLight ? "opacity-100" : "opacity-0"
          }`}
        style={{
          background: `
            radial-gradient(ellipse 65% 55% at 68% 38%, rgba(186, 230, 253, 0.07) 0%, rgba(147, 197, 253, 0.025) 45%, transparent 75%),
            radial-gradient(ellipse 50% 35% at 82% 72%, rgba(255, 255, 255, 0.03) 0%, transparent 65%)
          `,
        }}
      />

      {/* 5. Permanent Left Architectural Wall Dissolve (Universal Solid Shield - Permanently anchors left edge into obsidian, never flashes or exposes video crop) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, #060709 0%, #060709 10%, rgba(6,7,9,0.99) 18%, rgba(6,7,9,0.95) 24%, rgba(6,7,9,0.80) 32%, rgba(6,7,9,0.50) 40%, rgba(6,7,9,0.20) 45%, rgba(6,7,9,0.04) 48%, rgba(6,7,9,0) 51%)",
        }}
      />

      {/* 7. Right Edge Seamless Falloff (Universal - Dissolves right pillarbox cut into obsidian) */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
        style={{
          background:
            "linear-gradient(270deg, #060709 0%, #060709 7.8%, rgba(6,7,9,0.98) 9.5%, rgba(6,7,9,0.88) 11.5%, rgba(6,7,9,0.65) 14%, rgba(6,7,9,0.35) 17%, rgba(6,7,9,0.10) 20%, rgba(6,7,9,0) 24%)",
        }}
      />

      {/* 8. Top Architectural Ceiling Occlusion (Cove lighting under navbar) */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none transition-opacity duration-1000 ease-in-out"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,7,9,0.95) 0%, rgba(6,7,9,0.75) 35%, rgba(6,7,9,0.35) 70%, rgba(6,7,9,0) 100%)",
        }}
      />

      {/* 9. Bottom Floor Plane Occlusion (Ground shadow under logo cloud & water pool) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-36 pointer-events-none transition-opacity duration-1000 ease-in-out"
        style={{
          background:
            "linear-gradient(0deg, rgba(6,7,9,0.98) 0%, rgba(6,7,9,0.85) 30%, rgba(6,7,9,0.50) 65%, rgba(6,7,9,0.15) 85%, rgba(6,7,9,0) 100%)",
        }}
      />

      {/* 10. Sub-perceptual 35mm Micro-Grain Texture (Prevents 8-bit digital banding on OLEDs) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.022] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
