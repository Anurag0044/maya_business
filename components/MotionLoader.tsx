"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { PATH_M, PATH_AYA } from "./MayaBrand";
import { usePageLoad } from "@/context/PageLoadContext";

interface MotionLoaderProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export default function MotionLoader({
  onComplete,
  minDurationMs = 1750,
}: MotionLoaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { setPageReady } = usePageLoad();

  const containerRef = useRef<HTMLDivElement>(null);
  const bladeRef = useRef<SVGGElement>(null);
  const chevronRef = useRef<SVGGElement>(null);
  const chamferGleamRef = useRef<SVGLineElement>(null);
  const ridgeGleamRef = useRef<SVGLineElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const handleFinish = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsVisible(false);
    setPageReady(true);
    onCompleteRef.current?.();
  }, [setPageReady]);

  useEffect(() => {
    setPageReady(false);

    // Guard: ensure all animated DOM nodes are present
    if (
      !bladeRef.current ||
      !chevronRef.current ||
      !wordmarkRef.current ||
      !progressLineRef.current
    ) {
      const fallbackTimer = setTimeout(handleFinish, minDurationMs);
      return () => clearTimeout(fallbackTimer);
    }

    const ctx = gsap.context(() => {
      // 1. Initial Poised States: explicit values matching inline style to prevent FOUC
      gsap.set(bladeRef.current, {
        x: -20,
        y: 16,
        opacity: 0,
        scale: 0.94,
        transformOrigin: "50% 50%",
      });
      gsap.set(chevronRef.current, {
        x: 18,
        y: 16,
        opacity: 0,
        scale: 0.94,
        transformOrigin: "50% 50%",
      });
      if (chamferGleamRef.current) {
        gsap.set(chamferGleamRef.current, {
          strokeDasharray: 370,
          strokeDashoffset: 370,
          opacity: 0,
        });
      }
      if (ridgeGleamRef.current) {
        gsap.set(ridgeGleamRef.current, {
          strokeDasharray: 55,
          strokeDashoffset: 55,
          opacity: 0,
        });
      }
      gsap.set(wordmarkRef.current, {
        opacity: 0,
        y: 8,
      });
      gsap.set(progressLineRef.current, {
        scaleX: 0,
        transformOrigin: "50% 50%",
      });

      // 2. Curated Minimalist Motion Timeline (Apple/Leica Keynote Caliber)
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Blade & Chevron glide into seamless fusion
      tl.to(
        bladeRef.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
        },
        0.05
      );

      tl.to(
        chevronRef.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
        },
        0.08
      );

      // Specular hairline trace along titanium chamfer
      if (chamferGleamRef.current) {
        tl.to(
          chamferGleamRef.current,
          {
            opacity: 0.9,
            strokeDashoffset: 0,
            duration: 0.5,
            ease: "power2.out",
          },
          0.3
        );
        tl.to(
          chamferGleamRef.current,
          {
            opacity: 0.35,
            duration: 0.35,
            ease: "power2.inOut",
          },
          0.75
        );
      }

      if (ridgeGleamRef.current) {
        tl.to(
          ridgeGleamRef.current,
          {
            opacity: 0.9,
            strokeDashoffset: 0,
            duration: 0.4,
            ease: "power2.out",
          },
          0.34
        );
        tl.to(
          ridgeGleamRef.current,
          {
            opacity: 0.45,
            duration: 0.3,
            ease: "power2.inOut",
          },
          0.7
        );
      }

      // Signature wordmark reveals with calm clarity
      tl.to(
        wordmarkRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
        },
        0.45
      );

      // Symmetrical 1px hairline progress trace
      tl.to(
        progressLineRef.current,
        {
          scaleX: 1,
          duration: Math.max(0.6, (minDurationMs - 350) / 1000),
          ease: "power2.inOut",
        },
        0.15
      );
    }, containerRef);

    ctxRef.current = ctx;
    timerRef.current = setTimeout(handleFinish, minDurationMs);

    return () => {
      ctx.revert();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [minDurationMs, handleFinish, setPageReady]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="maya-minimal-loader"
          ref={containerRef}
          role="status"
          aria-live="polite"
          aria-label="Loading MAYA Business"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.01,
            transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
          }}
          onClick={handleFinish}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#060709] select-none cursor-pointer"
          style={{ willChange: "opacity, transform" }}
        >
          {/* Central Architectural Brand Lockup */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-4 sm:gap-5">
            {/* 1. Titanium Icon */}
            <div className="relative flex items-center justify-center">
              <svg
                viewBox="25 80 460 350"
                className="h-10 sm:h-12 md:h-14 w-auto"
                shapeRendering="geometricPrecision"
                aria-hidden="true"
              >
                <defs>
                  {/* Left Blade - Brushed Specular Titanium */}
                  <linearGradient
                    id="pure-blade-grad"
                    x1="0%"
                    y1="100%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#64748B" />
                    <stop offset="35%" stopColor="#E2E8F0" />
                    <stop offset="70%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#CBD5E1" />
                  </linearGradient>

                  {/* Right Chevron Left Face */}
                  <linearGradient
                    id="pure-chev-l"
                    x1="0%"
                    y1="100%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="50%" stopColor="#E2E8F0" />
                    <stop offset="100%" stopColor="#FFFFFF" />
                  </linearGradient>

                  {/* Right Chevron Right Face */}
                  <linearGradient
                    id="pure-chev-r"
                    x1="0%"
                    y1="100%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="45%" stopColor="#CBD5E1" />
                    <stop offset="100%" stopColor="#334155" />
                  </linearGradient>
                </defs>

                {/* Left Blade */}
                <g
                  ref={bladeRef}
                  style={{
                    opacity: 0,
                    transform: "translate(-20px, 16px) scale(0.94)",
                    transformOrigin: "50% 50%",
                  }}
                >
                  <path
                    d="M 29 427 L 144 373 L 361 85 Q 215 245 29 427 Z"
                    fill="url(#pure-blade-grad)"
                  />
                  <line
                    ref={chamferGleamRef}
                    x1="144"
                    y1="373"
                    x2="361"
                    y2="85"
                    stroke="rgba(255,255,255,0.95)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    style={{
                      opacity: 0,
                      strokeDasharray: 370,
                      strokeDashoffset: 370,
                    }}
                  />
                </g>

                {/* Right Chevron */}
                <g
                  ref={chevronRef}
                  style={{
                    opacity: 0,
                    transform: "translate(18px, 16px) scale(0.94)",
                    transformOrigin: "50% 50%",
                  }}
                >
                  <path
                    d="M 184 388 L 328 214 L 328 259 Z"
                    fill="url(#pure-chev-l)"
                  />
                  <path
                    d="M 328 214 L 482 420 L 328 259 Z"
                    fill="url(#pure-chev-r)"
                  />
                  <line
                    ref={ridgeGleamRef}
                    x1="328"
                    y1="214"
                    x2="328"
                    y2="259"
                    stroke="rgba(255,255,255,1)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    style={{
                      opacity: 0,
                      strokeDasharray: 55,
                      strokeDashoffset: 55,
                    }}
                  />
                </g>
              </svg>
            </div>

            {/* 2. Signature MAYA Wordmark */}
            <div
              ref={wordmarkRef}
              style={{ opacity: 0, transform: "translateY(8px)" }}
              className="relative flex items-center justify-center"
            >
              <svg
                viewBox="58 45 2165 370"
                className="h-5 sm:h-[22px] md:h-6 w-auto"
                shapeRendering="geometricPrecision"
                aria-label="MAYA"
              >
                <defs>
                  <linearGradient
                    id="pure-maya-text"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="50%" stopColor="#F8FAFC" />
                    <stop offset="100%" stopColor="#E2E8F0" />
                  </linearGradient>
                </defs>
                <path
                  d={PATH_M}
                  fill="url(#pure-maya-text)"
                  fillRule="evenodd"
                />
                <path
                  d={PATH_AYA}
                  fill="url(#pure-maya-text)"
                  fillRule="evenodd"
                />
              </svg>
            </div>

            {/* 3. Ultra-Clean 1px Hairline Progress Bar */}
            <div className="relative w-28 sm:w-32 h-[1px] bg-white/10 rounded-full mt-1">
              <div
                ref={progressLineRef}
                style={{ transform: "scaleX(0)", transformOrigin: "50% 50%" }}
                className="w-full h-full bg-gradient-to-r from-white/30 via-white/90 to-white/30 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
