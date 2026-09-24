"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Users,
  Calendar,
  CheckCircle2,
  BarChart2,
  TrendingUp,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import MayaWorkspaceAnimation from "./MayaWorkspaceAnimation";
import MayaWordmark from "./MayaWordmark";

export default function MayaAgentShowcase() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      id="maya-agent-showcase"
      className={`relative w-full py-16 sm:py-24 lg:py-32 overflow-hidden font-sans transition-colors duration-300 ${isDark
        ? "bg-[#060709] text-white selection:bg-neutral-800"
        : "bg-[#FFFFFF] text-[#0F172A] selection:bg-neutral-200"
        }`}
    >
      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
        {/* ================================================================= */}
        {/* 1. TOP HERO & FLOATING APP WINDOW (SPLIT 2-COLUMN)               */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column (Desktop): Floating Realistic Web App Window */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 order-2 lg:order-1 w-full"
          >
            <MayaWorkspaceAnimation isDark={isDark} />
          </motion.div>

          {/* Right Column (Desktop): Hero Typography & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 order-1 lg:order-2 flex flex-col justify-center lg:pl-3 xl:pl-6"
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
                className={`block transition-colors ${isDark ? "text-white" : "text-[#0B0F17]"
                  }`}
              >
                Your always-on
              </span>
              <span
                className={`block transition-colors ${isDark ? "text-[#586072]" : "text-[#64748B]"
                  }`}
              >
                business agent.
              </span>
            </h2>

            {/* Value Proposition Paragraph */}
            <p
              className={`mt-3 sm:mt-3.5 lg:mt-4 text-[13px] sm:text-[13.5px] lg:text-[14px] leading-[1.6] font-normal max-w-[430px] transition-colors ${isDark ? "text-[#9ca3af]" : "text-[#475569]"
                }`}
            >
              MAYA understands, communicates and takes action across your
              business — handling conversations, creating leads, scheduling
              appointments and keeping follow-ups on track.
            </p>

            {/* CTA: Explore MAYA Agent with Authentic Brand Wordmark Typography */}
            <div className="flex items-center my-5 sm:my-6">
              <a
                href="#get-started"
                className={`group inline-flex items-center gap-2 px-5 py-2 sm:px-5.5 sm:py-2.5 rounded-full font-medium text-[12.5px] active:scale-[0.98] transition-all duration-300 shadow-sm ${isDark
                    ? "bg-white text-black hover:bg-neutral-100"
                    : "bg-[#0B0F17] text-white hover:bg-[#1E293B]"
                  }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span>Explore</span>
                  <MayaWordmark className="h-2.5 sm:h-[11px] w-auto text-current" />
                  <span>Agent</span>
                </span>
                <span className="text-[12.5px] leading-none transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </a>
            </div>
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
    </section>
  );
}
