"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface Slice {
  name: string;
  pct: number;
  darkColor: string;
  lightColor: string;
}

const SLICES: Slice[] = [
  { name: "Website", pct: 36, darkColor: "#FFFFFF", lightColor: "#0F172A" },
  { name: "Phone", pct: 24, darkColor: "#94A3B8", lightColor: "#2563EB" },
  { name: "WhatsApp", pct: 20, darkColor: "#38BDF8", lightColor: "#0EA5E9" },
  { name: "Walk-in", pct: 12, darkColor: "#A78BFA", lightColor: "#8B5CF6" },
  { name: "Other", pct: 8, darkColor: "#475569", lightColor: "#94A3B8" },
];

export default function WorkspaceLeadSourceChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [timeFilter, setTimeFilter] = useState("Last 7 days");
  const [filterOpen, setFilterOpen] = useState(false);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // SVG Donut geometry
  const radius = 50;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;

  let cumulativePct = 0;
  const segments = SLICES.map((slice) => {
    const dashLength = (slice.pct / 100) * circumference;
    const dashOffset = -(cumulativePct / 100) * circumference;
    cumulativePct += slice.pct;
    return {
      ...slice,
      dashLength,
      dashOffset,
      color: isDark ? slice.darkColor : slice.lightColor,
    };
  });

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        isDark
          ? "bg-[#0e121b]/85 border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
          : "bg-white border-[#E2E8F0] shadow-2xs"
      }`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between">
        <div>
          <h3
            className={`text-[12.5px] font-medium tracking-[-0.01em] ${
              isDark ? "text-white" : "text-[#0B0F17]"
            }`}
          >
            Lead Source
          </h3>
          <p
            className={`text-[10.5px] mt-0.5 ${
              isDark ? "text-[#9ca3af]" : "text-[#64748B]"
            }`}
          >
            Where your leads are coming from
          </p>
        </div>

        {/* Dropdown Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setFilterOpen(!filterOpen)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-medium border transition-colors cursor-pointer ${
              isDark
                ? "bg-white/[0.03] border-white/[0.08] text-[#8e95a5] hover:text-white hover:bg-white/[0.06]"
                : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:bg-slate-100"
            }`}
          >
            <span>{timeFilter}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {filterOpen && (
            <div
              className={`absolute right-0 top-full mt-1.5 w-32 py-1 rounded-xl border shadow-xl z-20 backdrop-blur-xl ${
                isDark
                  ? "bg-[#10141E]/95 border-white/10 text-white"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              {["Last 7 days", "This Month", "Last 30 days", "All Time"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setTimeFilter(opt);
                    setFilterOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors cursor-pointer ${
                    timeFilter === opt
                      ? "font-medium text-white bg-white/[0.08]"
                      : "text-[#8e95a5] hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chart Body: Donut + Legend */}
      <div className="my-1 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
        {/* SVG Donut Chart */}
        <div className="relative w-30 h-30 shrink-0 mx-auto flex items-center justify-center">
          <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"}
              strokeWidth={strokeWidth}
            />

            {segments.map((seg, idx) => {
              const isHovered = hoveredSlice === seg.name;
              return (
                <motion.circle
                  key={seg.name}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                  strokeDasharray={`${seg.dashLength} ${circumference}`}
                  strokeDashoffset={seg.dashOffset}
                  strokeLinecap="butt"
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray: `${seg.dashLength} ${circumference}` }}
                  transition={{
                    duration: 1.1,
                    delay: 0.1 + idx * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  onMouseEnter={() => setHoveredSlice(seg.name)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  className="cursor-pointer transition-all duration-200"
                />
              );
            })}
          </svg>

          {/* Donut Center Statistics */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span
              className={`text-[21px] font-light tracking-tight leading-none tabular-nums ${
                isDark ? "text-white" : "text-[#0B0F17]"
              }`}
            >
              48
            </span>
            <span
              className={`text-[8.5px] uppercase tracking-[0.14em] mt-0.5 font-medium ${
                isDark ? "text-[#8e95a5]" : "text-[#64748B]"
              }`}
            >
              Total Leads
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 flex flex-col gap-1 min-w-[120px]">
          {SLICES.map((slice) => {
            const isHovered = hoveredSlice === slice.name;
            const dotColor = isDark ? slice.darkColor : slice.lightColor;

            return (
              <div
                key={slice.name}
                onMouseEnter={() => setHoveredSlice(slice.name)}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`flex items-center justify-between text-[11px] py-0.5 px-1.5 rounded cursor-pointer transition-colors ${
                  isHovered
                    ? isDark
                      ? "bg-white/[0.05]"
                      : "bg-slate-100"
                    : ""
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: dotColor }}
                  />
                  <span
                    className={`font-normal ${
                      isDark ? "text-[#9ca3af]" : "text-[#475569]"
                    }`}
                  >
                    {slice.name}
                  </span>
                </div>
                <span
                  className={`font-mono text-[10.5px] ${
                    isDark ? "text-white" : "text-[#0B0F17]"
                  }`}
                >
                  {slice.pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
