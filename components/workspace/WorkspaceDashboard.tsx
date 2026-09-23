"use client";

import React, { useState, useEffect } from "react";
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
  const [greeting, setGreeting] = useState("Good morning");
  const [dateStr, setDateStr] = useState("Mon, 22 Sep 2025");
  const [isAgentChatOpen, setIsAgentChatOpen] = useState(false);

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 5 && hour < 12) setGreeting("Good morning");
    else if (hour >= 12 && hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    setDateStr(
      new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(now)
    );
  }, []);

  return (
    <div
      className={`h-screen max-h-screen min-h-screen w-full flex flex-col font-sans transition-colors duration-300 selection:bg-neutral-500/20 overflow-hidden ${isDark ? "bg-[#060709] text-white" : "bg-[#FFFFFF] text-[#0F172A]"
        }`}
    >
      {/* 1. Fixed Top Navigation Bar */}
      <WorkspaceHeader
        isAgentChatOpen={isAgentChatOpen}
        onToggleAgentChat={() => setIsAgentChatOpen((prev) => !prev)}
      />

      {/* 2. Main 3-Column Workspace Frame (Strict 100vh Fill, Zero Scroll) */}
      <div className="flex-1 w-full flex relative overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <WorkspaceSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onTalkToMaya={() => {
            setIsAgentChatOpen(true);
            setActiveTab("conversations");
          }}
        />

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
                  <div className="flex items-center justify-between gap-4 select-none shrink-0">
                    <div>
                      <h1
                        className={`text-[23px] sm:text-[25px] font-light tracking-[-0.03em] leading-tight ${isDark ? "text-white" : "text-[#0B0F17]"
                          }`}
                      >
                        {greeting}, Sujal.
                      </h1>
                      <p
                        className={`text-[12.5px] sm:text-[13px] font-normal leading-normal mt-1 ${isDark ? "text-[#9ca3af]" : "text-[#64748B]"
                          }`}
                      >
                        Here&apos;s what&apos;s happening with your workspace today.
                      </p>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center gap-2 shrink-0">
                      <motion.button
                        type="button"
                        onClick={() => setActiveTab("recent")}
                        title="Recent activity"
                        whileHover="hover"
                        whileTap={{ scale: 0.95 }}
                        className={`group relative h-8.5 w-8.5 rounded-full border flex items-center justify-center transition-colors duration-200 cursor-pointer ${isDark
                            ? "bg-white/[0.04] border-white/[0.08] text-neutral-300 hover:text-white hover:bg-white/[0.08] hover:border-white/15"
                            : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 shadow-2xs"
                          }`}
                      >
                        <motion.div
                          variants={{
                            hover: { rotate: 360, scale: 1.15 },
                          }}
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          className="flex items-center justify-center"
                        >
                          <Clock className="w-3.5 h-3.5 stroke-[1.8]" />
                        </motion.div>
                      </motion.button>

                      {/* Date Badge */}
                      <div
                        className={`inline-flex items-center gap-2 h-8.5 px-3 rounded-full border text-[11.5px] font-normal tracking-tight shrink-0 transition-all ${isDark
                            ? "bg-white/[0.04] border-white/[0.08] text-neutral-300"
                            : "bg-white border-slate-200 text-slate-700 shadow-2xs"
                          }`}
                      >
                        <Calendar className={`w-3.5 h-3.5 stroke-[1.8] ${isDark ? "text-neutral-400" : "text-slate-500"}`} />
                        <span>{dateStr}</span>
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

          {/* Right Rail: MAYA Autonomous Agent Copilot Window with Above Toggle Bar */}
          <AnimatePresence initial={false}>
            {isAgentChatOpen && (
              <motion.div
                key="agent-chat-rail"
                initial={{ opacity: 0, x: 20, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 340 }}
                exit={{ opacity: 0, x: 20, width: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="w-[340px] shrink-0 h-full min-h-0 overflow-hidden select-none"
              >
                <div className="w-[340px] h-full overflow-hidden shrink-0">
                  <WorkspaceRightRail onClose={() => setIsAgentChatOpen(false)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
