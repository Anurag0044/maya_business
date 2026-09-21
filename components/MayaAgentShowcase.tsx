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
  Settings,
  Mic,
  Send,
  TrendingUp,
  Home,
  X,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function MayaAgentShowcase() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState("Home");
  const [inputValue, setInputValue] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: "maya" | "user"; text: string; time?: string }>
  >([
    {
      sender: "maya",
      text: "I've handled 3 new calls, qualified 2 leads and scheduled 1 appointment. Would you like to see the details?",
    },
  ]);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    setInputValue("");
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);

    // Authentic contextual agent reply
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "maya",
          text: "I've logged that request. Updating lead qualifications and syncing your calendar now.",
        },
      ]);
    }, 650);
  };

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
            <div
              className={`relative rounded-2xl sm:rounded-3xl border overflow-hidden flex flex-col md:flex-row transition-colors duration-300 ${isDark
                ? "bg-[#0B0D13]/95 border-white/[0.08] shadow-[0_24px_70px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl"
                : "bg-white border-[#E2E8F0] shadow-[0_24px_60px_-12px_rgba(15,23,42,0.10),0_2px_8px_rgba(15,23,42,0.04)]"
                }`}
            >
              {/* Sidebar Component */}
              <div
                className={`w-full md:w-44 border-b md:border-b-0 md:border-r p-4 flex md:flex-col justify-between shrink-0 transition-colors duration-300 ${isDark
                  ? "bg-[#0E1118]/85 border-white/[0.07]"
                  : "bg-[#F8FAFC] border-[#E2E8F0]"
                  }`}
              >
                <div className="flex md:flex-col w-full gap-5">
                  {/* Brand Mark Icon in Sidebar */}
                  <div className="flex items-center px-1.5 py-1">
                    <svg
                      viewBox="25 80 460 350"
                      className="h-6 w-auto"
                      shapeRendering="geometricPrecision"
                      aria-hidden="true"
                    >
                      <path
                        d="M 29 427 L 144 373 L 361 85 Q 215 245 29 427 Z"
                        fill={isDark ? "#FFFFFF" : "#0F172A"}
                      />
                      <path
                        d="M 184 388 L 328 214 L 328 259 Z"
                        fill={isDark ? "#64748B" : "#475569"}
                      />
                      <path
                        d="M 328 214 L 482 420 L 328 259 Z"
                        fill={isDark ? "#FFFFFF" : "#0F172A"}
                      />
                    </svg>
                  </div>

                  {/* Navigation List */}
                  <nav className="flex md:flex-col gap-1 w-full overflow-x-auto md:overflow-visible">
                    {[
                      { id: "Home", label: "Home", icon: Home },
                      { id: "Calls", label: "Calls", icon: Phone },
                      { id: "Leads", label: "Leads", icon: Users },
                      {
                        id: "Appointments",
                        label: "Appointments",
                        icon: Calendar,
                      },
                      {
                        id: "Follow-ups",
                        label: "Follow-ups",
                        icon: CheckCircle2,
                      },
                      { id: "Insights", label: "Insights", icon: BarChart2 },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          type="button"
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all text-left whitespace-nowrap cursor-pointer ${isActive
                            ? isDark
                              ? "bg-white/[0.12] text-white border border-white/[0.12] shadow-2xs"
                              : "bg-[#E2E8F0] text-[#0F172A] shadow-2xs"
                            : isDark
                              ? "text-[#94A3B8] hover:text-white hover:bg-white/[0.05]"
                              : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
                            }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Bottom Settings Link */}
                <div
                  className={`hidden md:flex pt-4 border-t ${isDark ? "border-white/[0.07]" : "border-[#E2E8F0]"
                    }`}
                >
                  <button
                    type="button"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium w-full text-left transition-colors cursor-pointer ${isDark
                      ? "text-[#94A3B8] hover:text-white hover:bg-white/[0.05]"
                      : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
                      }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>

              {/* Main Dashboard Stage */}
              <div
                className={`flex-1 p-5 sm:p-6 flex flex-col gap-4 transition-colors duration-300 ${isDark ? "bg-[#0B0D13]/60" : "bg-[#FFFFFF]"
                  }`}
              >
                {/* Header Greeting & Live Timestamp */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3
                      className={`text-[15.5px] sm:text-[16.5px] font-medium tracking-tight ${isDark ? "text-white" : "text-[#0F172A]"
                        }`}
                    >
                      Good morning, Sujal.
                    </h3>
                    <p
                      className={`text-[11.5px] sm:text-[12px] mt-0.5 font-normal ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                        }`}
                    >
                      Here&apos;s what&apos;s happening today.
                    </p>
                  </div>
                  <div
                    className={`text-[10.5px] sm:text-[11px] font-mono font-normal shrink-0 pt-0.5 ${isDark ? "text-[#64748B]" : "text-[#94A3B8]"
                      }`}
                  >
                    Tue, 24 Jun 2026
                  </div>
                </div>

                {/* KPI Metrics Row (4-Grid) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  {/* Card 1: Calls handled */}
                  <div
                    className={`rounded-xl p-3 flex flex-col justify-between border transition-all ${isDark
                      ? "bg-[#121622]/85 border-white/[0.06] hover:border-white/[0.14]"
                      : "bg-[#F8FAFC] border-[#E2E8F0]/80 hover:border-[#CBD5E1]"
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={`text-[9.5px] sm:text-[10px] font-medium uppercase tracking-[0.14em] ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                          }`}
                      >
                        Calls handled
                      </span>
                      <Phone
                        className={`w-3.5 h-3.5 ${isDark ? "text-[#64748B]" : "text-[#94A3B8]"
                          }`}
                      />
                    </div>
                    <div className="mt-2.5 flex items-baseline justify-between">
                      <span
                        className={`text-[22px] sm:text-[25px] font-light tracking-[-0.03em] leading-none mb-0.5 ${isDark ? "text-white" : "text-[#0F172A]"
                          }`}
                      >
                        24
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-[10px] sm:text-[10.5px] font-medium font-mono text-[#10B981]">
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                      <span>+12%</span>
                    </div>
                  </div>

                  {/* Card 2: Leads qualified */}
                  <div
                    className={`rounded-xl p-3 flex flex-col justify-between border transition-all ${isDark
                      ? "bg-[#121622]/85 border-white/[0.06] hover:border-white/[0.14]"
                      : "bg-[#F8FAFC] border-[#E2E8F0]/80 hover:border-[#CBD5E1]"
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={`text-[9.5px] sm:text-[10px] font-medium uppercase tracking-[0.14em] ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                          }`}
                      >
                        Leads qualified
                      </span>
                      <Users
                        className={`w-3.5 h-3.5 ${isDark ? "text-[#64748B]" : "text-[#94A3B8]"
                          }`}
                      />
                    </div>
                    <div className="mt-2.5 flex items-baseline justify-between">
                      <span
                        className={`text-[22px] sm:text-[25px] font-light tracking-[-0.03em] leading-none mb-0.5 ${isDark ? "text-white" : "text-[#0F172A]"
                          }`}
                      >
                        12
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-[10px] sm:text-[10.5px] font-medium font-mono text-[#10B981]">
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                      <span>+8%</span>
                    </div>
                  </div>

                  {/* Card 3: Appointments */}
                  <div
                    className={`rounded-xl p-3 flex flex-col justify-between border transition-all ${isDark
                      ? "bg-[#121622]/85 border-white/[0.06] hover:border-white/[0.14]"
                      : "bg-[#F8FAFC] border-[#E2E8F0]/80 hover:border-[#CBD5E1]"
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={`text-[9.5px] sm:text-[10px] font-medium uppercase tracking-[0.14em] ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                          }`}
                      >
                        Appointments
                      </span>
                      <Calendar
                        className={`w-3.5 h-3.5 ${isDark ? "text-[#64748B]" : "text-[#94A3B8]"
                          }`}
                      />
                    </div>
                    <div className="mt-2.5 flex items-baseline justify-between">
                      <span
                        className={`text-[22px] sm:text-[25px] font-light tracking-[-0.03em] leading-none mb-0.5 ${isDark ? "text-white" : "text-[#0F172A]"
                          }`}
                      >
                        8
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-[10px] sm:text-[10.5px] font-medium font-mono text-[#10B981]">
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                      <span>+20%</span>
                    </div>
                  </div>

                  {/* Card 4: Conversion rate */}
                  <div
                    className={`rounded-xl p-3 flex flex-col justify-between border transition-all ${isDark
                      ? "bg-[#121622]/85 border-white/[0.06] hover:border-white/[0.14]"
                      : "bg-[#F8FAFC] border-[#E2E8F0]/80 hover:border-[#CBD5E1]"
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={`text-[9.5px] sm:text-[10px] font-medium uppercase tracking-[0.14em] ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                          }`}
                      >
                        Conversion rate
                      </span>
                      <BarChart2
                        className={`w-3.5 h-3.5 ${isDark ? "text-[#64748B]" : "text-[#94A3B8]"
                          }`}
                      />
                    </div>
                    <div className="mt-2.5 flex items-baseline justify-between">
                      <span
                        className={`text-[22px] sm:text-[25px] font-light tracking-[-0.03em] leading-none mb-0.5 ${isDark ? "text-white" : "text-[#0F172A]"
                          }`}
                      >
                        18%
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-[10px] sm:text-[10.5px] font-medium font-mono text-[#10B981]">
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                      <span>+6%</span>
                    </div>
                  </div>
                </div>

                {/* Lower Workspace: Agent Chat Window & Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-1">
                  {/* Left: Active MAYA Chat Bubble & Prompt */}
                  <div
                    className={`rounded-xl p-3.5 flex flex-col justify-between gap-3 border transition-colors ${isDark
                      ? "bg-[#121622]/85 border-white/[0.06]"
                      : "bg-[#F8FAFC] border-[#E2E8F0]/80"
                      }`}
                  >
                    {/* Chat Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg
                          viewBox="25 80 460 350"
                          className="h-3.5 w-auto"
                          shapeRendering="geometricPrecision"
                          aria-hidden="true"
                        >
                          <path
                            d="M 29 427 L 144 373 L 361 85 Q 215 245 29 427 Z"
                            fill={isDark ? "#FFFFFF" : "#0F172A"}
                          />
                          <path
                            d="M 184 388 L 328 214 L 328 259 Z"
                            fill={isDark ? "#64748B" : "#475569"}
                          />
                          <path
                            d="M 328 214 L 482 420 L 328 259 Z"
                            fill={isDark ? "#FFFFFF" : "#0F172A"}
                          />
                        </svg>
                        <span
                          className={`font-medium text-[11.5px] tracking-[0.04em] uppercase ${isDark ? "text-white" : "text-[#0F172A]"
                            }`}
                        >
                          MAYA
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-normal text-[#10B981]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                        <span>Online</span>
                      </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                      {chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`rounded-xl p-2.5 text-[11.5px] leading-relaxed transition-all ${msg.sender === "maya"
                            ? isDark
                              ? "bg-[#1A2130] border border-white/[0.08] text-[#E2E8F0] shadow-2xs"
                              : "bg-white border border-[#E2E8F0]/80 text-[#334155] shadow-2xs"
                            : isDark
                              ? "bg-white text-[#090A0F] font-medium self-end max-w-[85%]"
                              : "bg-[#0F172A] text-white self-end max-w-[85%]"
                            }`}
                        >
                          {msg.text}
                        </div>
                      ))}
                    </div>

                    {/* Prompt Input Form */}
                    <form
                      onSubmit={handleSendMessage}
                      className={`relative rounded-lg px-3 py-1.5 flex items-center justify-between text-[11.5px] border shadow-2xs transition-colors ${isDark
                        ? "bg-[#0B0D13] border-white/[0.1] focus-within:border-white/30"
                        : "bg-white border-[#E2E8F0] focus-within:border-[#94A3B8]"
                        }`}
                    >
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask MAYA anything..."
                        className={`w-full bg-transparent border-none outline-none pr-2 text-[11.5px] ${isDark
                          ? "text-white placeholder:text-[#64748B]"
                          : "text-[#0F172A] placeholder:text-[#94A3B8]"
                          }`}
                      />
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          className={`p-0.5 transition-colors cursor-pointer ${isDark
                            ? "text-[#64748B] hover:text-white"
                            : "text-[#94A3B8] hover:text-[#0F172A]"
                            }`}
                          aria-label="Voice input"
                        >
                          <Mic className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="submit"
                          className={`w-5.5 h-5.5 rounded-md flex items-center justify-center transition-colors cursor-pointer ${isDark
                            ? "bg-white hover:bg-neutral-200 text-black"
                            : "bg-[#0F172A] hover:bg-black text-white"
                            }`}
                          aria-label="Send message"
                        >
                          <Send className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Right: Recent Activity Feed */}
                  <div
                    className={`rounded-xl p-3.5 flex flex-col justify-between border transition-colors ${isDark
                      ? "bg-[#121622]/85 border-white/[0.06]"
                      : "bg-[#F8FAFC] border-[#E2E8F0]/80"
                      }`}
                  >
                    <div
                      className={`flex items-center justify-between pb-1 border-b ${isDark ? "border-white/[0.06]" : "border-[#E2E8F0]/60"
                        }`}
                    >
                      <span
                        className={`text-[11.5px] sm:text-[12px] font-medium tracking-tight ${isDark ? "text-white" : "text-[#0F172A]"
                          }`}
                      >
                        Recent activity
                      </span>
                      <a
                        href="#all-activity"
                        className={`text-[10px] sm:text-[10.5px] font-normal transition-colors flex items-center gap-0.5 ${isDark
                          ? "text-[#94A3B8] hover:text-white"
                          : "text-[#64748B] hover:text-[#0F172A]"
                          }`}
                      >
                        <span>View all</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </a>
                    </div>

                    <div className="flex flex-col gap-2.5 mt-2">
                      {[
                        {
                          icon: Phone,
                          title: "New lead from website",
                          time: "2m ago",
                        },
                        {
                          icon: Calendar,
                          title: "Appointment scheduled",
                          time: "12m ago",
                        },
                        {
                          icon: Users,
                          title: "Lead qualified",
                          time: "18m ago",
                        },
                        {
                          icon: CheckCircle2,
                          title: "Follow-up reminder",
                          time: "1h ago",
                        },
                      ].map((activity, idx) => {
                        const ActivityIcon = activity.icon;
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-[11.5px]"
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-6 h-6 rounded-full border flex items-center justify-center shadow-2xs ${isDark
                                  ? "bg-white/[0.08] border-white/[0.08] text-white"
                                  : "bg-white border-[#E2E8F0] text-[#475569]"
                                  }`}
                              >
                                <ActivityIcon className="w-3 h-3" />
                              </div>
                              <span
                                className={`font-normal ${isDark ? "text-[#E2E8F0]" : "text-[#1E293B]"
                                  }`}
                              >
                                {activity.title}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-mono ${isDark ? "text-[#64748B]" : "text-[#94A3B8]"
                                }`}
                            >
                              {activity.time}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
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
