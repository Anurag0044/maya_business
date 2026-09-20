"use client";

import React, { useState, useEffect, useId, useCallback } from "react";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const rawId = useId();
  const uniqueId = rawId.replace(/:/g, "");
  const maskId = `clean-eclipse-${uniqueId}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDay = mounted ? theme === "light" : false;

  const handleToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  // Keyboard shortcut: Press 'T' to toggle mode cleanly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "t" || e.key === "T") {
        const active = document.activeElement;
        const isInput =
          active instanceof HTMLInputElement ||
          active instanceof HTMLTextAreaElement ||
          (active as HTMLElement | null)?.isContentEditable;
        if (!isInput) {
          handleToggle();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleToggle]);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isDay ? "Switch to Night mode" : "Switch to Day mode"}
        title={isDay ? "Switch to Night mode (T)" : "Switch to Day mode (T)"}
        className={`group relative w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full flex items-center justify-center cursor-pointer select-none outline-none transition-all duration-200 active:scale-95 focus-visible:ring-1 focus-visible:ring-white/40 ${
          isDay
            ? "bg-[#141720] hover:bg-[#1c202c] border border-[#2b3140] hover:border-[#424c60] text-white"
            : "bg-[#0b0d11] hover:bg-[#13161e] border border-[#1e232f] hover:border-[#333c4e] text-[#f3f4f6]"
        }`}
      >
        {/* Minimal Architectural Kinetic Glyph */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
          style={{
            transform: isDay ? "rotate(90deg)" : "rotate(0deg)",
          }}
        >
          <mask id={maskId}>
            <rect x="0" y="0" width="24" height="24" fill="white" />
            <circle
              cx="12"
              cy="12"
              r="4.8"
              fill="black"
              style={{
                transform: isDay
                  ? "translate(16px, -16px)"
                  : "translate(4.8px, -4.8px)",
                transition: "transform 0.3s cubic-bezier(0.2, 0, 0, 1)",
              }}
            />
          </mask>

          {/* Core Celestial Body (Razor-sharp Crescent in Night, Clean Disc in Day) */}
          <circle
            cx="12"
            cy="12"
            r="5"
            mask={`url(#${maskId})`}
            fill="currentColor"
            style={{
              transform: isDay ? "scale(0.85)" : "scale(1)",
              transformOrigin: "12px 12px",
              transition: "transform 0.3s cubic-bezier(0.2, 0, 0, 1)",
            }}
          />

          {/* Architectural Cardinal & Diagonal Precision Ticks */}
          <g
            style={{
              transform: isDay ? "scale(1)" : "scale(0.2)",
              opacity: isDay ? 1 : 0,
              transformOrigin: "12px 12px",
              transition:
                "transform 0.28s cubic-bezier(0.2, 0, 0, 1), opacity 0.2s ease",
            }}
          >
            {/* 4 Cardinal Crosshair Ticks */}
            <line
              x1="12"
              y1="1.8"
              x2="12"
              y2="4.4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="22.2"
              y1="12"
              x2="19.6"
              y2="12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="12"
              y1="22.2"
              x2="12"
              y2="19.6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="1.8"
              y1="12"
              x2="4.4"
              y2="12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* 4 Subtle Diagonal Micro-ticks */}
            <line
              x1="12"
              y1="2.6"
              x2="12"
              y2="4.4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              transform="rotate(45 12 12)"
            />
            <line
              x1="12"
              y1="2.6"
              x2="12"
              y2="4.4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              transform="rotate(135 12 12)"
            />
            <line
              x1="12"
              y1="2.6"
              x2="12"
              y2="4.4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              transform="rotate(225 12 12)"
            />
            <line
              x1="12"
              y1="2.6"
              x2="12"
              y2="4.4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              transform="rotate(315 12 12)"
            />
          </g>
        </svg>
      </button>
    </div>
  );
}
