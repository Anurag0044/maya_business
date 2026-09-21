"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Play,
  Phone,
  Users,
  Calendar,
  CheckCircle2,
  BarChart2,
  TrendingUp,
  X,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import MayaWorkspaceAnimation from "./MayaWorkspaceAnimation";

export default function MayaAgentShowcase() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <section
      id="maya-agent-showcase"
      className={`relative w-full py-16 sm:py-24 lg:py-32 overflow-hidden font-sans transition-colors duration-300 ${isDark
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
        {/* ================================================================= */}
        {/* 1. TOP HERO & FLOATING APP WINDOW (SPLIT 2-COLUMN)               */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Hero Typography & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col justify-center"
          >
            {/* Eyebrow: Minimalist Architectural Light Sweep */}
            <div className="mb-2.5 sm:mb-3">
              <span className="text-[9.5px] sm:text-[10px] font-medium uppercase tracking-[0.24em] inline-block animate-luxury-shimmer select-none">
                MEET MAYA
              </span>
            </div>

            {/* Headline: Clean, airy editorial typography matching Hero */}
            <h2 className="text-[clamp(2.25rem,3.6vw,3.85rem)] font-light tracking-[-0.03em] leading-[0.98]">
              <span
                className={`block transition-colors ${
                  isDark ? "text-white" : "text-[#0B0F17]"
                }`}
              >
                Your always-on
              </span>
              <span
                className={`block transition-colors ${
                  isDark ? "text-[#586072]" : "text-[#64748B]"
                }`}
              >
                business agent.
              </span>
            </h2>

            {/* Value Proposition Paragraph */}
            <p
              className={`mt-3 sm:mt-3.5 lg:mt-4 text-[13px] sm:text-[13.5px] lg:text-[14px] leading-[1.6] font-normal max-w-[430px] transition-colors ${
                isDark ? "text-[#9ca3af]" : "text-[#475569]"
              }`}
            >
              MAYA understands, communicates and takes action across your
              business — handling conversations, creating leads, scheduling
              appointments and keeping follow-ups on track.
            </p>

            {/* CTAs Row: Identical proportions, weights and transitions */}
            <div className="flex items-center gap-5 sm:gap-6 my-5 sm:my-6">
              {/* Primary CTA Button */}
              <a
                href="#get-started"
                className={`group inline-flex items-center gap-2 px-5 py-2 sm:px-5.5 sm:py-2.5 rounded-full font-medium text-[12.5px] active:scale-[0.98] transition-all duration-300 shadow-sm ${
                  isDark
                    ? "bg-white text-black hover:bg-neutral-100"
                    : "bg-[#0B0F17] text-white hover:bg-[#1E293B]"
                }`}
              >
                <span>Get started</span>
                <span className="text-[12.5px] leading-none transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </a>

              {/* Secondary Video CTA */}
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(true)}
                className="group flex items-center gap-3 text-left focus:outline-none cursor-pointer"
              >
                <div
                  className={`w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center transition-all duration-300 ${
                    isDark
                      ? "border-white/15 bg-white/[0.04] text-white group-hover:border-white/35 group-hover:bg-white/[0.08]"
                      : "border-black/10 bg-black/[0.03] text-black group-hover:border-black/25 group-hover:bg-black/[0.06]"
                  }`}
                >
                  <svg
                    className="w-2.5 h-2.5 fill-current ml-0.5"
                    viewBox="0 0 24 24"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-[12.5px] font-medium transition-colors ${
                      isDark
                        ? "text-white group-hover:text-white/90"
                        : "text-[#0F172A] group-hover:text-black"
                    }`}
                  >
                    See MAYA in action
                  </span>
                  <span className="text-[10.5px] text-[#717682] font-normal leading-none mt-0.5">
                    2 min
                  </span>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Right Column: Floating Realistic Web App Window */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <MayaWorkspaceAnimation isDark={isDark} />
          </motion.div>
        </div>

        {/* ================================================================= */}
        {/* 2. MIDDLE ROW - "WHAT MAYA HANDLES FOR YOU" (5 COLUMNS)          */}
        {/* ================================================================= */}
        <div
          className={`mt-20 sm:mt-24 lg:mt-28 pt-12 sm:pt-16 border-t ${isDark ? "border-white/[0.08]" : "border-[#E2E8F0]"
            }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-10 items-start">
            {/* Column 1: Header / Title */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
              className="md:col-span-1"
            >
              <span className="text-[9.5px] sm:text-[10px] font-medium uppercase tracking-[0.24em] inline-block animate-luxury-shimmer select-none">
                WHAT MAYA HANDLES FOR YOU
              </span>
              <h3
                className={`text-[clamp(1.5rem,2.1vw,2.15rem)] font-light tracking-[-0.03em] leading-[1.12] mt-3 ${isDark ? "text-white" : "text-[#0B0F17]"
                  }`}
              >
                Conversations into{" "}
                <span className={isDark ? "text-[#586072]" : "text-[#64748B]"}>
                  real business outcomes.
                </span>
              </h3>
            </motion.div>

            {/* Column 2: Handles Calls */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="md:col-span-1 flex flex-col"
            >
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3.5 shadow-2xs transition-colors ${isDark
                  ? "bg-[#121622] border-white/[0.08] text-white"
                  : "bg-[#F1F5F9] border-[#E2E8F0]/80 text-[#0F172A]"
                  }`}
              >
                <Phone className="w-4 h-4" />
              </div>
              <h4
                className={`text-[14px] sm:text-[14.5px] font-medium tracking-[-0.015em] ${isDark ? "text-white" : "text-[#0F172A]"
                  }`}
              >
                Handles Calls
              </h4>
              <p
                className={`mt-1.5 text-[12.5px] sm:text-[13px] leading-[1.6] font-normal ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                  }`}
              >
                Answers naturally, captures leads and provides instant
                information.
              </p>
            </motion.div>

            {/* Column 3: Books Appointments */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.16 }}
              className="md:col-span-1 flex flex-col"
            >
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3.5 shadow-2xs transition-colors ${isDark
                  ? "bg-[#121622] border-white/[0.08] text-white"
                  : "bg-[#F1F5F9] border-[#E2E8F0]/80 text-[#0F172A]"
                  }`}
              >
                <Calendar className="w-4 h-4" />
              </div>
              <h4
                className={`text-[14px] sm:text-[14.5px] font-medium tracking-[-0.015em] ${isDark ? "text-white" : "text-[#0F172A]"
                  }`}
              >
                Books Appointments
              </h4>
              <p
                className={`mt-1.5 text-[12.5px] sm:text-[13px] leading-[1.6] font-normal ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                  }`}
              >
                Schedules, reschedules and keeps your calendar in sync.
              </p>
            </motion.div>

            {/* Column 4: Qualifies Leads */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.24 }}
              className="md:col-span-1 flex flex-col"
            >
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3.5 shadow-2xs transition-colors ${isDark
                  ? "bg-[#121622] border-white/[0.08] text-white"
                  : "bg-[#F1F5F9] border-[#E2E8F0]/80 text-[#0F172A]"
                  }`}
              >
                <Users className="w-4 h-4" />
              </div>
              <h4
                className={`text-[14px] sm:text-[14.5px] font-medium tracking-[-0.015em] ${isDark ? "text-white" : "text-[#0F172A]"
                  }`}
              >
                Qualifies Leads
              </h4>
              <p
                className={`mt-1.5 text-[12.5px] sm:text-[13px] leading-[1.6] font-normal ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                  }`}
              >
                Understands intent, filters leads and organizes them
                automatically.
              </p>
            </motion.div>

            {/* Column 5: Provides Insights */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.32 }}
              className="md:col-span-1 flex flex-col"
            >
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3.5 shadow-2xs transition-colors ${isDark
                  ? "bg-[#121622] border-white/[0.08] text-white"
                  : "bg-[#F1F5F9] border-[#E2E8F0]/80 text-[#0F172A]"
                  }`}
              >
                <BarChart2 className="w-4 h-4" />
              </div>
              <h4
                className={`text-[14px] sm:text-[14.5px] font-medium tracking-[-0.015em] ${isDark ? "text-white" : "text-[#0F172A]"
                  }`}
              >
                Provides Insights
              </h4>
              <p
                className={`mt-1.5 text-[12.5px] sm:text-[13px] leading-[1.6] font-normal ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                  }`}
              >
                Turns every conversation into actionable analytics and growth
                opportunities.
              </p>
            </motion.div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3. BOTTOM ROW - "REAL BUSINESS IMPACT" (STATS BAND)              */}
        {/* ================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className={`mt-16 sm:mt-20 pt-10 pb-4 border-t flex flex-col md:flex-row items-baseline justify-between gap-8 sm:gap-10 ${isDark ? "border-white/[0.08]" : "border-[#E2E8F0]"
            }`}
        >
          {/* Label Header */}
          <div className="md:w-52 shrink-0">
            <span className="text-[9.5px] sm:text-[10px] font-medium uppercase tracking-[0.24em] inline-block animate-luxury-shimmer select-none">
              REAL BUSINESS IMPACT
            </span>
          </div>

          {/* Stat 1: 3x */}
          <div
            className={`flex-1 border-l-0 md:border-l md:pl-8 lg:pl-10 ${isDark ? "md:border-white/[0.08]" : "md:border-[#E2E8F0]"
              }`}
          >
            <div
              className={`text-[clamp(2.4rem,3.6vw,3.5rem)] font-light tracking-[-0.03em] leading-none mb-1.5 ${isDark ? "text-white" : "text-[#0B0F17]"
                }`}
            >
              3×
            </div>
            <div
              className={`text-[11.5px] sm:text-[12px] font-normal leading-tight ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                }`}
            >
              More conversions
            </div>
          </div>

          {/* Stat 2: 70% */}
          <div
            className={`flex-1 border-l-0 md:border-l md:pl-8 lg:pl-10 ${isDark ? "md:border-white/[0.08]" : "md:border-[#E2E8F0]"
              }`}
          >
            <div
              className={`text-[clamp(2.4rem,3.6vw,3.5rem)] font-light tracking-[-0.03em] leading-none mb-1.5 ${isDark ? "text-white" : "text-[#0B0F17]"
                }`}
            >
              70%
            </div>
            <div
              className={`text-[11.5px] sm:text-[12px] font-normal leading-tight ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                }`}
            >
              Less manual work
            </div>
          </div>

          {/* Stat 3: 24/7 */}
          <div
            className={`flex-1 border-l-0 md:border-l md:pl-8 lg:pl-10 ${isDark ? "md:border-white/[0.08]" : "md:border-[#E2E8F0]"
              }`}
          >
            <div
              className={`text-[clamp(2.4rem,3.6vw,3.5rem)] font-light tracking-[-0.03em] leading-none mb-1.5 ${isDark ? "text-white" : "text-[#0B0F17]"
                }`}
            >
              24/7
            </div>
            <div
              className={`text-[11.5px] sm:text-[12px] font-normal leading-tight ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                }`}
            >
              Always on
            </div>
          </div>

          {/* Right Text Cap: RESULTS THAT SPEAK. */}
          <div
            className={`md:w-40 shrink-0 border-l-0 md:border-l md:pl-8 flex md:justify-end ${isDark ? "md:border-white/[0.08]" : "md:border-[#E2E8F0]"
              }`}
          >
            <span
              className={`text-[8.5px] sm:text-[9px] font-normal uppercase tracking-[0.24em] leading-[1.8] md:text-right select-none ${isDark ? "text-neutral-400/80" : "text-[#64748B]"
                }`}
            >
              RESULTS
              <br />
              THAT
              <br />
              SPEAK.
            </span>
          </div>
        </motion.div>
      </div>

      {/* Interactive Modal for "See MAYA in action" */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsVideoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border ${isDark
                ? "bg-[#0E1118] border-white/[0.1] text-white"
                : "bg-white border-[#E2E8F0] text-[#0F172A]"
                }`}
            >
              {/* Modal Header */}
              <div
                className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-white/[0.08]" : "border-[#E2E8F0]"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles
                    className={`w-4 h-4 ${isDark ? "text-white" : "text-[#0F172A]"
                      }`}
                  />
                  <span
                    className={`font-medium text-[13px] sm:text-[13.5px] tracking-tight ${isDark ? "text-white" : "text-[#0F172A]"
                      }`}
                  >
                    MAYA in Action • 2 Min Product Overview
                  </span>
                </div>
                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${isDark
                    ? "text-[#94A3B8] hover:text-white hover:bg-white/[0.08]"
                    : "text-[#64748B] hover:text-black hover:bg-[#F1F5F9]"
                    }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div
                className={`p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-4 ${isDark ? "bg-[#07090E]" : "bg-[#F8FAFC]"
                  }`}
              >
                <div
                  className={`w-16 h-16 rounded-full border shadow-sm flex items-center justify-center ${isDark
                    ? "bg-white/[0.08] border-white/[0.12] text-white"
                    : "bg-white border-[#E2E8F0] text-[#0F172A]"
                    }`}
                >
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </div>
                <div>
                  <h4
                    className={`text-[16px] sm:text-[17px] font-light tracking-[-0.02em] ${isDark ? "text-white" : "text-[#0F172A]"
                      }`}
                  >
                    Interactive MAYA Agent Walkthrough
                  </h4>
                  <p
                    className={`text-[12.5px] sm:text-[13px] leading-[1.6] font-normal mt-1 max-w-md ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                      }`}
                  >
                    Watch how MAYA autonomously answers incoming inquiries,
                    qualifies leads with tailored intelligence, and books directly
                    into your calendar.
                  </p>
                </div>
                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  className={`mt-2 px-5.5 py-2 sm:py-2.5 rounded-full text-[12.5px] font-medium transition-colors cursor-pointer shadow-sm ${isDark
                    ? "bg-white hover:bg-neutral-200 text-black"
                    : "bg-[#0F172A] hover:bg-black text-white"
                    }`}
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
