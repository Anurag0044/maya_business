"use client";

import React from "react";
import { ChevronRight, ArrowRight, MoreHorizontal } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { AppointmentItem } from "./types";

const UPCOMING_APPOINTMENTS: AppointmentItem[] = [
  {
    id: "app-1",
    time: "10:30 AM",
    name: "Rahul Sharma",
    type: "Counselling",
    status: "Confirmed",
  },
  {
    id: "app-2",
    time: "11:00 AM",
    name: "Priya Mehta",
    type: "Admission",
    status: "Pending",
  },
  {
    id: "app-3",
    time: "12:30 PM",
    name: "Arjun Patel",
    type: "Course Enquiry",
    status: "Confirmed",
  },
  {
    id: "app-4",
    time: "02:00 PM",
    name: "Sneha Iyer",
    type: "Follow-up",
    status: "Pending",
  },
  {
    id: "app-5",
    time: "03:30 PM",
    name: "Karan Verma",
    type: "Counselling",
    status: "Confirmed",
  },
];

export default function WorkspaceRightRail({
  onTalkToMaya,
}: {
  onTalkToMaya?: () => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <aside className="w-full lg:w-76 xl:w-80 shrink-0 h-full flex flex-col justify-between gap-3 select-none overflow-hidden">
      {/* 1. System Sync Status Card */}
      <div
        className={`p-2.5 sm:p-3 rounded-xl border transition-all duration-300 flex items-center justify-between cursor-pointer group shrink-0 ${
          isDark
            ? "bg-[#0e121b]/85 border-white/[0.08] hover:border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
            : "bg-white border-[#E2E8F0] hover:border-slate-300 shadow-2xs"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-60" />
          </div>
          <div className="flex flex-col text-left">
            <span
              className={`text-[11.5px] font-medium leading-tight ${
                isDark ? "text-white" : "text-[#0B0F17]"
              }`}
            >
              All systems operational
            </span>
            <span
              className={`text-[9.5px] leading-tight font-normal mt-0.5 ${
                isDark ? "text-[#8e95a5]" : "text-[#64748B]"
              }`}
            >
              Real-time sync active.
            </span>
          </div>
        </div>
        <ChevronRight
          className={`w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5 ${
            isDark ? "text-[#717682]" : "text-slate-400"
          }`}
        />
      </div>

      {/* 2. Upcoming Appointments Card */}
      <div
        className={`p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden flex-1 min-h-0 ${
          isDark
            ? "bg-[#0e121b]/85 border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
            : "bg-white border-[#E2E8F0] shadow-2xs"
        }`}
      >
        <div
          className={`flex items-center justify-between pb-2 border-b shrink-0 ${
            isDark ? "border-white/[0.08]" : "border-[#E2E8F0]"
          }`}
        >
          <h3
            className={`text-[12px] font-medium tracking-[-0.01em] ${
              isDark ? "text-white" : "text-[#0B0F17]"
            }`}
          >
            Upcoming Appointments
          </h3>
          <button
            type="button"
            className="group inline-flex items-center gap-1 text-[10.5px] font-medium text-[#8e95a5] hover:text-white dark:hover:text-white transition-colors cursor-pointer"
          >
            <span>View all</span>
            <ArrowRight className="w-2.5 h-2.5 transition-transform duration-150 group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className={`divide-y overflow-y-auto no-scrollbar flex-1 min-h-0 ${isDark ? "divide-white/[0.05]" : "divide-slate-100"}`}>
          {UPCOMING_APPOINTMENTS.map((app) => (
            <div
              key={app.id}
              className={`flex items-center justify-between py-1.5 px-0.5 rounded transition-colors ${
                isDark ? "hover:bg-white/[0.03]" : "hover:bg-slate-50"
              }`}
            >
              {/* Time */}
              <div
                className={`text-[10px] font-mono shrink-0 w-15 ${
                  isDark ? "text-[#717682]" : "text-[#94A3B8]"
                }`}
              >
                {app.time}
              </div>

              {/* Details */}
              <div className="flex-1 flex flex-col min-w-0 pr-1.5">
                <span
                  className={`text-[11px] font-normal truncate ${
                    isDark ? "text-white" : "text-[#0B0F17]"
                  }`}
                >
                  {app.name}
                </span>
                <span
                  className={`text-[9.5px] leading-tight truncate ${
                    isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                  }`}
                >
                  {app.type}
                </span>
              </div>

              {/* Status Badge + More */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[8px] font-medium uppercase tracking-wider select-none ${
                    app.status === "Confirmed"
                      ? isDark
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : isDark
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {app.status}
                </span>

                <button
                  type="button"
                  className={`p-0.5 rounded transition-colors cursor-pointer ${
                    isDark
                      ? "text-[#717682] hover:text-white"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                  title="Options"
                >
                  <MoreHorizontal className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Branded Mountain AI Front Desk Card */}
      <div
        className={`relative rounded-2xl p-4 border overflow-hidden transition-all duration-300 flex flex-col justify-between shrink-0 ${
          isDark
            ? "bg-[#0e121b]/85 border-white/[0.08] text-white shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
            : "bg-white border-[#E2E8F0] text-[#0B0F17] shadow-2xs"
        }`}
      >
        {/* Misty Mountain Artistic SVG Backdrop */}
        <div className="absolute top-0 right-0 left-0 h-36 pointer-events-none opacity-25 select-none overflow-hidden">
          <svg
            viewBox="0 0 320 180"
            className="w-full h-full object-cover"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="rightrail-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isDark ? "#1e293b" : "#e0f2fe"} stopOpacity="0.6" />
                <stop offset="100%" stopColor={isDark ? "#060709" : "#ffffff"} stopOpacity="1" />
              </linearGradient>
              <linearGradient id="rightrail-ridge-1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isDark ? "#ffffff" : "#0F172A"} stopOpacity="0.2" />
                <stop offset="100%" stopColor={isDark ? "#060709" : "#ffffff"} stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <rect width="320" height="180" fill="url(#rightrail-sky)" />
            <path
              d="M -20 120 Q 50 60, 120 90 T 260 40 T 340 100 L 340 180 L -20 180 Z"
              fill="url(#ridge-1)"
            />
          </svg>
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col gap-2">
          {/* Eyebrow */}
          <span className="text-[8.5px] font-medium uppercase tracking-[0.24em] inline-block animate-luxury-shimmer select-none">
            MEET MAYA
          </span>

          {/* Heading */}
          <h4 className="text-[15px] font-light tracking-[-0.03em] leading-snug">
            Your AI front desk,{" "}
            <span className={isDark ? "text-[#8e98ab]" : "text-[#64748B]"}>
              always on.
            </span>
          </h4>

          {/* Subtext */}
          <p
            className={`text-[11px] leading-relaxed font-normal ${
              isDark ? "text-[#9ca3af]" : "text-[#475569]"
            }`}
          >
            Handle enquiries, schedule appointments, and never miss a follow-up.
          </p>

          {/* Action CTA Button */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={onTalkToMaya}
              className={`w-fit inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 cursor-pointer active:scale-95 shadow-sm ${
                isDark
                  ? "bg-white text-black hover:bg-neutral-100"
                  : "bg-[#0B0F17] text-white hover:bg-[#1E293B]"
              }`}
            >
              <span>Talk to MAYA</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Philosophical Quote */}
          <blockquote
            className={`text-[9.5px] italic leading-relaxed pt-1.5 border-t ${
              isDark
                ? "border-white/[0.08] text-[#8e95a5]"
                : "border-[#E2E8F0] text-[#64748B]"
            }`}
          >
            &ldquo;Technology should understand people — not the other way around.&rdquo;
          </blockquote>

          {/* Tags */}
          <div
            className={`text-[7.5px] font-medium uppercase tracking-[0.22em] pt-0.5 flex items-center justify-between select-none ${
              isDark ? "text-[#717682]" : "text-[#94A3B8]"
            }`}
          >
            <span>PEOPLE</span>
            <span>·</span>
            <span>OPPORTUNITIES</span>
            <span>·</span>
            <span>REAL PROGRESS</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
