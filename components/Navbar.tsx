"use client";

import React from "react";
import MayaBrand from "./MayaBrand";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <header className="relative w-full z-50 px-6 sm:px-10 lg:px-14 py-3.5 sm:py-4 flex items-center justify-between border-b border-white/[0.035] backdrop-blur-[3px]">
      {/* Brand Identity: Authentic Precision Vector Lockup */}
      <MayaBrand />

      {/* Navigation Links: Disciplined True Center Alignment */}
      <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 lg:gap-3 text-[13px] font-normal tracking-[0.01em] text-[#9ca3af]">
        <a
          href="#product"
          className="px-3 py-1 rounded-full hover:text-white hover:bg-white/[0.06] transition-all duration-200"
        >
          Product
        </a>
        <a
          href="#solutions"
          className="px-3 py-1 rounded-full hover:text-white hover:bg-white/[0.06] transition-all duration-200"
        >
          Solutions
        </a>
        <a
          href="#pricing"
          className="px-3 py-1 rounded-full hover:text-white hover:bg-white/[0.06] transition-all duration-200"
        >
          Pricing
        </a>
        <a
          href="#resources"
          className="px-3 py-1 rounded-full hover:text-white hover:bg-white/[0.06] transition-all duration-200"
        >
          Resources
        </a>
      </nav>

      {/* Header Actions: Theme Switcher, Sign In, Primary CTA */}
      <div className="flex items-center gap-3.5 sm:gap-5 text-[13px]">
        {/* Premium Minimal Mode Switching Icon */}
        <ThemeToggle />

        <a
          href="#signin"
          className="px-3 py-1 rounded-full text-[#d1d5db] hover:text-white hover:bg-white/[0.06] transition-all duration-200 font-normal"
        >
          Sign in
        </a>

        <a
          href="#get-started"
          className="group relative inline-flex items-center gap-1.5 px-4.5 py-1.5 sm:px-5 sm:py-2 rounded-full bg-white text-black font-medium text-[12.5px] hover:bg-neutral-100 hover:shadow-[0_0_24px_rgba(255,255,255,0.25)] active:scale-[0.98] transition-all duration-300 shadow-sm"
        >
          <span>Get started</span>
          <span className="text-[13px] leading-none transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </a>
      </div>
    </header>
  );
}
