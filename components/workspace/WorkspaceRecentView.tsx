"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Filter,
  UserPlus,
  PhoneCall,
  CalendarCheck,
  CheckSquare,
  MapPin,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { LeadItem, ActivityItem, LeadStatus } from "./types";

const RECENT_LEADS: LeadItem[] = [
  {
    id: "lead-1",
    initials: "RS",
    name: "Rahul Sharma",
    source: "Website",
    timeAgo: "2 min ago",
    status: "NEW",
  },
  {
    id: "lead-2",
    initials: "PM",
    name: "Priya Mehta",
    source: "WhatsApp",
    timeAgo: "15 min ago",
    status: "CONTACTED",
  },
  {
    id: "lead-3",
    initials: "AP",
    name: "Arjun Patel",
    source: "Phone",
    timeAgo: "32 min ago",
    status: "INTERESTED",
  },
  {
    id: "lead-4",
    initials: "SI",
    name: "Sneha Iyer",
    source: "Walk-in",
    timeAgo: "1 hour ago",
    status: "COUNSELLING",
  },
  {
    id: "lead-5",
    initials: "KV",
    name: "Karan Verma",
    source: "Website",
    timeAgo: "2 hours ago",
    status: "VISITED",
  },
  {
    id: "lead-6",
    initials: "AK",
    name: "Ananya Kapoor",
    source: "Phone",
    timeAgo: "3 hours ago",
    status: "NEW",
  },
  {
    id: "lead-7",
    initials: "VS",
    name: "Vikram Singh",
    source: "Walk-in",
    timeAgo: "4 hours ago",
    status: "CONTACTED",
  },
];

const RECENT_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    type: "lead",
    title: "New lead created",
    detail: "Rahul Sharma via Website",
    timeAgo: "2 min ago",
  },
  {
    id: "act-2",
    type: "call",
    title: "Call completed",
    detail: "Priya Mehta · 04:21 (Admission inquiry)",
    timeAgo: "15 min ago",
  },
  {
    id: "act-3",
    type: "followup",
    title: "Follow-up scheduled",
    detail: "Arjun Patel · Course details checklist",
    timeAgo: "32 min ago",
  },
  {
    id: "act-4",
    type: "status",
    title: "Status updated",
    detail: "Sneha Iyer → Counselling scheduled",
    timeAgo: "1 hour ago",
  },
  {
    id: "act-5",
    type: "appointment",
    title: "Appointment booked",
    detail: "Karan Verma · In-person campus visit",
    timeAgo: "2 hours ago",
  },
  {
    id: "act-6",
    type: "call",
    title: "Inbound call answered",
    detail: "Ananya Kapoor · 02:45 query on fee structure",
    timeAgo: "3 hours ago",
  },
  {
    id: "act-7",
    type: "status",
    title: "Lead qualified",
    detail: "Vikram Singh marked as high intent",
    timeAgo: "4 hours ago",
  },
];

function getStatusBadgeStyle(status: LeadStatus, isDark: boolean) {
  switch (status) {
    case "NEW":
      return isDark
        ? "bg-sky-500/10 text-sky-400 border-sky-500/25"
        : "bg-sky-50 text-sky-700 border-sky-200";
    case "CONTACTED":
      return isDark
        ? "bg-purple-500/10 text-purple-400 border-purple-500/25"
        : "bg-purple-50 text-purple-700 border-purple-200";
    case "INTERESTED":
      return isDark
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
        : "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "COUNSELLING":
      return isDark
        ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
        : "bg-amber-50 text-amber-700 border-amber-200";
    case "VISITED":
      return isDark
        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/25"
        : "bg-cyan-50 text-cyan-700 border-cyan-200";
    default:
      return "bg-white/[0.04] text-white/80 border-white/[0.08]";
  }
}

function getActivityIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "lead":
      return UserPlus;
    case "call":
      return PhoneCall;
    case "followup":
      return CalendarCheck;
    case "status":
      return CheckSquare;
    case "appointment":
      return MapPin;
    default:
      return UserPlus;
  }
}

