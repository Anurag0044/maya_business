"use client";

import React, { useEffect, useRef } from "react";

export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure DOM properties are set for strict autoplay policy compliance
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;

    const attemptPlay = () => {
      if (video.paused) {
        video.play().catch(() => {
          // Autoplay was prevented by browser policy; will resume on first user interaction
        });
      }
    };

    // Attempt playback immediately and on load events
    attemptPlay();
    video.addEventListener("canplay", attemptPlay);
    video.addEventListener("loadedmetadata", attemptPlay);

    // Auto-resume playback if tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        attemptPlay();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // One-time fallback gesture listener if browser strictly gates autoplay
    const handleUserGesture = () => {
      attemptPlay();
      window.removeEventListener("pointerdown", handleUserGesture);
      window.removeEventListener("keydown", handleUserGesture);
    };
    window.addEventListener("pointerdown", handleUserGesture, { once: true });
    window.addEventListener("keydown", handleUserGesture, { once: true });

    return () => {
      video.removeEventListener("canplay", attemptPlay);
      video.removeEventListener("loadedmetadata", attemptPlay);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pointerdown", handleUserGesture);
      window.removeEventListener("keydown", handleUserGesture);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        src="/videos/Night.mp4"
        className="absolute inset-0 w-full h-full object-cover object-center select-none"
      >
        <source src="/videos/Night.mp4" type="video/mp4" />
        <source src="/Night.mp4" type="video/mp4" />
      </video>

      {/* Cinematic Left Vignette: Enhances live typography legibility over video */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(6,7,9,0.92) 0%, rgba(6,7,9,0.75) 38%, rgba(6,7,9,0.3) 52%, rgba(6,7,9,0) 65%)",
        }}
      />

      {/* Subtle Top & Bottom Cinematic Edge Vignettes */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#060709]/80 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#060709]/85 to-transparent" />
    </div>
  );
}
