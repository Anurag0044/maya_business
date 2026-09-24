"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import MayaReceptionistVisualizer from "./MayaReceptionistVisualizer";
import MayaWordmark from "./MayaWordmark";

export default function MayaReceptionist() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      id="maya-receptionist"
      className={`relative w-full pt-16 sm:pt-24 lg:pt-32 pb-0 overflow-hidden font-sans transition-colors duration-300 select-none ${isDark
          ? "bg-[#060709] text-white selection:bg-neutral-800"
          : "bg-[#FFFFFF] text-[#0F172A] selection:bg-neutral-200"
        }`}
    >
      {/* ========================================================================= */}
      {/* SEAMLESS AMBIENT HORIZON BLEND (Zero middle lines, tight optical focus)   */}
      {/* ========================================================================= */}
      <div className="absolute top-0 inset-x-0 pointer-events-none select-none z-20 overflow-hidden">
        {/* Compact, Narrow Ambient Horizon Glint (narrow width, zero harsh line) */}
        <div
          className="w-full h-8 sm:h-9 pointer-events-none"
          style={{
            background: isDark
              ? "radial-gradient(ellipse 20% 100% at 50% 0%, rgba(255, 255, 255, 0.02) 0%, transparent 100%)"
              : "linear-gradient(180deg, #060709 0%, rgba(6, 7, 9, 0.45) 40%, rgba(255, 255, 255, 0.7) 85%, #ffffff 100%)",
          }}
        />
      </div>

      {/* Subtle Background Radial Light Diffuser (tightly focused, low noise) */}
      <div
        className="absolute top-0 inset-x-0 h-40 pointer-events-none opacity-30 transition-opacity duration-300"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 24% 60% at 50% 0%, rgba(30, 41, 59, 0.25) 0%, transparent 100%)"
            : "radial-gradient(ellipse 35% 60% at 50% 0%, rgba(241, 245, 249, 0.8) 0%, transparent 100%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* ================================================================= */}
          {/* LEFT COLUMN: HERO PRODUCT COPY & CTA                              */}
          {/* ================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col justify-center"
          >
            {/* Eyebrow: Minimalist Architectural Light Sweep */}
            <div className="mb-2 sm:mb-2.5">
              <span className="text-[9.5px] sm:text-[10px] font-medium uppercase tracking-[0.24em] inline-block animate-luxury-shimmer select-none">
                INTRODUCING
              </span>
            </div>

            {/* Headline: Clean, airy editorial typography matching Agent & Hero */}
            <h2 className="text-[clamp(2.25rem,3.6vw,3.85rem)] font-light tracking-[-0.03em] leading-[0.98]">
              <div className="mb-[0.20em] leading-none">
                <span className="sr-only">MAYA</span>
                <MayaWordmark
                  className="h-[0.78em] sm:h-[0.80em] w-auto block transition-all"
                  gradient={true}
                  isDark={isDark}
                />
              </div>
              <div
                className={`transition-colors ${
                  isDark ? "text-[#586072]" : "text-[#64748B]"
                }`}
              >
                Voice Receptionist
              </div>
            </h2>

            {/* Value Proposition Paragraph */}
            <p
              className={`mt-3 sm:mt-3.5 lg:mt-4 text-[13px] sm:text-[13.5px] lg:text-[14px] leading-[1.6] font-normal max-w-[430px] transition-colors ${
                isDark ? "text-[#9ca3af]" : "text-[#475569]"
              }`}
            >
              Answers calls, understands intent, qualifies callers, books
              appointments, and keeps your business moving — 24/7.
            </p>

            {/* CTA Button matching Agent window discipline */}
            <div className="flex items-center my-5 sm:my-6">
              <a
                href="#action"
                className={`group inline-flex items-center gap-2 px-5 py-2 sm:px-5.5 sm:py-2.5 rounded-full font-medium text-[12.5px] active:scale-[0.98] transition-all duration-300 shadow-sm ${
                  isDark
                    ? "bg-white text-black hover:bg-neutral-100"
                    : "bg-[#0B0F17] text-white hover:bg-[#1E293B]"
                }`}
              >
                <span>See it in action</span>
                <span className="text-[12.5px] leading-none transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </a>
            </div>
          </motion.div>

          {/* ================================================================= */}
          {/* RIGHT COLUMN: SLEEK WINDOW FRAME & LUMINOUS VOICE CORE             */}
          {/* ================================================================= */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 24 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex justify-center lg:justify-end w-full"
          >
            <div
              className={`relative w-full max-w-[620px] aspect-[16/10.5] rounded-2xl sm:rounded-3xl border overflow-hidden flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${
                isDark
                  ? "bg-[#050608] border-white/[0.08] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95),0_0_1px_1px_rgba(255,255,255,0.06)]"
                  : "bg-[#080A10] border-slate-300/80 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.18),0_2px_8px_rgba(15,23,42,0.04)]"
              }`}
            >
              <MayaReceptionistVisualizer />
            </div>
          </motion.div>
        </div>

        {/* ================================================================= */}
        {/* SECTION DIVIDER: Exactly matching line above "WHAT MAYA HANDLES"  */}
        {/* ================================================================= */}
        <div
          className={`mt-20 sm:mt-24 lg:mt-28 border-t ${isDark ? "border-white/[0.08]" : "border-[#E2E8F0]"
            }`}
        />
      </div>
    </section>
  );
}
