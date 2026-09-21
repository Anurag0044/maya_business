"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import Metrics from "./Metrics";
import { usePageLoad } from "@/context/PageLoadContext";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: "easeOut" },
  },
};

export default function Hero() {
  const { isPageReady } = usePageLoad();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={isPageReady ? "visible" : "hidden"}
      className="flex flex-col justify-center max-w-xl z-10 select-none"
    >
      {/* Eyebrow: Minimalist Architectural Light Sweep */}
      <motion.div variants={itemVariants} className="mb-2 sm:mb-2.5">
        <span className="text-[9.5px] sm:text-[10px] font-medium uppercase tracking-[0.24em] inline-block animate-luxury-shimmer select-none">
          Operate Business with MΛYΛ
        </span>
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        variants={itemVariants}
        className="text-[clamp(2.25rem,3.6vw,3.85rem)] font-light tracking-[-0.03em] leading-[0.98] text-white"
      >
        <div>More</div>
        <div>Business.</div>
        <div className="text-[#586072]">Less Work.</div>
      </motion.h1>

      {/* Sub-headline / Value Proposition */}
      <motion.p
        variants={itemVariants}
        className="mt-3 sm:mt-3.5 lg:mt-4 text-[#9ca3af] text-[13px] sm:text-[13.5px] lg:text-[14px] leading-[1.6] max-w-[430px] font-normal"
      >
        MAYA Business is your always-on AI receptionist, lead manager and
        operations partner — so you can focus on what truly matters.
      </motion.p>

      {/* CTAs */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-5 sm:gap-6 my-4.5 sm:my-5 lg:my-6"
      >
        {/* Primary CTA Button */}
        <a
          href="#get-started"
          className="group inline-flex items-center gap-2 px-5 py-2 sm:px-5.5 sm:py-2 rounded-full bg-white text-black font-medium text-[12.5px] hover:bg-neutral-100 active:scale-[0.98] transition-all duration-300 shadow-sm"
        >
          <span>Get started</span>
          <span className="text-[12.5px] leading-none transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </a>

        {/* Secondary Video CTA */}
        <button
          type="button"
          className="group flex items-center gap-3 text-left focus:outline-none cursor-pointer"
        >
          <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full border border-white/15 bg-white/[0.04] flex items-center justify-center group-hover:border-white/35 group-hover:bg-white/[0.08] transition-all duration-300">
            <svg
              className="w-2.5 h-2.5 text-white fill-current ml-0.5"
              viewBox="0 0 24 24"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[12.5px] font-medium text-white group-hover:text-white/90 transition-colors">
              See it in action
            </span>
            <span className="text-[10.5px] text-[#717682] font-normal leading-none mt-0.5">
              2 min
            </span>
          </div>
        </button>
      </motion.div>

      {/* Metrics Row */}
      <motion.div variants={itemVariants}>
        <Metrics />
      </motion.div>
    </motion.div>
  );
}
