"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface DataPoint {
  day: string;
  date: string;
  value: number;
  x: number;
  y: number;
}

const DATA_POINTS: DataPoint[] = [
  { day: "Mon", date: "Mon, 15 Sep", value: 2, x: 25, y: 85 },
  { day: "Tue", date: "Tue, 16 Sep", value: 5, x: 75, y: 70 },
  { day: "Wed", date: "Wed, 17 Sep", value: 7.5, x: 130, y: 56 },
  { day: "Thu", date: "Thu, 18 Sep", value: 9.5, x: 185, y: 45 },
  { day: "Fri", date: "Fri, 19 Sep", value: 12, x: 245, y: 28 },
  { day: "Sat", date: "Sat, 20 Sep", value: 11, x: 305, y: 35 },
  { day: "Sun", date: "Sun, 21 Sep", value: 8, x: 365, y: 52 },
];

export default function WorkspaceAppointmentTrendChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [filter, setFilter] = useState("This Week");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activePoint, setActivePoint] = useState<DataPoint>(DATA_POINTS[4]);

  const linePath =
    "M 25 85 C 50 80, 55 72, 75 70 C 105 66, 110 59, 130 56 C 160 52, 165 47, 185 45 C 215 42, 225 28, 245 28 C 275 28, 285 33, 305 35 C 335 38, 345 49, 365 52";

  const areaPath = `${linePath} L 365 105 L 25 105 Z`;

  return (
    <div
      className={`relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden select-none ${
        isDark
          ? "bg-gradient-to-b from-[#111724]/95 via-[#0c101a]/95 to-[#080b12]/98 border-white/[0.09] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_24px_-6px_rgba(0,0,0,0.55)]"
          : "bg-gradient-to-b from-white via-white to-[#F8FAFC] border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_4px_16px_rgba(15,23,42,0.05)]"
      }`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between relative z-10 shrink-0">
        <div>
          <h3
            className={`text-[13.5px] font-medium tracking-tight ${
              isDark ? "text-white" : "text-[#0B0F17]"
            }`}
          >
            Appointment Trend
          </h3>
          <p
            className={`text-[11px] mt-0.5 ${
              isDark ? "text-[#8e95a5]" : "text-[#64748B]"
            }`}
          >
            Appointments scheduled this week
          </p>
        </div>

        {/* Dropdown Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setFilterOpen(!filterOpen)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
              isDark
                ? "bg-white/[0.04] border-white/[0.1] text-white/90 hover:bg-white/[0.08] hover:border-white/20 shadow-2xs"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs"
            }`}
          >
            <span>{filter}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {filterOpen && (
            <div
              className={`absolute right-0 top-full mt-1.5 w-34 py-1 rounded-xl border shadow-xl z-30 backdrop-blur-2xl ${
                isDark
                  ? "bg-[#111622]/95 border-white/10 text-white"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              {["This Week", "Last Week", "This Month"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setFilter(opt);
                    setFilterOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors cursor-pointer ${
                    filter === opt
                      ? isDark
                        ? "font-medium text-white bg-white/[0.08]"
                        : "font-medium text-[#0F172A] bg-slate-100"
                      : isDark
                      ? "text-[#8e95a5] hover:text-white hover:bg-white/[0.04]"
                      : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chart Canvas with Scaled SVG */}
      <div className="relative w-full h-36 sm:h-40 my-auto flex items-center">
        {/* Y Axis Labels */}
        <div
          className={`absolute left-0 top-0 bottom-2 w-5 flex flex-col justify-between text-[8.5px] font-mono select-none ${
            isDark ? "text-[#717682]" : "text-[#94A3B8]"
          }`}
        >
          <span>15</span>
          <span>10</span>
          <span>5</span>
          <span>0</span>
        </div>

        {/* SVG Drawing Canvas */}
        <div className="w-full h-full pl-6 pr-2 relative">
          <svg
            viewBox="0 0 390 115"
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="monochrome-chart-grad-sm" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={isDark ? "#FFFFFF" : "#0F172A"}
                  stopOpacity={isDark ? "0.10" : "0.06"}
                />
                <stop
                  offset="100%"
                  stopColor={isDark ? "#FFFFFF" : "#0F172A"}
                  stopOpacity="0.0"
                />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Guidelines */}
            {[18, 45, 72, 100].map((yVal, i) => (
              <line
                key={i}
                x1="20"
                y1={yVal}
                x2="375"
                y2={yVal}
                stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                strokeDasharray="4 4"
              />
            ))}

            {/* Gradient Area Fill */}
            <motion.path
              d={areaPath}
              fill="url(#monochrome-chart-grad-sm)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />

            {/* Main Smooth Spline Stroke */}
            <motion.path
              d={linePath}
              fill="none"
              stroke={isDark ? "#FFFFFF" : "#0B0F17"}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: { duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 },
                opacity: { duration: 0.3, delay: 0.15 },
              }}
            />

            {/* Data Points */}
            {DATA_POINTS.map((pt) => {
              const isSelected = activePoint?.day === pt.day;

              return (
                <g key={pt.day} className="cursor-pointer" onClick={() => setActivePoint(pt)}>
                  <circle cx={pt.x} cy={pt.y} r="12" fill="transparent" />

                  {isSelected && (
                    <motion.circle
                      cx={pt.x}
                      cy={pt.y}
                      r="5.5"
                      fill="none"
                      stroke={isDark ? "#FFFFFF" : "#0B0F17"}
                      strokeWidth="1"
                      strokeOpacity="0.25"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    />
                  )}

                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? "2.5" : "1.75"}
                    fill={isDark ? "#FFFFFF" : "#0B0F17"}
                  />
                </g>
              );
            })}
          </svg>

          {/* Frosted Peak Annotation Pill */}
          {activePoint && (
            <motion.div
              initial={{ opacity: 0, y: 3, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="absolute pointer-events-none select-none z-10"
              style={{
                left: `${(activePoint.x / 390) * 100}%`,
                top: `${(activePoint.y / 115) * 100}%`,
                transform: "translate(-50%, -125%)",
              }}
            >
              <div
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-tight border backdrop-blur-md transition-colors ${
                  isDark
                    ? "bg-[#121622]/90 border-white/10 text-white/95 shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
                    : "bg-white/95 border-slate-200 text-slate-800 shadow-[0_4px_16px_rgba(15,23,42,0.08)]"
                }`}
              >
                <span
                  className={`w-1 h-1 rounded-full shrink-0 ${
                    isDark ? "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]" : "bg-amber-500"
                  }`}
                />
                <span className="font-semibold">{activePoint.value} appts</span>
                <span className="opacity-30">•</span>
                <span className="opacity-75">{activePoint.day}</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* X Axis Days Row */}
      <div
        className={`flex justify-between pl-7 pr-3 text-[9px] font-mono ${
          isDark ? "text-[#717682]" : "text-[#94A3B8]"
        }`}
      >
        {DATA_POINTS.map((pt) => (
          <span
            key={pt.day}
            onClick={() => setActivePoint(pt)}
            className={`cursor-pointer transition-colors ${
              activePoint?.day === pt.day
                ? isDark
                  ? "text-white font-semibold"
                  : "text-[#0B0F17] font-semibold"
                : "hover:text-white"
            }`}
          >
            {pt.day}
          </span>
        ))}
      </div>
    </div>
  );
}
