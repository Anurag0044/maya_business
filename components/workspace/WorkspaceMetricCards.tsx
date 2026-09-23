"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  Phone,
  CheckSquare,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface MetricCardProps {
  id: string;
  title: string;
  value: number;
  changePct: number;
  isPositive: boolean;
  timeframe: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  strokeColorDark: string;
  strokeColorLight: string;
  sparklineD: string;
  endPoint: { x: number; y: number };
}

const METRICS_DATA: MetricCardProps[] = [
  {
    id: "new-leads",
    title: "New Leads",
    value: 12,
    changePct: 20,
    isPositive: true,
    timeframe: "vs last week",
    icon: Users,
    accentColor: "#38bdf8",
    strokeColorDark: "#38bdf8",
    strokeColorLight: "#0284c7",
    sparklineD: "M 0 32 Q 22 28, 45 31 T 90 20 T 135 12 T 160 6",
    endPoint: { x: 160, y: 6 },
  },
  {
    id: "appointments",
    title: "Appointments",
    value: 8,
    changePct: 12,
    isPositive: true,
    timeframe: "vs last week",
    icon: Calendar,
    accentColor: "#c084fc",
    strokeColorDark: "#c084fc",
    strokeColorLight: "#7c3aed",
    sparklineD: "M 0 30 Q 30 33, 60 24 T 110 18 T 145 10 T 160 5",
    endPoint: { x: 160, y: 5 },
  },
  {
    id: "calls-handled",
    title: "Calls Handled",
    value: 24,
    changePct: 33,
    isPositive: true,
    timeframe: "vs last week",
    icon: Phone,
    accentColor: "#34d399",
    strokeColorDark: "#34d399",
    strokeColorLight: "#059669",
    sparklineD: "M 0 34 Q 25 35, 55 26 T 100 20 T 130 12 T 160 4",
    endPoint: { x: 160, y: 4 },
  },
  {
    id: "pending-followups",
    title: "Pending Follow-ups",
    value: 6,
    changePct: 14,
    isPositive: false,
    timeframe: "vs last week",
    icon: CheckSquare,
    accentColor: "#fb7185",
    strokeColorDark: "#fb7185",
    strokeColorLight: "#e11d48",
    sparklineD: "M 0 8 Q 30 14, 60 20 T 110 26 T 140 31 T 160 35",
    endPoint: { x: 160, y: 35 },
  },
];

function AnimatedCounter({ value, duration = 1.0 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let reqId: number;
    const durationMs = duration * 1000;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / durationMs, 1);
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
  }, [value, duration]);

  return <span>{count}</span>;
}

export default function WorkspaceMetricCards() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 shrink-0 select-none">
      {METRICS_DATA.map((card, idx) => {
        const Icon = card.icon;
        const strokeColor = isDark ? card.strokeColorDark : card.strokeColorLight;

        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: idx * 0.06,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{ y: -2, transition: { duration: 0.18, ease: "easeOut" } }}
            className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-default ${
              isDark
                ? "bg-gradient-to-b from-[#111724]/95 via-[#0c101a]/95 to-[#080b12]/98 border-white/[0.09] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_24px_-6px_rgba(0,0,0,0.55)] hover:border-white/25 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_12px_36px_-6px_rgba(0,0,0,0.7)]"
                : "bg-gradient-to-b from-white via-white to-[#F8FAFC] border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_4px_16px_rgba(15,23,42,0.05)] hover:border-slate-300 hover:shadow-md"
            }`}
          >
            {/* Top-Corner Ambient Light Bloom on Hover */}
            <div
              className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-25 transition-opacity duration-500 pointer-events-none"
              style={{ backgroundColor: card.accentColor }}
            />

            {/* Top Row: Micro Eyebrow Title + Frosted Jewel Icon */}
            <div className="flex items-center justify-between relative z-10">
              <span
                className={`text-[9.5px] font-medium uppercase tracking-[0.2em] truncate transition-colors duration-200 ${
                  isDark
                    ? "text-[#8e95a5] group-hover:text-white/90"
                    : "text-[#64748B] group-hover:text-[#0F172A]"
                }`}
              >
                {card.title}
              </span>

              <div
                style={{ color: card.accentColor }}
                className={`w-7.5 h-7.5 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 ${
                  isDark
                    ? "bg-white/[0.04] border-white/[0.1] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] group-hover:border-white/25"
                    : "bg-slate-50 border-slate-200/90 shadow-2xs group-hover:border-slate-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Middle Row: Grand Display Figure + High-Resolution Area Sparkline */}
            <div className="my-2 flex items-baseline justify-between gap-3 relative z-10">
              <span
                className={`text-[28px] sm:text-[31px] font-light tracking-[-0.04em] leading-none tabular-nums ${
                  isDark ? "text-white" : "text-[#0B0F17]"
                }`}
              >
                <AnimatedCounter value={card.value} />
              </span>

              {/* Area-Gradient Sparkline */}
              <div className="w-22 h-9 relative flex items-center shrink-0">
                <svg
                  viewBox="0 0 160 40"
                  className="w-full h-full overflow-visible"
                  fill="none"
                >
                  <defs>
                    <linearGradient id={`spark-grad-${card.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={strokeColor} stopOpacity={isDark ? "0.35" : "0.25"} />
                      <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Shaded Area Under Curve */}
                  <motion.path
                    d={`${card.sparklineD} L 160 40 L 0 40 Z`}
                    fill={`url(#spark-grad-${card.id})`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 + idx * 0.05 }}
                  />

                  {/* Silky Stroke Line */}
                  <motion.path
                    d={card.sparklineD}
                    stroke={strokeColor}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      pathLength: { duration: 1.2, delay: 0.15 + idx * 0.06, ease: "easeOut" },
                      opacity: { duration: 0.25, delay: 0.15 + idx * 0.06 },
                    }}
                  />

                  {/* Glowing Endpoint Cap */}
                  <motion.circle
                    cx={card.endPoint.x}
                    cy={card.endPoint.y}
                    r="3"
                    fill={strokeColor}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.1 + idx * 0.05, duration: 0.3 }}
                    className="drop-shadow-[0_0_6px_currentColor]"
                  />
                </svg>
              </div>
            </div>

            {/* Bottom Row: Pill Trend Indicator + Comparative Context */}
            <div className="flex items-center gap-2 relative z-10">
              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                  card.isPositive
                    ? isDark
                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                      : "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : isDark
                    ? "bg-rose-500/10 border-rose-500/25 text-rose-400"
                    : "bg-rose-50 border-rose-200 text-rose-700"
                }`}
              >
                {card.isPositive ? (
                  <>
                    <TrendingUp className="w-2.5 h-2.5 stroke-[2.5]" />
                    <span>+{card.changePct}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-2.5 h-2.5 stroke-[2.5]" />
                    <span>-{card.changePct}%</span>
                  </>
                )}
              </div>

              <span
                className={`text-[10.5px] font-normal tracking-tight truncate ${
                  isDark ? "text-[#717682]" : "text-[#94A3B8]"
                }`}
              >
                {card.timeframe}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
