"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

import WorkspaceHeader from "./WorkspaceHeader";
import WorkspaceSidebar from "./WorkspaceSidebar";
import WorkspaceMetricCards from "./WorkspaceMetricCards";
import WorkspaceLeadSourceChart from "./WorkspaceLeadSourceChart";
import WorkspaceAppointmentTrendChart from "./WorkspaceAppointmentTrendChart";
import WorkspaceLeadsTable from "./WorkspaceLeadsTable";
import WorkspaceActivityTimeline from "./WorkspaceActivityTimeline";
import WorkspaceRightRail from "./WorkspaceRightRail";
import WorkspaceAIPromptBar from "./WorkspaceAIPromptBar";

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
        <main className="flex-1 min-w-0 h-full p-3.5 sm:p-4 lg:p-4.5 flex flex-col lg:flex-row gap-4 overflow-hidden min-h-0 pb-14 sm:pb-15">
          {/* Center Main Stage */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 min-w-0 h-full flex flex-col justify-between gap-3 overflow-hidden min-h-0"
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

              {/* Date Badge */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium shrink-0 transition-all ${
                  isDark
                    ? "bg-[#0b0e16]/80 border-white/[0.08] text-[#8e95a5]"
                    : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] shadow-2xs"
                }`}
              >
                <Calendar className="w-3 h-3 opacity-60" />
                <span>Mon, 22 Sep 2025</span>
              </div>
            </div>

            {/* 4 KPI Top Cards */}
            <WorkspaceMetricCards />

            {/* Analytics Middle Row: Lead Source (Donut) & Appointment Trend (Spline) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 flex-1 min-h-0">
              <WorkspaceLeadSourceChart />
              <WorkspaceAppointmentTrendChart />
            </div>

            {/* Operational Bottom Row: Recent Leads Table & Recent Activity Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 flex-1 min-h-0">
              <WorkspaceLeadsTable />
              <WorkspaceActivityTimeline />
            </div>
          </motion.div>

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

      {/* 3. Floating Bottom AI Prompt Dock */}
      <WorkspaceAIPromptBar />
    </div>
  );
}
