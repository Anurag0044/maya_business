"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

import WorkspaceHeader from "./WorkspaceHeader";
import WorkspaceSidebar from "./WorkspaceSidebar";
import WorkspaceMetricCards from "./WorkspaceMetricCards";
import WorkspaceLeadSourceChart from "./WorkspaceLeadSourceChart";
import WorkspaceAppointmentTrendChart from "./WorkspaceAppointmentTrendChart";
import WorkspaceRecentView from "./WorkspaceRecentView";
import WorkspaceRightRail from "./WorkspaceRightRail";

export default function WorkspaceDashboard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div
      className={`h-screen max-h-screen min-h-screen w-full flex flex-col font-sans transition-colors duration-300 selection:bg-neutral-500/20 overflow-hidden ${
        isDark ? "bg-[#060709] text-white" : "bg-[#FFFFFF] text-[#0F172A]"
      }`}
    >
      {/* 1. Fixed Top Navigation Bar */}
      <WorkspaceHeader />

      {/* 2. Main 3-Column Workspace Frame (Strict 100vh Fill, Zero Scroll) */}
      <div className="flex-1 w-full flex relative overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <WorkspaceSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Center Canvas & Right Rail Container */}
        <main className="flex-1 min-w-0 h-full p-3.5 sm:p-4 lg:p-5 flex flex-col lg:flex-row gap-4.5 overflow-hidden min-h-0">
          {/* Center Main Stage */}
          <div className="flex-1 min-w-0 h-full flex flex-col justify-between gap-3 overflow-hidden min-h-0">
            <AnimatePresence mode="wait">
              {activeTab === "recent" ? (
                <WorkspaceRecentView
                  key="recent-view"
                  onBackToOverview={() => setActiveTab("home")}
                />
              ) : (
                <motion.div
                  key="home-overview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 min-w-0 h-full flex flex-col justify-between gap-3.5 overflow-hidden min-h-0"
                >
                  {/* Header Greeting Banner */}
                  <div className="flex items-center justify-between gap-3 select-none shrink-0">
                    <div>
                      <span className="text-[9px] font-medium uppercase tracking-[0.24em] inline-block animate-luxury-shimmer select-none">
                        GOOD MORNING
                      </span>
                      <div className="flex items-baseline gap-2.5 mt-0.5">
                        <h1
                          className={`text-[20px] sm:text-[22px] font-light tracking-[-0.03em] leading-tight ${
                            isDark ? "text-white" : "text-[#0B0F17]"
                          }`}
                        >
                          Sujal <span className="inline-block animate-wave origin-bottom-right">👋</span>
                        </h1>
                        <span
                          className={`text-[12px] font-normal hidden sm:inline ${
                            isDark ? "text-[#9ca3af]" : "text-[#64748B]"
                          }`}
                        >
                          Here&apos;s what&apos;s happening at your front desk today.
                        </span>
                      </div>
                    </div>

                    {/* Actions Row: Luxury Industrial Recent Button on the left of Monday date badge */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveTab("recent")}
                        title="Recent activities & telemetry feed"
                        className={`group relative h-8.5 w-8.5 sm:h-9 sm:w-9 rounded-full border flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-95 ${
                          isDark
                            ? "bg-gradient-to-b from-[#161c28]/90 via-[#0e131e]/90 to-[#090d15]/95 border-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),0_4px_16px_rgba(0,0,0,0.4)] hover:border-white/30 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),0_0_20px_rgba(56,189,248,0.25)] hover:scale-105"
                            : "bg-gradient-to-b from-white to-[#F8FAFC] border-slate-200/90 text-slate-700 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_2px_8px_rgba(15,23,42,0.06)] hover:border-slate-300 hover:shadow-md hover:scale-105"
                        }`}
                      >
                        <Clock
                          className={`w-4 h-4 transition-all duration-300 group-hover:rotate-12 stroke-[1.8] ${
                            isDark
                              ? "text-neutral-300 group-hover:text-white"
                              : "text-slate-600 group-hover:text-[#0F172A]"
                          }`}
                        />
                        {/* Jewel Live Status Indicator */}
                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2 pointer-events-none">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"></span>
                        </span>
                      </button>

                      {/* Precision Luxury Monday Date Badge */}
                      <div
                        className={`inline-flex items-center gap-2 h-8.5 sm:h-9 px-3.5 rounded-full border text-[11.5px] font-medium shrink-0 transition-all ${
                          isDark
                            ? "bg-gradient-to-b from-[#141924]/80 to-[#0a0e17]/85 border-white/[0.1] text-white/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_4px_16px_rgba(0,0,0,0.25)]"
                            : "bg-gradient-to-b from-white to-[#F8FAFC] border-[#E2E8F0] text-slate-700 shadow-2xs"
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5 text-sky-400/80 stroke-[1.8]" />
                        <span className="tracking-tight font-normal">Mon, 22 Sep 2025</span>
                      </div>
                    </div>
                  </div>

                  {/* 4 KPI Top Cards */}
                  <WorkspaceMetricCards />

                  {/* Analytics Row: Lead Source (Donut) & Appointment Trend (Spline) taking full remaining height */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 flex-1 min-h-0">
                    <WorkspaceLeadSourceChart />
                    <WorkspaceAppointmentTrendChart />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Rail: System Status, Upcoming Appointments & Mountain AI Promotion */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-76 xl:w-80 shrink-0 h-full min-h-0"
          >
            <WorkspaceRightRail />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
