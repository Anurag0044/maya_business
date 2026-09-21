"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function BackgroundVideo() {
  const { theme } = useTheme();
  const nightVideoRef = useRef<HTMLVideoElement | null>(null);
  const dayVideoRef = useRef<HTMLVideoElement | null>(null);
  const settleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSwitchingRef = useRef(false);

  // Night mode is strictly the default
  const isLight = theme === "light";
  const isInitialMount = useRef(true);

  // Ready states for instant poster-to-video crossfade (night is default, ready immediately)
  const [nightVideoReady, setNightVideoReady] = useState(true);
  const [dayVideoReady, setDayVideoReady] = useState(false);

  // Track transition state for zero-dip crossfade
  // Active video on top (z-index 20), outgoing video underneath (z-index 10)
  const [dayOpacity, setDayOpacity] = useState(isLight ? 1 : 0);
  const [nightOpacity, setNightOpacity] = useState(isLight ? 0 : 1);
  const [dayZIndex, setDayZIndex] = useState(isLight ? 20 : 10);
  const [nightZIndex, setNightZIndex] = useState(isLight ? 10 : 20);

  // Safe playback trigger configuring DOM properties before play()
  const safePlay = useCallback((video: HTMLVideoElement | null) => {
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Will resume on gesture or buffer recovery
      });
    }
  }, []);

  // Synchronize playback timestamps so 3D scene camera angles match 1:1
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

  // Buffer recovery: resume playback smoothly when buffer recovers
  const handleBufferRecovery = useCallback(() => {
    const active = isLight ? dayVideoRef.current : nightVideoRef.current;
    if (active && active.paused) {
      safePlay(active);
    }
  }, [isLight, safePlay]);

  // Callback refs to configure video DOM properties immediately upon mount
  const initNightVideo = useCallback(
    (el: HTMLVideoElement | null) => {
      if (el) {
        el.defaultMuted = true;
        el.muted = true;
        el.playsInline = true;
        nightVideoRef.current = el;
        if (!isLight && el.paused) {
          safePlay(el);
        }
      }
    },
    [isLight, safePlay]
  );

  const initDayVideo = useCallback(
    (el: HTMLVideoElement | null) => {
      if (el) {
        el.defaultMuted = true;
        el.muted = true;
        el.playsInline = true;
        dayVideoRef.current = el;
        if (isLight && el.paused) {
          safePlay(el);
        }
      }
    },
    [isLight, safePlay]
  );

  // Theme Transition Engine & Active Video Playback
  useEffect(() => {
    const activeVideo = isLight ? dayVideoRef.current : nightVideoRef.current;
    const previousVideo = isLight ? nightVideoRef.current : dayVideoRef.current;

    // Clear any pending settle timer from rapid clicks
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

      if (activeVideo) {
        safePlay(activeVideo);
      }
      return;
    }

    // On theme toggle:
    isSwitchingRef.current = true;

    // 1. Instantly synchronize camera timestamp
    if (activeVideo && previousVideo) {
      syncPlaybackTime(previousVideo, activeVideo);
      safePlay(activeVideo);
    }

    if (isLight) {
      // Transitioning to DAY:
      setDayZIndex(20);
      setNightZIndex(10);
      setNightOpacity(1);

      const frame = requestAnimationFrame(() => {
        setDayOpacity(1);
      });

      settleTimerRef.current = setTimeout(() => {
        setNightOpacity(0);
        isSwitchingRef.current = false;
        if (nightVideoRef.current && !nightVideoRef.current.paused) {
          nightVideoRef.current.pause();
        }
      }, 1250);

      return () => {
        cancelAnimationFrame(frame);
      };
    } else {
      // Transitioning to NIGHT:
      setNightZIndex(20);
      setDayZIndex(10);
      setDayOpacity(1);

      const frame = requestAnimationFrame(() => {
        setNightOpacity(1);
      });

      settleTimerRef.current = setTimeout(() => {
        setDayOpacity(0);
        isSwitchingRef.current = false;
        if (dayVideoRef.current && !dayVideoRef.current.paused) {
          dayVideoRef.current.pause();
        }
      }, 1250);

      return () => {
        cancelAnimationFrame(frame);
      };
    }
  }, [isLight, syncPlaybackTime, safePlay]);

  // Always-Play Guarantee Engine:
  // Keep background video running continuously, never pause when switching tabs/windows,
  // recover automatically from user interaction, buffer stalls, or browser power-saving throttles.
  useEffect(() => {
    const activeVideo = isLight ? dayVideoRef.current : nightVideoRef.current;
    if (activeVideo) {
      safePlay(activeVideo);
    }

    // 1. Visibility change & window focus: verify active video is playing
    const handleActive = () => {
      const active = isLight ? dayVideoRef.current : nightVideoRef.current;
      if (active && active.paused) {
        safePlay(active);
      }
    };

    document.addEventListener("visibilitychange", handleActive);
    window.addEventListener("focus", handleActive);
    window.addEventListener("online", handleActive);

    // 2. User Gesture Autoplay Unlock (pointer, touch, scroll, key)
    const handleUserGesture = () => {
      const active = isLight ? dayVideoRef.current : nightVideoRef.current;
      if (active && active.paused) {
        safePlay(active);
      }
    };

    window.addEventListener("pointerdown", handleUserGesture, { passive: true });
    window.addEventListener("touchstart", handleUserGesture, { passive: true });
    window.addEventListener("keydown", handleUserGesture, { passive: true });
    window.addEventListener("scroll", handleUserGesture, { passive: true });
    window.addEventListener("click", handleUserGesture, { passive: true });

    // 3. Heartbeat Watcher: Ensures background video NEVER remains paused unexpectedly
    const heartbeat = setInterval(() => {
      const active = isLight ? dayVideoRef.current : nightVideoRef.current;
      if (active && active.paused && !isSwitchingRef.current) {
        safePlay(active);
      }
    }, 2000);

    return () => {
      document.removeEventListener("visibilitychange", handleActive);
      window.removeEventListener("focus", handleActive);
      window.removeEventListener("online", handleActive);
      window.removeEventListener("pointerdown", handleUserGesture);
      window.removeEventListener("touchstart", handleUserGesture);
      window.removeEventListener("keydown", handleUserGesture);
      window.removeEventListener("scroll", handleUserGesture);
      window.removeEventListener("click", handleUserGesture);
      clearInterval(heartbeat);
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
      }
    };
  }, [isLight, safePlay]);

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
        ref={initNightVideo}
        autoPlay={!isLight}
        loop
        muted
        playsInline
        preload={isLight ? "metadata" : "auto"}
        poster="/videos/night_poster.webp"
        onPlaying={() => setNightVideoReady(true)}
        onLoadedData={() => setNightVideoReady(true)}
        onCanPlay={() => {
          setNightVideoReady(true);
          handleBufferRecovery();
        }}
        onWaiting={handleBufferRecovery}
        onEnded={(e) => {
          e.currentTarget.currentTime = 0;
          safePlay(e.currentTarget);
        }}
        onPause={(e) => {
          if (!isLight && !isSwitchingRef.current) {
            safePlay(e.currentTarget);
          }
        }}
        onError={() => {
          const vid = nightVideoRef.current;
          if (vid && !isLight) {
            setTimeout(() => {
              vid.load();
              safePlay(vid);
            }, 1000);
          }
        }}
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
        <source src="/videos/NIGHT_1080p.webm" type="video/webm" />
        <source src="/videos/NIGHT_1080p.mp4" type="video/mp4" />
      </video>

      {/* Day Video Layer */}
      <video
        ref={initDayVideo}
        autoPlay={isLight}
        loop
        muted
        playsInline
        preload={isLight ? "auto" : "metadata"}
        poster="/videos/day_poster.webp"
        onPlaying={() => setDayVideoReady(true)}
        onLoadedData={() => setDayVideoReady(true)}
        onCanPlay={() => {
          setDayVideoReady(true);
          handleBufferRecovery();
        }}
        onWaiting={handleBufferRecovery}
        onEnded={(e) => {
          e.currentTarget.currentTime = 0;
          safePlay(e.currentTarget);
        }}
        onPause={(e) => {
          if (isLight && !isSwitchingRef.current) {
            safePlay(e.currentTarget);
          }
        }}
        onError={() => {
          const vid = dayVideoRef.current;
          if (vid && isLight) {
            setTimeout(() => {
              vid.load();
              safePlay(vid);
            }, 1000);
          }
        }}
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
        <source src="/videos/DAY_1080p.webm" type="video/webm" />
        <source src="/videos/DAY_1080p.mp4" type="video/mp4" />
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
            "linear-gradient(0deg, rgba(6,7,9,0.98) 0%, rgba(6,7,9,0.88) 30%, rgba(6,7,9,0.55) 65%, rgba(6,7,9,0.18) 85%, rgba(6,7,9,0) 100%)",
        }}
      />

      {/* Watermark Cloak Occlusion (Permanently conceals bottom-right source mark with seamless obsidian radial falloff) */}
      <div
        className="absolute bottom-0 right-0 w-[500px] max-w-[48vw] h-40 sm:h-48 pointer-events-none z-26"
        style={{
          background:
            "radial-gradient(ellipse 100% 90% at 88% 90%, #060709 0%, #060709 54%, rgba(6,7,9,0.96) 68%, rgba(6,7,9,0.60) 84%, transparent 100%)",
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
