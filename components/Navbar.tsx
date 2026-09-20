import React from "react";
import MayaBrand from "./MayaBrand";

export default function Navbar() {
  return (
    <header className="relative w-full z-50 px-6 sm:px-10 lg:px-14 py-4 sm:py-5 flex items-center justify-between">
      {/* Brand Identity: Authentic Precision Vector Lockup */}
      <MayaBrand />

      {/* Navigation Links: Disciplined True Center Alignment */}
      <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-8 lg:gap-10 text-[13px] font-normal tracking-[0.01em] text-[#9ca3af]">
        <a
          href="#product"
          className="hover:text-white transition-colors duration-200"
        >
          Product
        </a>
        <a
          href="#solutions"
          className="hover:text-white transition-colors duration-200"
        >
          Solutions
        </a>
        <a
          href="#pricing"
          className="hover:text-white transition-colors duration-200"
        >
          Pricing
        </a>
        <a
          href="#resources"
          className="hover:text-white transition-colors duration-200"
        >
          Resources
        </a>
      </nav>

      {/* Header Actions */}
      <div className="flex items-center gap-5 sm:gap-7 text-[13px]">
        <a
          href="#signin"
          className="text-[#d1d5db] hover:text-white transition-colors duration-200 font-normal"
        >
          Sign in
        </a>
        <a
          href="#get-started"
          className="group relative inline-flex items-center gap-1.5 px-4.5 py-1.5 sm:px-5 sm:py-2 rounded-full bg-white text-black font-medium text-[12.5px] hover:bg-neutral-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-[0.98] transition-all duration-300 shadow-sm"
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
