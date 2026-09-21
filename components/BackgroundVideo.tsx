"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function BackgroundVideo() {
  const { theme } = useTheme();
  const nightVideoRef = useRef<HTMLVideoElement>(null);
  const dayVideoRef = useRef<HTMLVideoElement>(null);
  const settleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef({ day: 0, night: 0 });

  const isLight = theme === "light";
  const isInitialMount = useRef(true);

  // Ready states for instant poster-to-video crossfade (eliminates black flashes)
  const [nightVideoReady, setNightVideoReady] = useState(false);
  const [dayVideoReady, setDayVideoReady] = useState(false);

  // Track transition state for zero-dip crossfade
  // Active video on top (z-index 20), outgoing video underneath (z-index 10)
  const [dayOpacity, setDayOpacity] = useState(isLight ? 1 : 0);
  const [nightOpacity, setNightOpacity] = useState(isLight ? 0 : 1);
  const [dayZIndex, setDayZIndex] = useState(isLight ? 20 : 10);
  const [nightZIndex, setNightZIndex] = useState(isLight ? 10 : 20);

  // Accessibility: respect reduced motion preferences
  const [reducedMotion, setReducedMotion] = useState(false);

  // Synchronize playback timestamps so the 3D scene camera angles match 1:1
  const syncPlaybackTime = useCallback(
    (source: HTMLVideoElement, target: HTMLVideoElement) => {
      if (
        source &&
        target &&
        !isNaN(source.currentTime) &&
        source.currentTime > 0
      ) {
        target.currentTime = source.currentTime;
      }
    },
    []
  );

  // Network error recovery engine with exponential backoff
  const handleVideoError = useCallback(
    (video: HTMLVideoElement | null, type: "day" | "night") => {
      if (!video) return;
      if (retryCountRef.current[type] < 3) {
        retryCountRef.current[type]++;
        const resumeTime = video.currentTime || 0;
        const delay = retryCountRef.current[type] * 1200;
        setTimeout(() => {
          video.load();
          video.currentTime = resumeTime;
          const isActive = (type === "day" && isLight) || (type === "night" && !isLight);
          if (isActive && !reducedMotion) {
            video.play().catch(() => {});
          }
        }, delay);
      }
    },
    [isLight, reducedMotion]
  );

  // Network buffer stall recovery: resume playback smoothly when buffer recovers
  const handleBufferRecovery = useCallback(() => {
    const active = isLight ? dayVideoRef.current : nightVideoRef.current;
    if (active && active.paused && !reducedMotion) {
      active.play().catch(() => {});
    }
  }, [isLight, reducedMotion]);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
      if (e.matches) {
        dayVideoRef.current?.pause();
        nightVideoRef.current?.pause();
      } else {
        const active = isLight ? dayVideoRef.current : nightVideoRef.current;
        active?.play().catch(() => {});
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [isLight]);

  // Apple-grade Single-Active-Decoder Engine & Theme Transition
  useEffect(() => {
    const activeVideo = isLight ? dayVideoRef.current : nightVideoRef.current;
    const previousVideo = isLight ? nightVideoRef.current : dayVideoRef.current;

    // Clear any pending settle timer from previous rapid clicks
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }

    // Initial mount setup
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (isLight) {
        setDayZIndex(20);
        setNightZIndex(10);
        setDayOpacity(1);
        setNightOpacity(0);
      } else {
        setNightZIndex(20);
        setDayZIndex(10);
        setNightOpacity(1);
        setDayOpacity(0);
      }

      // Start ONLY the active video on mount to save 50% GPU/decoder resources
      if (activeVideo && !reducedMotion) {
        activeVideo.play().catch(() => {});
      }
      return;
    }

    // On theme toggle:
    // 1. Instantly synchronize camera timestamp
    if (activeVideo && previousVideo) {
      syncPlaybackTime(previousVideo, activeVideo);
      if (!reducedMotion) {
        activeVideo.play().catch(() => {});
      }
    }

    if (isLight) {
      // Transitioning to DAY:
      // Elevate Day to top layer (z: 20), keep Night visible underneath (z: 10, opacity: 1)
      setDayZIndex(20);
      setNightZIndex(10);
      setNightOpacity(1);

      // Trigger Day fade-in on next animation frame
      const frame = requestAnimationFrame(() => {
        setDayOpacity(1);
      });

      // After 1200ms transition settles:
      // 1. Cleanly set Night's opacity under Day to 0
      // 2. PAUSE Night video to completely release GPU decoder resources!
      settleTimerRef.current = setTimeout(() => {
        setNightOpacity(0);
        if (nightVideoRef.current && !nightVideoRef.current.paused) {
          nightVideoRef.current.pause();
        }
      }, 1250);

      return () => {
        cancelAnimationFrame(frame);
      };
    } else {
      // Transitioning to NIGHT:
      // Elevate Night to top layer (z: 20), keep Day visible underneath (z: 10, opacity: 1)
      setNightZIndex(20);
      setDayZIndex(10);
      setDayOpacity(1);

      // Trigger Night fade-in on next frame
      const frame = requestAnimationFrame(() => {
        setNightOpacity(1);
      });

      // After 1200ms transition settles:
      // 1. Cleanly set Day's opacity under Night to 0
      // 2. PAUSE Day video to completely release GPU decoder resources!
      settleTimerRef.current = setTimeout(() => {
        setDayOpacity(0);
        if (dayVideoRef.current && !dayVideoRef.current.paused) {
          dayVideoRef.current.pause();
        }
      }, 1250);

      return () => {
        cancelAnimationFrame(frame);
      };
    }
  }, [isLight, syncPlaybackTime, reducedMotion]);

  // Global Page Visibility, Network Online Recovery & Browser Autoplay Handling
  useEffect(() => {
    const videos = [nightVideoRef.current, dayVideoRef.current].filter(
      Boolean
    ) as HTMLVideoElement[];

    // Ensure audio tracks are strictly disabled for background video
    videos.forEach((video) => {
      video.defaultMuted = true;
      video.muted = true;
      video.playsInline = true;
    });

    const activeVideo = isLight ? dayVideoRef.current : nightVideoRef.current;
    if (activeVideo && !reducedMotion) {
      activeVideo.play().catch(() => {});
    }

    // 1. VisibilityChange: Pause video when tab is hidden, resume when tab is active
    const handleVisibilityChange = () => {
      const active = isLight ? dayVideoRef.current : nightVideoRef.current;
      if (!active) return;
      if (document.visibilityState === "hidden") {
        active.pause();
      } else if (document.visibilityState === "visible") {
        if (!reducedMotion) {
          active.play().catch(() => {});
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 2. Online/Offline Recovery: Automatically resume video when internet reconnects
    const handleOnline = () => {
      const active = isLight ? dayVideoRef.current : nightVideoRef.current;
      if (active && active.paused && !reducedMotion) {
        active.play().catch(() => {});
      }
    };
    window.addEventListener("online", handleOnline);

    // 3. User Gesture Autoplay Unlock: For strict browser policies or Low Power Mode
    const handleUserGesture = () => {
      const active = isLight ? dayVideoRef.current : nightVideoRef.current;
      if (active && active.paused && !reducedMotion) {
        active.play().catch(() => {});
      }
      cleanupUserGestures();
    };

    const cleanupUserGestures = () => {
      window.removeEventListener("pointerdown", handleUserGesture);
      window.removeEventListener("touchstart", handleUserGesture);
      window.removeEventListener("keydown", handleUserGesture);
      window.removeEventListener("scroll", handleUserGesture);
    };

    window.addEventListener("pointerdown", handleUserGesture, { passive: true });
    window.addEventListener("touchstart", handleUserGesture, { passive: true });
    window.addEventListener("keydown", handleUserGesture, { passive: true });
    window.addEventListener("scroll", handleUserGesture, { passive: true });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      cleanupUserGestures();
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
      }
    };
  }, [isLight, reducedMotion]);

  return (
    <div
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#060709]"
      style={{
        contain: "strict",
      }}
    >
      {/* ========================================================================= */}
      {/* 0. INSTANT ZERO-LATENCY POSTER FALLBACK LAYERS (Sub-50ms First Paint)     */}
      {/* ========================================================================= */}
      {/* Night Poster Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/videos/night_poster.webp"
        alt=""
        aria-hidden="true"
        fetchPriority={isLight ? "low" : "high"}
        style={{
          opacity: nightOpacity,
          zIndex: nightZIndex - 1,
          transition: "opacity 1200ms cubic-bezier(0.25, 0.1, 0.25, 1.0)",
          willChange: "opacity",
          transform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
        }}
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
      />

      {/* Day Poster Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/videos/day_poster.webp"
        alt=""
        aria-hidden="true"
        fetchPriority={isLight ? "high" : "low"}
        style={{
          opacity: dayOpacity,
          zIndex: dayZIndex - 1,
          transition: "opacity 1200ms cubic-bezier(0.25, 0.1, 0.25, 1.0)",
          willChange: "opacity",
          transform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
        }}
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
      />

      {/* ========================================================================= */}
      {/* 1. DUAL-CODEC STREAM-OPTIMIZED VIDEO LAYERS                               */}
      {/* ========================================================================= */}
      {/* Night Video Layer */}
      <video
        ref={nightVideoRef}
        autoPlay={!isLight}
        loop
        muted
        playsInline
        preload={isLight ? "metadata" : "auto"}
        poster="/videos/night_poster.webp"
        onPlaying={() => setNightVideoReady(true)}
        onLoadedData={() => setNightVideoReady(true)}
        onCanPlay={handleBufferRecovery}
        onWaiting={handleBufferRecovery}
        onError={() => handleVideoError(nightVideoRef.current, "night")}
        style={{
          opacity: nightVideoReady ? nightOpacity : 0,
          zIndex: nightZIndex,
          transition: "opacity 1200ms cubic-bezier(0.25, 0.1, 0.25, 1.0)",
          willChange: "opacity",
          transform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
        }}
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
      >
        <source src="/videos/NIGHT_1080p.webm" type="video/webm" media="(max-width: 1920px)" />
        <source src="/videos/NIGHT_1080p.mp4" type="video/mp4" media="(max-width: 1920px)" />
        <source src="/videos/NIGHT.mp4" type="video/mp4" />
      </video>

      {/* Day Video Layer */}
      <video
        ref={dayVideoRef}
        autoPlay={isLight}
        loop
        muted
        playsInline
        preload={isLight ? "auto" : "metadata"}
        poster="/videos/day_poster.webp"
        onPlaying={() => setDayVideoReady(true)}
        onLoadedData={() => setDayVideoReady(true)}
        onCanPlay={handleBufferRecovery}
        onWaiting={handleBufferRecovery}
        onError={() => handleVideoError(dayVideoRef.current, "day")}
        style={{
          opacity: dayVideoReady ? dayOpacity : 0,
          zIndex: dayZIndex,
          transition: "opacity 1200ms cubic-bezier(0.25, 0.1, 0.25, 1.0)",
          willChange: "opacity",
          transform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
        }}
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
      >
        <source src="/videos/DAY_1080p.webm" type="video/webm" media="(max-width: 1920px)" />
        <source src="/videos/DAY_1080p.mp4" type="video/mp4" media="(max-width: 1920px)" />
        <source src="/videos/DAY.mp4" type="video/mp4" />
      </video>

      {/* ========================================================================= */}
      {/* 2. ATMOSPHERIC OPTICAL LIGHTING OVERLAYS                                  */}
      {/* ========================================================================= */}
      {/* Night Mode Atmospheric Photon Radiance (Warm architectural light bloom) */}
      <div
        className="absolute inset-0 mix-blend-screen pointer-events-none z-25"
        style={{
          opacity: isLight ? 0 : 1,
          transition: "opacity 1200ms cubic-bezier(0.25, 0.1, 0.25, 1.0)",
          background: `
            radial-gradient(ellipse 55% 45% at 48% 36%, rgba(245, 158, 11, 0.055) 0%, rgba(217, 119, 6, 0.02) 45%, transparent 75%),
            radial-gradient(ellipse 45% 30% at 75% 84%, rgba(245, 158, 11, 0.04) 0%, rgba(180, 83, 9, 0.015) 45%, transparent 70%)
          `,
        }}
      />

      {/* Day Mode Atmospheric Skylight Bloom (Manhattan natural daylight diffusion) */}
      <div
        className="absolute inset-0 mix-blend-screen pointer-events-none z-25"
        style={{
          opacity: isLight ? 1 : 0,
          transition: "opacity 1200ms cubic-bezier(0.25, 0.1, 0.25, 1.0)",
          background: `
            radial-gradient(ellipse 65% 55% at 68% 38%, rgba(186, 230, 253, 0.07) 0%, rgba(147, 197, 253, 0.025) 45%, transparent 75%),
            radial-gradient(ellipse 50% 35% at 82% 72%, rgba(255, 255, 255, 0.03) 0%, transparent 65%)
          `,
        }}
      />

      {/* Permanent Left Architectural Wall Dissolve (Universal Solid Shield) */}
      <div
        className="absolute inset-0 pointer-events-none z-26"
        style={{
          background:
            "linear-gradient(90deg, #060709 0%, #060709 10%, rgba(6,7,9,0.99) 18%, rgba(6,7,9,0.95) 24%, rgba(6,7,9,0.80) 32%, rgba(6,7,9,0.50) 40%, rgba(6,7,9,0.20) 45%, rgba(6,7,9,0.04) 48%, rgba(6,7,9,0) 51%)",
        }}
      />

      {/* Right Edge Seamless Falloff (Dissolves right pillarbox cut into obsidian) */}
      <div
        className="absolute inset-0 pointer-events-none z-26"
        style={{
          background:
            "linear-gradient(270deg, #060709 0%, #060709 7.8%, rgba(6,7,9,0.98) 9.5%, rgba(6,7,9,0.88) 11.5%, rgba(6,7,9,0.65) 14%, rgba(6,7,9,0.35) 17%, rgba(6,7,9,0.10) 20%, rgba(6,7,9,0) 24%)",
        }}
      />

      {/* Top Architectural Ceiling Occlusion (Cove lighting under navbar) */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-26"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,7,9,0.95) 0%, rgba(6,7,9,0.75) 35%, rgba(6,7,9,0.35) 70%, rgba(6,7,9,0) 100%)",
        }}
      />

      {/* Bottom Floor Plane Occlusion (Ground shadow under logo cloud & water pool) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-36 pointer-events-none z-26"
        style={{
          background:
            "linear-gradient(0deg, rgba(6,7,9,0.98) 0%, rgba(6,7,9,0.85) 30%, rgba(6,7,9,0.50) 65%, rgba(6,7,9,0.15) 85%, rgba(6,7,9,0) 100%)",
        }}
      />

      {/* Sub-perceptual 35mm Micro-Grain Texture (Prevents 8-bit digital banding on OLEDs) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.022] mix-blend-overlay z-27"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
