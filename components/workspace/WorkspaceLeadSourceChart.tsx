"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface Slice {
  name: string;
  pct: number;
  count: number;
  gradientId: string;
  fromColorDark: string;
  midColorDark: string;
  toColorDark: string;
  fromColorLight: string;
  midColorLight: string;
  toColorLight: string;
}

const SLICES: Slice[] = [
  {
    name: "Website",
    pct: 36,
    count: 17,
    gradientId: "donut-mat-website",
    fromColorDark: "#38bdf8",
    midColorDark: "#2563eb",
    toColorDark: "#1e3a8a",
    fromColorLight: "#60a5fa",
    midColorLight: "#2563eb",
    toColorLight: "#1e40af",
  },
  {
    name: "WhatsApp",
    pct: 24,
    count: 12,
    gradientId: "donut-mat-whatsapp",
    fromColorDark: "#34d399",
    midColorDark: "#10b981",
    toColorDark: "#064e3b",
    fromColorLight: "#34d399",
    midColorLight: "#059669",
    toColorLight: "#065f46",
  },
  {
    name: "Phone",
    pct: 20,
    count: 10,
    gradientId: "donut-mat-phone",
    fromColorDark: "#c084fc",
    midColorDark: "#8b5cf6",
    toColorDark: "#4c1d95",
    fromColorLight: "#c084fc",
    midColorLight: "#7c3aed",
    toColorLight: "#5b21b6",
  },
  {
    name: "Walk-in",
    pct: 12,
    count: 6,
    gradientId: "donut-mat-walkin",
    fromColorDark: "#fde68a",
    midColorDark: "#f59e0b",
    toColorDark: "#78350f",
    fromColorLight: "#fbbf24",
    midColorLight: "#d97706",
    toColorLight: "#92400e",
  },
  {
    name: "Other",
    pct: 8,
    count: 3,
    gradientId: "donut-mat-other",
    fromColorDark: "#e2e8f0",
    midColorDark: "#94a3b8",
    toColorDark: "#334155",
    fromColorLight: "#cbd5e1",
    midColorLight: "#64748b",
    toColorLight: "#334155",
  },
];

export default function WorkspaceLeadSourceChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [timeFilter, setTimeFilter] = useState("Last 7 days");
  const [filterOpen, setFilterOpen] = useState(false);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Precision Apple-Style Geometry with Organic Rounded Caps
  const radius = 62;
  const strokeWidth = 12.5;
  const circumference = 2 * Math.PI * radius; // ~389.56

  // Clearance for rounded caps (strokeWidth + 3.5px visual air gap)
  const capGapPixels = strokeWidth + 3.5;

  let cumulativePct = 0;
  const segments = SLICES.map((slice) => {
    const startPct = cumulativePct;
    const endPct = cumulativePct + slice.pct;
    const midPct = (startPct + endPct) / 2;
    const midAngleDeg = (midPct / 100) * 360;

    const dashLength = Math.max(0, (slice.pct / 100) * circumference - capGapPixels);
    const dashOffset = -(cumulativePct / 100) * circumference - strokeWidth / 2;
    cumulativePct += slice.pct;

    return {
      ...slice,
      dashLength,
      dashOffset,
      midAngleDeg,
    };
  });

  const activeSliceData = SLICES.find((s) => s.name === hoveredSlice);
  const totalLeads = SLICES.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div
      className={`relative p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden select-none h-full ${
        isDark
          ? "bg-[#0c1017]/90 border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_4px_20px_rgba(0,0,0,0.35)]"
          : "bg-white border-slate-200/80 shadow-2xs"
      }`}
    >
      {/* Minimal Header */}
      <div className="flex items-start justify-between relative z-10 shrink-0">
        <div>
          <h3
            className={`text-[13.5px] font-medium tracking-tight ${
              isDark ? "text-white" : "text-[#0B0F17]"
            }`}
          >
            Lead Source
          </h3>
          <p
            className={`text-[11px] mt-0.5 ${
              isDark ? "text-[#8e95a5]" : "text-[#64748B]"
            }`}
          >
            Where your leads are coming from
          </p>
        </div>

        {/* Minimal Dropdown Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setFilterOpen(!filterOpen)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${
              isDark
                ? "bg-white/[0.04] border-white/[0.08] text-white/90 hover:bg-white/[0.08]"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span>{timeFilter}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {filterOpen && (
            <div
              className={`absolute right-0 top-full mt-1.5 w-32 py-1 rounded-xl border shadow-xl z-30 backdrop-blur-2xl ${
                isDark
                  ? "bg-[#111622]/95 border-white/10 text-white"
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

      {/* Main Body: Textured Donut + Minimal Legend Centered Vertically */}
      <div className="flex-1 min-h-0 flex items-center justify-center gap-8 sm:gap-12 py-3">
        {/* Apple-Grade Textured Donut */}
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 170 170" className="w-full h-full overflow-visible">
            <defs>
              {/* Tangentially Rotated Multi-Stop Material Gradients */}
              {segments.map((s) => (
                <linearGradient
                  key={s.gradientId}
                  id={s.gradientId}
                  x1="10%"
                  y1="50%"
                  x2="90%"
                  y2="50%"
                  gradientTransform={`rotate(${s.midAngleDeg + 90} 0.5 0.5)`}
                >
                  <stop offset="0%" stopColor={isDark ? s.fromColorDark : s.fromColorLight} />
                  <stop offset="55%" stopColor={isDark ? s.midColorDark : s.midColorLight} />
                  <stop offset="100%" stopColor={isDark ? s.toColorDark : s.toColorLight} />
                </linearGradient>
              ))}

              {/* Physical Depth Shadow (Subtle elevation, not sci-fi glow) */}
              <filter id="ring-depth" x="-15%" y="-15%" width="130%" height="130%">
                <feDropShadow
                  dx="0"
                  dy="1.5"
                  stdDeviation="2"
                  floodColor="#000000"
                  floodOpacity={isDark ? "0.35" : "0.1"}
                />
              </filter>
            </defs>

            {/* Swiss Horology Precision Dial Ticks (Every 15° = 24 ticks) */}
            {Array.from({ length: 24 }).map((_, i) => {
              const angleDeg = i * 15;
              const isQuadrant = i % 6 === 0; // 0°, 90°, 180°, 270°
              const angleRad = (angleDeg * Math.PI) / 180;
              const rInner = isQuadrant ? 72 : 73.5;
              const rOuter = 76;
              const x1 = 85 + rInner * Math.sin(angleRad);
              const y1 = 85 - rInner * Math.cos(angleRad);
              const x2 = 85 + rOuter * Math.sin(angleRad);
              const y2 = 85 - rOuter * Math.cos(angleRad);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={
                    isDark
                      ? isQuadrant
                        ? "rgba(255,255,255,0.18)"
                        : "rgba(255,255,255,0.06)"
                      : isQuadrant
                      ? "rgba(15,23,42,0.18)"
                      : "rgba(15,23,42,0.06)"
                  }
                  strokeWidth={isQuadrant ? "1.25" : "0.75"}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Outer Recessed Groove Hairline */}
            <circle
              cx="85"
              cy="85"
              r={radius + strokeWidth / 2 + 1.5}
              fill="none"
              stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.04)"}
              strokeWidth="0.75"
            />

            {/* Inset Base Track Bed */}
            <circle
              cx="85"
              cy="85"
              r={radius}
              fill="none"
              stroke={isDark ? "rgba(255,255,255,0.035)" : "rgba(15,23,42,0.035)"}
              strokeWidth={strokeWidth}
            />

            {/* Inner Recessed Groove Hairline */}
            <circle
              cx="85"
              cy="85"
              r={radius - strokeWidth / 2 - 1.5}
              fill="none"
              stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.04)"}
              strokeWidth="0.75"
            />

            {/* Frosted Instrument Center Lens */}
            <circle
              cx="85"
              cy="85"
              r="44"
              fill={isDark ? "rgba(255,255,255,0.015)" : "rgba(15,23,42,0.015)"}
              stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.05)"}
              strokeWidth="0.75"
            />

            {/* Arc Slices with Tangential Gradients & Tactile Crest Sheen */}
            <g transform="rotate(-90 85 85)">
              {segments.map((seg, idx) => {
                const isHovered = hoveredSlice === seg.name;
                const isAnyHovered = hoveredSlice !== null;

                return (
                  <g key={seg.name}>
                    {/* Primary Arc Body with Tangential Gradient */}
                    <motion.circle
                      cx="85"
                      cy="85"
                      r={radius}
                      fill="none"
                      stroke={`url(#${seg.gradientId})`}
                      strokeWidth={isHovered ? strokeWidth + 2.5 : strokeWidth}
                      strokeDasharray={`${seg.dashLength} ${circumference}`}
                      strokeDashoffset={seg.dashOffset}
                      strokeLinecap="round"
                      filter="url(#ring-depth)"
                      initial={{ strokeDasharray: `0 ${circumference}` }}
                      animate={{
                        strokeDasharray: `${seg.dashLength} ${circumference}`,
                        opacity: isAnyHovered ? (isHovered ? 1 : 0.35) : 1,
                      }}
                      transition={{
                        strokeDasharray: {
                          duration: 1.1,
                          delay: 0.08 + idx * 0.05,
                          ease: [0.16, 1, 0.3, 1],
                        },
                        opacity: { duration: 0.2 },
                        strokeWidth: { duration: 0.2 },
                      }}
                      onMouseEnter={() => setHoveredSlice(seg.name)}
                      onMouseLeave={() => setHoveredSlice(null)}
                      className="cursor-pointer"
                    />

                    {/* Cylindrical 3D Crest Sheen (Tactile material light reflection, no neon glow) */}
                    <motion.circle
                      cx="85"
                      cy="85"
                      r={radius}
                      fill="none"
                      stroke={isDark ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.45)"}
                      strokeWidth={isHovered ? 2.5 : 1.75}
                      strokeDasharray={`${Math.max(0, seg.dashLength - 3)} ${circumference}`}
                      strokeDashoffset={seg.dashOffset - 1.5}
                      strokeLinecap="round"
                      className="pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: isAnyHovered ? (isHovered ? 0.95 : 0.15) : 0.55,
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Clean Center Typography with Dynamic Feedback */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <AnimatePresence mode="wait">
              {activeSliceData ? (
                <motion.div
                  key={activeSliceData.name}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.14 }}
                  className="flex flex-col items-center justify-center text-center px-2"
                >
                  <span
                    className={`text-[28px] sm:text-[32px] font-light tracking-tight leading-none tabular-nums ${
                      isDark ? "text-white" : "text-[#0B0F17]"
                    }`}
                  >
                    {activeSliceData.pct}%
                  </span>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: isDark
                          ? activeSliceData.fromColorDark
                          : activeSliceData.fromColorLight,
                      }}
                    />
                    <span
                      className="text-[10.5px] tracking-wide font-medium leading-tight truncate max-w-[90px]"
                      style={{
                        color: isDark
                          ? activeSliceData.fromColorDark
                          : activeSliceData.fromColorLight,
                      }}
                    >
                      {activeSliceData.name} · {activeSliceData.count}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="total"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.14 }}
                  className="flex flex-col items-center justify-center text-center px-2"
                >
                  <span
                    className={`text-[28px] sm:text-[32px] font-light tracking-tight leading-none tabular-nums ${
                      isDark ? "text-white" : "text-[#0B0F17]"
                    }`}
                  >
                    {totalLeads}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span
                      className={`text-[10px] tracking-wider uppercase font-medium ${
                        isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                      }`}
                    >
                      Total Leads
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Minimal Uncluttered Legend List with Interactive Highlight */}
        <div className="flex flex-col gap-2 min-w-[145px]">
          {SLICES.map((slice) => {
            const isHovered = hoveredSlice === slice.name;

            return (
              <div
                key={slice.name}
                onMouseEnter={() => setHoveredSlice(slice.name)}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`group flex items-center justify-between gap-4 text-[12px] py-1.5 px-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                  isHovered
                    ? isDark
                      ? "bg-white/[0.07] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
                      : "bg-slate-100 shadow-2xs"
                    : "hover:bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-1.5 rounded-full shrink-0 transition-transform duration-200 group-hover:scale-110 shadow-xs"
                    style={{
                      background: `linear-gradient(90deg, ${
                        isDark ? slice.fromColorDark : slice.fromColorLight
                      }, ${isDark ? slice.toColorDark : slice.toColorLight})`,
                    }}
                  />
                  <span
                    className={`transition-colors font-normal ${
                      isHovered
                        ? isDark
                          ? "text-white font-medium"
                          : "text-[#0B0F17] font-medium"
                        : isDark
                        ? "text-neutral-300"
                        : "text-slate-700"
                    }`}
                  >
                    {slice.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                      isHovered
                        ? isDark
                          ? "bg-white/[0.1] text-white"
                          : "bg-slate-200 text-slate-800"
                        : isDark
                        ? "bg-white/[0.04] text-neutral-400"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {slice.count}
                  </span>
                  <span
                    className={`font-mono text-[11px] tabular-nums font-medium transition-colors ${
                      isHovered
                        ? isDark
                          ? "text-white"
                          : "text-[#0B0F17]"
                        : isDark
                        ? "text-neutral-400"
                        : "text-slate-500"
                    }`}
                  >
                    {slice.pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

