"use client";

import React, { useState, useEffect } from "react";
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

function AnimatedRoundingNumber({
  value,
  duration = 0.5,
  suffix = "",
  suffixClassName,
  triggerKey,
}: {
  value: number;
  duration?: number;
  suffix?: string;
  suffixClassName?: string;
  triggerKey?: string | number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let reqId: number;
    const durationMs = duration * 1000;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / durationMs, 1);
      // Apple-grade cubic out easing: rapid dynamic start, buttery smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * value));

      if (progress < 1) {
        reqId = requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };

    reqId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(reqId);
  }, [value, duration, triggerKey]);

  return (
    <span className="inline-flex items-baseline">
      <span>{count}</span>
      {suffix && (
        <span
          className={
            suffixClassName ||
            "text-[13px] sm:text-[15px] font-light text-[#8e95a5] ml-1 leading-none select-none"
          }
        >
          {suffix}
        </span>
      )}
    </span>
  );
}

export default function WorkspaceLeadSourceChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [timeFilter, setTimeFilter] = useState("Last 7 days");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSlice, setSelectedSlice] = useState<string | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState<number>(0);

  const handleSliceClick = (name: string) => {
    setSelectedSlice((prev) => (prev === name ? null : name));
    setAnimationKey(Date.now());
  };

  const handleReset = () => {
    if (selectedSlice !== null) {
      setSelectedSlice(null);
      setAnimationKey(Date.now());
    }
  };

  // Precision Apple-Style Geometry with Organic Rounded Caps (Calibrated Proportion)
  const radius = 66;
  const strokeWidth = 13;
  const circumference = 2 * Math.PI * radius; // ~414.69

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

  const activeSliceName = hoveredSlice || selectedSlice;
  const isAnyActive = hoveredSlice !== null || selectedSlice !== null;
  const activeSliceData = SLICES.find((s) => s.name === activeSliceName);
  const totalLeads = SLICES.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div
      className={`relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden select-none h-full ${isDark
          ? "bg-gradient-to-b from-[#111724]/95 via-[#0c101a]/95 to-[#080b12]/98 border-white/[0.09] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_24px_-6px_rgba(0,0,0,0.55)]"
          : "bg-gradient-to-b from-white via-white to-[#F8FAFC] border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_4px_16px_rgba(15,23,42,0.05)]"
        }`}
    >
      {/* Minimal Header */}
      <div className="flex items-start justify-between relative z-10 shrink-0">
        <div>
          <h3
            className={`text-[13.5px] font-medium tracking-tight ${isDark ? "text-white" : "text-[#0B0F17]"
              }`}
          >
            Lead Source
          </h3>
          <p
            className={`text-[11px] mt-0.5 ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
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
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${isDark
                ? "bg-white/[0.04] border-white/[0.08] text-white/90 hover:bg-white/[0.08]"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
          >
            <span>{timeFilter}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {filterOpen && (
            <div
              className={`absolute right-0 top-full mt-1.5 w-32 py-1 rounded-xl border shadow-xl z-30 backdrop-blur-2xl ${isDark
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
                    setSelectedSlice(null);
                    setHoveredSlice(null);
                    setAnimationKey(Date.now());
                  }}
                  className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors cursor-pointer ${timeFilter === opt
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
      <div className="flex-1 min-h-0 flex items-center justify-center gap-6 sm:gap-8 lg:gap-10 py-2">
        {/* Apple-Grade Textured Donut (Calibrated Optical Scale) */}
        <div className="relative w-48 h-48 sm:w-52 sm:h-52 lg:w-54 lg:h-54 shrink-0 flex items-center justify-center">
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

              {/* Physical Depth Shadow - Elevated Interactive State */}
              <filter id="ring-depth-elevated" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="3"
                  stdDeviation="3.5"
                  floodColor="#000000"
                  floodOpacity={isDark ? "0.55" : "0.18"}
                />
              </filter>

              {/* Living Optical Specular Sweep (Apple sapphire crystal refraction) */}
              <linearGradient id="ring-specular-glint" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="30%" stopColor="#ffffff" stopOpacity={isDark ? "0.03" : "0.06"} />
                <stop offset="50%" stopColor="#ffffff" stopOpacity={isDark ? "0.24" : "0.38"} />
                <stop offset="70%" stopColor="#ffffff" stopOpacity={isDark ? "0.03" : "0.06"} />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Swiss Horology Precision Dial Ticks (Every 15° = 24 ticks) */}
            {Array.from({ length: 24 }).map((_, i) => {
              const angleDeg = i * 15;
              const isQuadrant = i % 6 === 0; // 0°, 90°, 180°, 270°
              const angleRad = (angleDeg * Math.PI) / 180;
              const rInner = isQuadrant ? 76 : 77.5;
              const rOuter = 81;
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

            {/* Frosted Instrument Center Lens with Reset Interaction */}
            <motion.circle
              cx="85"
              cy="85"
              r="47"
              fill={isDark ? "rgba(255,255,255,0.015)" : "rgba(15,23,42,0.015)"}
              stroke={
                selectedSlice
                  ? isDark
                    ? "rgba(255,255,255,0.18)"
                    : "rgba(15,23,42,0.18)"
                  : isDark
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(15,23,42,0.05)"
              }
              strokeWidth={selectedSlice ? "1.25" : "0.75"}
              onClick={handleReset}
              animate={{
                scale: selectedSlice ? [1, 1.015, 1] : 1,
              }}
              style={{ transformOrigin: "85px 85px" }}
              transition={{
                scale: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
              }}
              className={selectedSlice ? "cursor-pointer" : ""}
            />

            {/* Arc Slices with Tangential Gradients & Tactile Crest Sheen */}
            <g transform="rotate(-90 85 85)">
              {segments.map((seg, idx) => {
                const isHovered = hoveredSlice === seg.name;
                const isSelected = selectedSlice === seg.name;
                const isActive = hoveredSlice ? isHovered : isSelected;

                return (
                  <g key={seg.name}>
                    {/* Primary Arc Body with Tangential Gradient & Apple Spring Physics */}
                    <motion.circle
                      cx="85"
                      cy="85"
                      r={radius}
                      fill="none"
                      stroke={`url(#${seg.gradientId})`}
                      strokeWidth={
                        isSelected
                          ? strokeWidth + 2.5
                          : isActive
                            ? strokeWidth + 2
                            : strokeWidth
                      }
                      strokeDasharray={`${seg.dashLength} ${circumference}`}
                      strokeDashoffset={seg.dashOffset}
                      strokeLinecap="round"
                      filter={isActive ? "url(#ring-depth-elevated)" : "url(#ring-depth)"}
                      initial={{ strokeDasharray: `0 ${circumference}` }}
                      animate={{
                        strokeDasharray: `${seg.dashLength} ${circumference}`,
                        opacity: isAnyActive ? (isActive ? 1 : 0.24) : 1,
                        scale: isSelected ? 1.02 : isActive ? 1.015 : 1,
                      }}
                      style={{ transformOrigin: "85px 85px" }}
                      transition={{
                        strokeDasharray: {
                          duration: 1.05,
                          delay: 0.06 + idx * 0.045,
                          ease: [0.16, 1, 0.3, 1],
                        },
                        scale: { type: "spring", stiffness: 380, damping: 26 },
                        strokeWidth: { type: "spring", stiffness: 380, damping: 26 },
                        opacity: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
                      }}
                      onClick={() => handleSliceClick(seg.name)}
                      onMouseEnter={() => setHoveredSlice(seg.name)}
                      onMouseLeave={() => setHoveredSlice(null)}
                      className="cursor-pointer"
                    />

                    {/* Cylindrical 3D Crest Sheen (Organic living breathing light) */}
                    <motion.circle
                      cx="85"
                      cy="85"
                      r={radius}
                      fill="none"
                      stroke={isDark ? "rgba(255,255,255,0.24)" : "rgba(255,255,255,0.48)"}
                      strokeWidth={isSelected ? 2.5 : isActive ? 2.2 : 1.75}
                      strokeDasharray={`${Math.max(0, seg.dashLength - 3)} ${circumference}`}
                      strokeDashoffset={seg.dashOffset - 1.5}
                      strokeLinecap="round"
                      className="pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{
                        scale: isSelected ? 1.02 : isActive ? 1.015 : 1,
                        opacity: isAnyActive
                          ? isActive
                            ? 0.95
                            : 0.12
                          : [0.42, 0.68, 0.42],
                      }}
                      style={{ transformOrigin: "85px 85px" }}
                      transition={{
                        scale: { type: "spring", stiffness: 380, damping: 26 },
                        strokeWidth: { type: "spring", stiffness: 380, damping: 26 },
                        opacity: isAnyActive
                          ? { duration: 0.2 }
                          : {
                            duration: 4.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: idx * 0.35,
                          },
                      }}
                    />
                  </g>
                );
              })}
            </g>

            {/* Living Ambient Specular Sweep (Whisper-thin liquid light reflection across the rings) */}
            <motion.g
              animate={{
                rotate: 360,
                opacity: isAnyActive ? 0.2 : 1,
              }}
              transition={{
                rotate: {
                  duration: 12,
                  repeat: Infinity,
                  ease: "linear",
                },
                opacity: { duration: 0.25 },
              }}
              style={{ transformOrigin: "85px 85px" }}
              className="pointer-events-none"
            >
              <circle
                cx="85"
                cy="85"
                r={radius}
                fill="none"
                stroke="url(#ring-specular-glint)"
                strokeWidth={strokeWidth - 2}
                strokeDasharray={`80 ${circumference - 80}`}
                strokeLinecap="round"
                style={{
                  mixBlendMode: isDark ? "overlay" : "soft-light",
                }}
              />
            </motion.g>
          </svg>

          {/* Clean Center Typography with Dynamic Feedback & Smoothing Rounding Counter */}
          <div
            onClick={selectedSlice ? handleReset : undefined}
            className={`absolute inset-0 flex flex-col items-center justify-center select-none ${selectedSlice ? "cursor-pointer pointer-events-auto" : "pointer-events-none"
              }`}
            title={selectedSlice ? "Click to view total leads" : undefined}
          >
            <AnimatePresence mode="wait">
              {activeSliceData ? (
                <motion.div
                  key={`${activeSliceData.name}-${animationKey}`}
                  initial={{ opacity: 0, y: 1.5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -1.5 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center justify-center text-center px-2"
                >
                  <span
                    className={`text-[28px] sm:text-[32px] font-light tracking-[-0.035em] leading-none tabular-nums ${isDark ? "text-white" : "text-[#0B0F17]"
                      }`}
                  >
                    <AnimatedRoundingNumber
                      value={activeSliceData.pct}
                      duration={0.4}
                      suffix="%"
                      suffixClassName={`text-[13px] sm:text-[15px] font-light ml-1 leading-none select-none ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                        }`}
                      triggerKey={`${activeSliceData.name}-pct-${animationKey}`}
                    />
                  </span>
                  <div className="flex items-center justify-center gap-1.5 mt-2 sm:mt-2.5">
                    <span
                      className={`text-[10px] sm:text-[10.5px] font-medium tracking-[0.02em] leading-none truncate max-w-[95px] ${isDark ? "text-white/90" : "text-[#0F172A]"
                        }`}
                    >
                      {activeSliceData.name}
                    </span>
                    <span
                      className={`text-[9px] leading-none select-none ${isDark ? "text-white/20" : "text-slate-300"
                        }`}
                    >
                      ·
                    </span>
                    <span
                      className={`text-[10px] sm:text-[10.5px] font-normal tracking-tight leading-none tabular-nums ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                        }`}
                    >
                      <AnimatedRoundingNumber
                        value={activeSliceData.count}
                        duration={0.35}
                        triggerKey={`${activeSliceData.name}-count-${animationKey}`}
                      />{" "}
                      leads
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`total-${animationKey}`}
                  initial={{ opacity: 0, y: 1.5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -1.5 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center justify-center text-center px-2"
                >
                  <span
                    className={`text-[28px] sm:text-[32px] font-light tracking-[-0.035em] leading-none tabular-nums ${isDark ? "text-white" : "text-[#0B0F17]"
                      }`}
                  >
                    <AnimatedRoundingNumber
                      value={totalLeads}
                      duration={0.45}
                      triggerKey={`total-${animationKey}`}
                    />
                  </span>
                  <div className="flex items-center justify-center mt-2 sm:mt-2.5">
                    <span
                      className={`text-[9.5px] sm:text-[10px] font-medium tracking-[0.16em] uppercase leading-none select-none ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
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

        {/* Minimal Uncluttered Legend List with Interactive Highlight & Click Selection */}
        <div className="flex flex-col gap-1.5 min-w-[155px]">
          {SLICES.map((slice) => {
            const isHovered = hoveredSlice === slice.name;
            const isSelected = selectedSlice === slice.name;
            const isActive = hoveredSlice ? isHovered : isSelected;

            return (
              <div
                key={slice.name}
                onClick={() => handleSliceClick(slice.name)}
                onMouseEnter={() => setHoveredSlice(slice.name)}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`group flex items-center justify-between gap-3 py-1.5 px-2.5 rounded-xl cursor-pointer transition-all duration-150 select-none ${isSelected
                    ? isDark
                      ? "bg-white/[0.08] ring-1 ring-white/15 shadow-sm"
                      : "bg-slate-100 ring-1 ring-slate-300/80 shadow-xs"
                    : isHovered
                      ? isDark
                        ? "bg-white/[0.05] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                        : "bg-slate-50 shadow-2xs"
                      : "hover:bg-white/[0.02]"
                  }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`h-1.5 rounded-full shrink-0 transition-all duration-200 ${isActive ? "w-3.5 scale-105 shadow-xs" : "w-2.5 opacity-80 group-hover:opacity-100"
                      }`}
                    style={{
                      background: `linear-gradient(90deg, ${isDark ? slice.fromColorDark : slice.fromColorLight
                        }, ${isDark ? slice.toColorDark : slice.toColorLight})`,
                    }}
                  />
                  <span
                    className={`text-[12px] font-medium tracking-tight truncate transition-colors duration-150 ${isActive
                        ? isDark
                          ? "text-white"
                          : "text-[#0B0F17]"
                        : isDark
                          ? "text-[#8e95a5] group-hover:text-white/90"
                          : "text-[#64748B] group-hover:text-[#0F172A]"
                      }`}
                  >
                    {slice.name}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`text-[11px] font-medium tabular-nums tracking-tight px-1.5 py-0.5 rounded transition-colors duration-150 ${isActive
                        ? isDark
                          ? "bg-white/[0.1] text-white"
                          : "bg-slate-200/80 text-[#0F172A]"
                        : isDark
                          ? "bg-white/[0.04] text-[#8e95a5]"
                          : "bg-slate-100 text-[#64748B]"
                      }`}
                  >
                    {slice.count}
                  </span>
                  <span
                    className={`w-7 text-right text-[11.5px] font-medium tabular-nums tracking-tight transition-colors duration-150 ${isActive
                        ? isDark
                          ? "text-white"
                          : "text-[#0B0F17]"
                        : isDark
                          ? "text-[#8e95a5]"
                          : "text-[#64748B]"
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

