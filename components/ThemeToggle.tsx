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
        <div className="relative w-4.5 h-4.5 sm:w-5 sm:h-5 flex items-center justify-center">
          {/* Night Mode: Exact Original Mathematical Crescent Moon Glyph */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={`w-full h-full transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
              isDay
                ? "opacity-0 scale-75 rotate-45 pointer-events-none absolute"
                : "opacity-100 scale-100 rotate-0"
            }`}
            aria-hidden="true"
          >
            <mask id={maskId}>
              <rect x="0" y="0" width="24" height="24" fill="white" />
              <circle
                cx="12"
                cy="12"
                r="4.8"
                fill="black"
                style={{
                  transform: "translate(4.8px, -4.8px)",
                }}
              />
            </mask>
            <circle
              cx="12"
              cy="12"
              r="5"
              mask={`url(#${maskId})`}
              fill="currentColor"
            />
          </svg>

          {/* Light Mode: Minimal & Premium Pill-Ray Sun Glyph */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.85"
            strokeLinecap="round"
            className={`w-full h-full transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
              isDay
                ? "opacity-100 scale-100 rotate-0"
                : "opacity-0 scale-75 -rotate-45 pointer-events-none absolute"
            }`}
            aria-hidden="true"
          >
            {/* Center Precision Ring */}
            <circle cx="12" cy="12" r="4.2" />

            {/* 8 Symmetrical Radial Pill Rays */}
            <line x1="12" y1="2.4" x2="12" y2="4.8" />
            <line x1="12" y1="2.4" x2="12" y2="4.8" transform="rotate(45 12 12)" />
            <line x1="12" y1="2.4" x2="12" y2="4.8" transform="rotate(90 12 12)" />
            <line x1="12" y1="2.4" x2="12" y2="4.8" transform="rotate(135 12 12)" />
            <line x1="12" y1="2.4" x2="12" y2="4.8" transform="rotate(180 12 12)" />
            <line x1="12" y1="2.4" x2="12" y2="4.8" transform="rotate(225 12 12)" />
            <line x1="12" y1="2.4" x2="12" y2="4.8" transform="rotate(270 12 12)" />
            <line x1="12" y1="2.4" x2="12" y2="4.8" transform="rotate(315 12 12)" />
          </svg>
        </div>
      </button>
    </div>
  );
}
