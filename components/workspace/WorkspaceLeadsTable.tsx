"use client";

import React from "react";
import { MoreHorizontal, ArrowRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { LeadItem, LeadStatus } from "./types";

const RECENT_LEADS: LeadItem[] = [
  {
    id: "lead-1",
    initials: "RS",
    name: "Rahul Sharma",
    source: "Website",
    timeAgo: "2m ago",
    status: "NEW",
  },
  {
    id: "lead-2",
    initials: "PM",
    name: "Priya Mehta",
    source: "WhatsApp",
    timeAgo: "15m ago",
    status: "CONTACTED",
  },
  {
    id: "lead-3",
    initials: "AP",
    name: "Arjun Patel",
    source: "Phone",
    timeAgo: "32m ago",
    status: "INTERESTED",
  },
  {
    id: "lead-4",
    initials: "SI",
    name: "Sneha Iyer",
    source: "Walk-in",
    timeAgo: "1h ago",
    status: "COUNSELLING",
  },
  {
    id: "lead-5",
    initials: "KV",
    name: "Karan Verma",
    source: "Website",
    timeAgo: "2h ago",
    status: "VISITED",
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

export default function WorkspaceLeadsTable() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        isDark
          ? "bg-[#0e121b]/85 border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
          : "bg-white border-[#E2E8F0] shadow-2xs"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between pb-2.5 border-b ${
          isDark ? "border-white/[0.08]" : "border-[#E2E8F0]"
        }`}
      >
        <h3
          className={`text-[12.5px] font-medium tracking-[-0.01em] ${
            isDark ? "text-white" : "text-[#0B0F17]"
          }`}
        >
          Recent Leads
        </h3>
        <button
          type="button"
          className="group inline-flex items-center gap-1 text-[11px] font-medium text-[#8e95a5] hover:text-white dark:hover:text-white transition-colors cursor-pointer"
        >
          <span>View all</span>
          <ArrowRight className="w-3 h-3 transition-transform duration-150 group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Table Rows */}
      <div className={`divide-y ${isDark ? "divide-white/[0.05]" : "divide-slate-100"}`}>
        {/* Table Column Labels */}
        <div
          className={`grid grid-cols-12 py-1.5 px-1 text-[9px] font-medium uppercase tracking-[0.16em] select-none ${
            isDark ? "text-[#717682]" : "text-[#94A3B8]"
          }`}
        >
          <div className="col-span-5">Name</div>
          <div className="col-span-2">Source</div>
          <div className="col-span-2">Time</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-1 text-right"></div>
        </div>

        {RECENT_LEADS.map((lead) => (
          <div
            key={lead.id}
            className={`grid grid-cols-12 items-center py-1.5 px-1 rounded-lg transition-colors duration-150 ${
              isDark ? "hover:bg-white/[0.03]" : "hover:bg-slate-50"
            }`}
          >
            {/* Name + Avatar */}
            <div className="col-span-5 flex items-center gap-2 pr-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-medium shrink-0 select-none border ${
                  isDark
                    ? "bg-[#141a24] text-white/90 border-white/[0.08]"
                    : "bg-[#F1F5F9] text-slate-700 border-[#E2E8F0]"
                }`}
              >
                {lead.initials}
              </div>
              <span
                className={`text-[11.5px] font-normal truncate ${
                  isDark ? "text-white" : "text-[#0F172A]"
                }`}
              >
                {lead.name}
              </span>
            </div>

            {/* Source */}
            <div
              className={`col-span-2 text-[11px] truncate ${
                isDark ? "text-[#8e95a5]" : "text-[#64748B]"
              }`}
            >
              {lead.source}
            </div>

            {/* Time Ago */}
            <div
              className={`col-span-2 text-[10.5px] font-mono whitespace-nowrap ${
                isDark ? "text-[#717682]" : "text-[#94A3B8]"
              }`}
            >
              {lead.timeAgo}
            </div>

            {/* Status Badge */}
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

            {/* Action 3-dots */}
            <div className="col-span-1 flex justify-end">
              <button
                type="button"
                className={`p-0.5 rounded transition-colors cursor-pointer ${
                  isDark
                    ? "text-[#717682] hover:text-white hover:bg-white/[0.05]"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                }`}
                title="More actions"
              >
                <MoreHorizontal className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
