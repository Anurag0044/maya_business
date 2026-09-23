"use client";

import React from "react";
import {
  UserPlus,
  PhoneCall,
  CalendarCheck,
  CheckSquare,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { ActivityItem } from "./types";

const ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    type: "lead",
    title: "New lead created",
    detail: "Rahul Sharma via Website",
    timeAgo: "2m ago",
  },
  {
    id: "act-2",
    type: "call",
    title: "Call completed",
    detail: "Priya Mehta · 04:21",
    timeAgo: "15m ago",
  },
  {
    id: "act-3",
    type: "followup",
    title: "Follow-up scheduled",
    detail: "Arjun Patel",
    timeAgo: "32m ago",
  },
  {
    id: "act-4",
    type: "status",
    title: "Status updated",
    detail: "Sneha Iyer → Counselling",
    timeAgo: "1h ago",
  },
  {
    id: "act-5",
    type: "appointment",
    title: "Appointment booked",
    detail: "Karan Verma",
    timeAgo: "2h ago",
  },
];

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

export default function WorkspaceActivityTimeline() {
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
          Recent Activity
        </h3>
        <button
          type="button"
          className="group inline-flex items-center gap-1 text-[11px] font-medium text-[#8e95a5] hover:text-white dark:hover:text-white transition-colors cursor-pointer"
        >
          <span>View all</span>
          <ArrowRight className="w-3 h-3 transition-transform duration-150 group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Activity Timeline List */}
      <div className={`divide-y ${isDark ? "divide-white/[0.05]" : "divide-slate-100"}`}>
        {ACTIVITIES.map((activity) => {
          const Icon = getActivityIcon(activity.type);

          return (
            <div
              key={activity.id}
              className={`flex items-start justify-between py-1.5 px-1 rounded-lg transition-colors ${
                isDark ? "hover:bg-white/[0.03]" : "hover:bg-slate-50"
              }`}
            >
              {/* Left: Icon + Text */}
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
                    className={`text-[11.5px] font-normal leading-tight ${
                      isDark ? "text-white" : "text-[#0F172A]"
                    }`}
                  >
                    {activity.title}
                  </span>
                  <span
                    className={`text-[10.5px] leading-tight mt-0.5 ${
                      isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                    }`}
                  >
                    {activity.detail}
                  </span>
                </div>
              </div>

              {/* Right: Timestamp */}
              <div
                className={`text-[10px] font-mono whitespace-nowrap pt-0.5 shrink-0 ${
                  isDark ? "text-[#717682]" : "text-[#94A3B8]"
                }`}
              >
                {activity.timeAgo}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