export default function WorkspaceRecentView({
  onBackToOverview,
}: {
  onBackToOverview: () => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeFilter, setActiveFilter] = useState<"all" | "leads" | "activities">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLeads = RECENT_LEADS.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActivities = RECENT_ACTIVITIES.filter(
    (act) =>
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.detail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 min-w-0 h-full flex flex-col justify-between gap-4 overflow-hidden min-h-0 select-none"
    >
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToOverview}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11.5px] font-medium transition-all duration-200 cursor-pointer ${
              isDark
                ? "bg-[#0b0e16]/80 border-white/[0.08] text-white hover:bg-white/[0.06] hover:border-white/20"
                : "bg-white border-[#E2E8F0] text-slate-800 hover:bg-slate-100 shadow-2xs"
            }`}
            title="Back to Overview"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Overview</span>
          </button>
          <div>
            <span className="text-[9px] font-medium uppercase tracking-[0.24em] inline-block animate-luxury-shimmer">
              LIVE STREAM
            </span>
            <h2
              className={`text-[20px] font-light tracking-[-0.03em] leading-tight ${
                isDark ? "text-white" : "text-[#0B0F17]"
              }`}
            >
              Recent Activities & Leads
            </h2>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex items-center gap-2">
          {/* Quick Filter Segmented Pills */}
          <div
            className={`flex items-center p-0.5 rounded-full border ${
              isDark
                ? "bg-[#0b0e16]/80 border-white/[0.08]"
                : "bg-[#F8FAFC] border-[#E2E8F0]"
            }`}
          >
            {[
              { id: "all", label: "All" },
              { id: "leads", label: "Leads" },
              { id: "activities", label: "Activities" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as typeof activeFilter)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? isDark
                      ? "bg-white text-black font-semibold shadow-sm"
                      : "bg-[#0B0F17] text-white font-semibold shadow-sm"
                    : isDark
                    ? "text-[#8e95a5] hover:text-white"
                    : "text-[#64748B] hover:text-[#0B0F17]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div
            className={`flex items-center h-8 px-2.5 rounded-full border ${
              isDark
                ? "bg-[#0b0e16]/80 border-white/[0.08]"
                : "bg-white border-[#E2E8F0]"
            }`}
          >
            <Search className="w-3 h-3 text-[#6b7280]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter events..."
              className={`w-28 sm:w-36 ml-1.5 bg-transparent text-[11.5px] outline-none ${
                isDark ? "text-white placeholder:text-[#556070]" : "text-[#0F172A] placeholder:text-[#94A3B8]"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Main Content: Split Grid of Recent Leads & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Left: Recent Leads Directory */}
        {(activeFilter === "all" || activeFilter === "leads") && (
          <div
            className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden h-full ${
              activeFilter === "leads" ? "lg:col-span-2" : ""
            } ${
              isDark
                ? "bg-[#0e121b]/85 border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
                : "bg-white border-[#E2E8F0] shadow-xs"
            }`}
          >
            <div
              className={`flex items-center justify-between pb-2.5 border-b shrink-0 ${
                isDark ? "border-white/[0.08]" : "border-[#E2E8F0]"
              }`}
            >
              <h3
                className={`text-[13px] font-medium tracking-[-0.01em] ${
                  isDark ? "text-white" : "text-[#0B0F17]"
                }`}
              >
                Recent Leads Influx
              </h3>
              <span className="text-[11px] font-mono text-[#717682]">
                {filteredLeads.length} leads
              </span>
            </div>

            {/* Leads Table */}
            <div
              className={`divide-y overflow-y-auto no-scrollbar flex-1 min-h-0 mt-1 ${
                isDark ? "divide-white/[0.05]" : "divide-slate-100"
              }`}
            >
              <div
                className={`grid grid-cols-12 py-1.5 px-1 text-[9px] font-medium uppercase tracking-[0.16em] sticky top-0 backdrop-blur-md select-none ${
                  isDark
                    ? "bg-[#0e121b]/95 text-[#717682]"
                    : "bg-white/95 text-[#94A3B8]"
                }`}
              >
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Source</div>
                <div className="col-span-2">Time</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-1 text-right"></div>
              </div>

              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className={`grid grid-cols-12 items-center py-2 px-1 rounded-lg transition-colors ${
                    isDark ? "hover:bg-white/[0.03]" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="col-span-5 flex items-center gap-2 pr-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[9.5px] font-medium shrink-0 border ${
                        isDark
                          ? "bg-[#141a24] text-white/90 border-white/[0.08]"
                          : "bg-[#F1F5F9] text-slate-700 border-[#E2E8F0]"
                      }`}
                    >
                      {lead.initials}
                    </div>
                    <span
                      className={`text-[12px] font-normal truncate ${
                        isDark ? "text-white" : "text-[#0F172A]"
                      }`}
                    >
                      {lead.name}
                    </span>
                  </div>

                  <div
                    className={`col-span-2 text-[11px] truncate ${
                      isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                    }`}
                  >
                    {lead.source}
                  </div>

                  <div
                    className={`col-span-2 text-[10.5px] font-mono whitespace-nowrap ${
                      isDark ? "text-[#717682]" : "text-[#94A3B8]"
                    }`}
                  >
                    {lead.timeAgo}
                  </div>

                  <div className="col-span-2 flex justify-center">
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[8.5px] font-medium tracking-wider border uppercase select-none ${getStatusBadgeStyle(
                        lead.status,
                        isDark
                      )}`}
                    >
                      {lead.status}
                    </span>
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      className={`p-0.5 rounded transition-colors cursor-pointer ${
                        isDark
                          ? "text-[#717682] hover:text-white"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                      title="More actions"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right: Chronological Activity Feed */}
        {(activeFilter === "all" || activeFilter === "activities") && (
          <div
            className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden h-full ${
              activeFilter === "activities" ? "lg:col-span-2" : ""
            } ${
              isDark
                ? "bg-[#0e121b]/85 border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
                : "bg-white border-[#E2E8F0] shadow-xs"
            }`}
          >
            <div
              className={`flex items-center justify-between pb-2.5 border-b shrink-0 ${
                isDark ? "border-white/[0.08]" : "border-[#E2E8F0]"
              }`}
            >
              <h3
                className={`text-[13px] font-medium tracking-[-0.01em] ${
                  isDark ? "text-white" : "text-[#0B0F17]"
                }`}
              >
                Chronological Events
              </h3>
              <span className="text-[11px] font-mono text-[#717682]">
                {filteredActivities.length} events
              </span>
            </div>

            <div
              className={`divide-y overflow-y-auto no-scrollbar flex-1 min-h-0 mt-1 ${
                isDark ? "divide-white/[0.05]" : "divide-slate-100"
              }`}
            >
              {filteredActivities.map((act) => {
                const Icon = getActivityIcon(act.type);

                return (
                  <div
                    key={act.id}
                    className={`flex items-start justify-between py-2 px-1 rounded-lg transition-colors ${
                      isDark ? "hover:bg-white/[0.03]" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                          isDark
                            ? "bg-white/[0.04] border-white/[0.08] text-white/80"
                            : "bg-[#F1F5F9] border-[#E2E8F0] text-[#0F172A]"
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span
                          className={`text-[12px] font-normal leading-tight ${
                            isDark ? "text-white" : "text-[#0F172A]"
                          }`}
                        >
                          {act.title}
                        </span>
                        <span
                          className={`text-[10.5px] leading-tight mt-0.5 ${
                            isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                          }`}
                        >
                          {act.detail}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`text-[10px] font-mono whitespace-nowrap pt-0.5 shrink-0 ${
                        isDark ? "text-[#717682]" : "text-[#94A3B8]"
                      }`}
                    >
                      {act.timeAgo}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
