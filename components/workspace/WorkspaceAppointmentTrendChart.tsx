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
      className={`relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden select-none ${isDark
          ? "bg-gradient-to-b from-[#111724]/95 via-[#0c101a]/95 to-[#080b12]/98 border-white/[0.09] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_24px_-6px_rgba(0,0,0,0.55)]"
          : "bg-gradient-to-b from-white via-white to-[#F8FAFC] border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_4px_16px_rgba(15,23,42,0.05)]"
        }`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between relative z-10 shrink-0">
        <div>
          <h3
            className={`text-[13.5px] font-medium tracking-tight ${isDark ? "text-white" : "text-[#0B0F17]"
              }`}
          >
            Appointment Trend
          </h3>
          <p
            className={`text-[11px] mt-0.5 ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
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
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${isDark
                ? "bg-white/[0.04] border-white/[0.1] text-white/90 hover:bg-white/[0.08] hover:border-white/20 shadow-2xs"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs"
              }`}
          >
            <span>{filter}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {filterOpen && (
            <div
              className={`absolute right-0 top-full mt-1.5 w-34 py-1 rounded-xl border shadow-xl z-30 backdrop-blur-2xl ${isDark
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
                  className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors cursor-pointer ${filter === opt
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
          className={`absolute left-0 top-0 bottom-2 w-6 flex flex-col justify-between text-[10px] sm:text-[10.5px] font-medium tabular-nums select-none ${isDark ? "text-[#717682]" : "text-[#94A3B8]"
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
              {/* Apple-Grade 4-Stop Atmospheric Area Fade */}
              <linearGradient id="apple-area-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={isDark ? "#FFFFFF" : "#0F172A"}
                  stopOpacity={isDark ? "0.12" : "0.06"}
                />
                <stop
                  offset="40%"
                  stopColor={isDark ? "#FFFFFF" : "#0F172A"}
                  stopOpacity={isDark ? "0.04" : "0.02"}
                />
                <stop
                  offset="80%"
                  stopColor={isDark ? "#FFFFFF" : "#0F172A"}
                  stopOpacity={isDark ? "0.008" : "0.004"}
                />
                <stop
                  offset="100%"
                  stopColor={isDark ? "#FFFFFF" : "#0F172A"}
                  stopOpacity="0"
                />
              </linearGradient>

              {/* Platinum Velocity Stroke Gradient (Luminous apex at peak) */}
              <linearGradient id="apple-spline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop
                  offset="0%"
                  stopColor={isDark ? "#94a3b8" : "#64748b"}
                  stopOpacity={isDark ? "0.55" : "0.5"}
                />
                <stop
                  offset="35%"
                  stopColor={isDark ? "#cbd5e1" : "#475569"}
                  stopOpacity={isDark ? "0.85" : "0.8"}
                />
                <stop
                  offset="65%"
                  stopColor={isDark ? "#ffffff" : "#0f172a"}
                  stopOpacity="1"
                />
                <stop
                  offset="85%"
                  stopColor={isDark ? "#e2e8f0" : "#334155"}
                  stopOpacity={isDark ? "0.9" : "0.85"}
                />
                <stop
                  offset="100%"
                  stopColor={isDark ? "#94a3b8" : "#64748b"}
                  stopOpacity={isDark ? "0.6" : "0.55"}
                />
              </linearGradient>

              {/* Living Specular Shimmer Beam */}
              <linearGradient id="spline-shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity={isDark ? "0.45" : "0.6"} />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Guidelines (Whisper-thin hairlines) */}
            {[18, 45, 72, 100].map((yVal, i) => (
              <line
                key={i}
                x1="20"
                y1={yVal}
                x2="375"
                y2={yVal}
                stroke={isDark ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.035)"}
                strokeWidth="0.65"
                strokeDasharray="2 3"
              />
            ))}

            {/* Atmospheric Gradient Area Fill */}
            <motion.path
              key={`area-${filter}`}
              d={areaPath}
              fill="url(#apple-area-gradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.15 }}
            />

            {/* Ambient Optical Penumbra (Behind the line, subtle depth diffusion) */}
            <motion.path
              d={linePath}
              fill="none"
              stroke={isDark ? "#ffffff" : "#0f172a"}
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`pointer-events-none ${isDark ? "opacity-12" : "opacity-8"}`}
            />

            {/* Core Architectural Spline Hairline */}
            <motion.path
              key={`line-${filter}`}
              d={linePath}
              fill="none"
              stroke="url(#apple-spline-gradient)"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: { duration: 1.35, ease: [0.16, 1, 0.3, 1], delay: 0.1 },
                opacity: { duration: 0.25, delay: 0.1 },
              }}
            />

            {/* Living Specular Sweep along the curve */}
            <motion.path
              d={linePath}
              fill="none"
              stroke="url(#spline-shimmer)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeDasharray="65 320"
              animate={{ strokeDashoffset: [385, -385] }}
              transition={{
                duration: 7.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none"
              style={{
                mixBlendMode: isDark ? "overlay" : "soft-light",
              }}
            />

            {/* Active Point Vertical Hairline Guide */}
            {activePoint && (
              <line
                x1={activePoint.x}
                y1={activePoint.y + 6}
                x2={activePoint.x}
                y2="100"
                stroke={isDark ? "rgba(255,255,255,0.14)" : "rgba(15,23,42,0.14)"}
                strokeWidth="0.75"
                strokeDasharray="2 2"
              />
            )}

            {/* Data Points */}
            {DATA_POINTS.map((pt) => {
              const isSelected = activePoint?.day === pt.day;

              return (
                <g
                  key={pt.day}
                  className="cursor-pointer"
                  onClick={() => setActivePoint(pt)}
                  onMouseEnter={() => setActivePoint(pt)}
                >
                  {/* Generous touch/hover hit zone */}
                  <circle cx={pt.x} cy={pt.y} r="16" fill="transparent" />

                  {isSelected ? (
                    <g>
                      {/* Active Precision Reticle Halo */}
                      <motion.circle
                        cx={pt.x}
                        cy={pt.y}
                        r="6"
                        fill="none"
                        stroke={isDark ? "rgba(255,255,255,0.35)" : "rgba(15,23,42,0.35)"}
                        strokeWidth="0.85"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 450, damping: 25 }}
                      />
                      {/* Precision Core Node */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="2.5"
                        fill={isDark ? "#FFFFFF" : "#0B0F17"}
                      />
                    </g>
                  ) : (
                    /* Delicate Resting Anchor Tick */
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="1.2"
                      fill={isDark ? "rgba(255,255,255,0.22)" : "rgba(15,23,42,0.22)"}
                      className="transition-opacity duration-200"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Frosted Peak Annotation Pill (Apple-Grade Minimalist Tooltip) */}
          {activePoint && (
            <motion.div
              key={activePoint.day}
              initial={{ opacity: 0, y: 2.5, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="absolute pointer-events-none select-none z-10"
              style={{
                left: `${(activePoint.x / 390) * 100}%`,
                top: `${(activePoint.y / 115) * 100}%`,
                transform:
                  activePoint.x <= 45
                    ? "translate(-10%, -125%)"
                    : activePoint.x >= 340
                      ? "translate(-90%, -125%)"
                      : "translate(-50%, -125%)",
              }}
            >
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-2xl transition-all ${isDark
                    ? "bg-[#0c101a]/95 border-white/[0.12] text-white shadow-[0_12px_28px_-6px_rgba(0,0,0,0.75),inset_0_1px_0_0_rgba(255,255,255,0.12)]"
                    : "bg-white/95 border-slate-200/90 text-[#0F172A] shadow-[0_8px_20px_rgba(15,23,42,0.08),inset_0_1px_0_0_rgba(255,255,255,1)]"
                  }`}
              >
                <span className="font-light text-[13.5px] sm:text-[14px] tabular-nums leading-none tracking-tight text-white">
                  {activePoint.value}
                </span>
                <span
                  className={`font-normal text-[11px] leading-none tracking-normal ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                    }`}
                >
                  appointments
                </span>
                <span
                  className={`text-[9px] leading-none select-none ${isDark ? "text-white/20" : "text-slate-300"
                    }`}
                >
                  ·
                </span>
                <span
                  className={`text-[11px] font-medium leading-none tracking-tight ${isDark ? "text-white/90" : "text-[#0F172A]"
                    }`}
                >
                  {activePoint.day}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* X Axis Days Row */}
      <div
        className={`flex justify-between pl-7 pr-3 text-[11px] sm:text-[11.5px] select-none ${isDark ? "text-[#717682]" : "text-[#94A3B8]"
          }`}
      >
        {DATA_POINTS.map((pt) => (
          <span
            key={pt.day}
            onClick={() => setActivePoint(pt)}
            className={`cursor-pointer transition-colors duration-150 ${activePoint?.day === pt.day
                ? isDark
                  ? "text-white font-medium"
                  : "text-[#0B0F17] font-semibold"
                : isDark
                  ? "font-normal hover:text-white/80"
                  : "font-normal hover:text-slate-900"
              }`}
          >
            {pt.day}
          </span>
        ))}
      </div>
    </div>
  );
}
