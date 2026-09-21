"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MayaBrand from "./MayaBrand";
import ThemeToggle from "./ThemeToggle";
import { usePageLoad } from "@/context/PageLoadContext";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Product", href: "#product" },
  { label: "Solutions", href: "#solutions" },
  { label: "Pricing", href: "#pricing" },
  { label: "Resources", href: "#resources" },
];

export default function Navbar() {
  const { isPageReady } = usePageLoad();
  const [activeItem, setActiveItem] = useState<string>("#product");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Sync active item with hash on mount and hashchange
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (NAV_ITEMS.some((item) => item.href === hash)) {
        setActiveItem(hash);
      }
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const currentSelection = hoveredItem || activeItem;

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={isPageReady ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full z-50 px-6 sm:px-10 lg:px-14 py-3.5 sm:py-4 flex items-center justify-between border-b border-white/[0.035]"
    >
      {/* Brand Identity: Authentic Precision Vector Lockup */}
      <MayaBrand />

      {/* Navigation Links: Disciplined True Center Alignment with Minimalist Motion Pill */}
      <nav
        className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-1"
        onMouseLeave={() => setHoveredItem(null)}
        role="navigation"
        aria-label="Main Navigation"
      >
        {NAV_ITEMS.map((item) => {
          const isSelected = currentSelection === item.href;

          return (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setActiveItem(item.href)}
              onMouseEnter={() => setHoveredItem(item.href)}
              onFocus={() => setHoveredItem(item.href)}
              onBlur={() => setHoveredItem(null)}
              className="relative px-3.5 py-1.5 rounded-full text-[13px] tracking-[0.01em] select-none transition-colors duration-300 outline-none focus-visible:ring-1 focus-visible:ring-white/40"
            >
              {/* Minimalist Floating Pill (Zero Glassmorphism, Calm Luxury Motion) */}
              {isSelected && (
                <motion.div
                  layoutId="navbarFloatingPill"
                  className="absolute inset-0 rounded-full bg-white/[0.065] pointer-events-none"
                  transition={{
                    type: "spring",
                    stiffness: 85,
                    damping: 17,
                    mass: 0.9,
                  }}
                />
              )}

              {/* Text Label with Smooth Contrast */}
              <span
                className={`relative z-10 transition-colors duration-400 ease-out ${
                  isSelected
                    ? "text-white font-medium"
                    : "text-[#9ca3af] hover:text-[#e5e7eb] font-normal"
                }`}
              >
                {item.label}
              </span>
            </a>
          );
        })}
      </nav>

      {/* Header Actions: Theme Switcher & Sign In CTA */}
      <div className="flex items-center gap-3.5 sm:gap-4 text-[13px]">
        {/* Premium Minimal Mode Switching Icon */}
        <ThemeToggle />

        <a
          href="#signin"
          className="group relative inline-flex items-center gap-1.5 px-4.5 py-1.5 sm:px-5 sm:py-2 rounded-full bg-white text-black font-medium text-[12.5px] hover:bg-neutral-100 active:scale-[0.98] transition-all duration-300 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-white/80"
        >
          <span>Sign in</span>
          <span className="text-[13px] leading-none transition-transform duration-300 ease-out group-hover:translate-x-0.5">
            →
          </span>
        </a>
      </div>
    </motion.header>
  );
}
