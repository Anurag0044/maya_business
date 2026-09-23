"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  Phone,
  CheckSquare,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface MetricCardProps {
  id: string;
  label: string;
  value: number;
  changePct: number;
  isPositive: boolean;
  timeframe: string;
  icon: React.ComponentType<{ className?: string }>;
  strokeColorDark: string;
  strokeColorLight: string;
  sparklineD: string;
}

const METRICS_DATA: MetricCardProps[] = [
  {
    id: "new-leads",
    label: "NEW LEADS",
    value: 12,
    changePct: 20,
    isPositive: true,
    timeframe: "vs last week",
    icon: Users,
    strokeColorDark: "#38bdf8",
    strokeColorLight: "#0284c7",
    sparklineD: "M 0 24 C 25 26, 45 18, 70 16 C 95 14, 105 8, 120 5",
  },
  {
    id: "appointments",
    label: "APPOINTMENTS",
    value: 8,
    changePct: 12,
    isPositive: true,
    timeframe: "vs last week",
    icon: Calendar,
    strokeColorDark: "#c084fc",
    strokeColorLight: "#7c3aed",
    sparklineD: "M 0 23 C 25 25, 45 16, 70 17 C 95 18, 105 10, 120 6",
  },
  {
    id: "calls-handled",
    label: "CALLS HANDLED",
    value: 24,
    changePct: 33,
    isPositive: true,
    timeframe: "vs last week",
    icon: Phone,
    strokeColorDark: "#fbbf24",
    strokeColorLight: "#d97706",
    sparklineD: "M 0 26 C 25 27, 45 18, 65 13 C 85 8, 105 6, 120 4",
  },
  {
    id: "follow-ups",
    label: "FOLLOW-UPS",
    value: 6,
    changePct: 14,
    isPositive: false,
    timeframe: "vs last week",
    icon: CheckSquare,
    strokeColorDark: "#fb7185",
    strokeColorLight: "#e11d48",
    sparklineD: "M 0 6 C 25 5, 45 14, 65 18 C 85 22, 105 24, 120 25",
  },
];

function AnimatedCounter({
  value,
  duration = 0.75,
  delay = 0,
}: {
  value: number;
  duration?: number;
  delay?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let reqId: number;
    const durationMs = duration * 1000;
    const delayMs = delay * 1000;
    let timeoutId: NodeJS.Timeout;

    timeoutId = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / durationMs, 1);
        // Silk smooth quartic-out glide
        const eased = 1 - Math.pow(1 - progress, 4);
        setCount(Math.round(eased * value));

        if (progress < 1) {
          reqId = requestAnimationFrame(step);
        } else {
          setCount(value);
        }
      };

      reqId = requestAnimationFrame(step);
    }, delayMs);

    return () => {
      clearTimeout(timeoutId);
      if (reqId) cancelAnimationFrame(reqId);
    };
  }, [value, duration, delay]);

  return <span className="tabular-nums">{count}</span>;
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: idx * 0.05,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{ y: -2, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
            className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-default select-none ${isDark
                ? "bg-gradient-to-b from-[#111724]/95 via-[#0c101a]/95 to-[#080b12]/98 border-white/[0.09] hover:border-white/[0.2] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_24px_-6px_rgba(0,0,0,0.55)]"
                : "bg-gradient-to-b from-white via-white to-[#F8FAFC] border-slate-200/90 hover:border-slate-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_4px_16px_rgba(15,23,42,0.05)]"
              }`}
          >
            {/* Top Row: Architectural Eyebrow + Delicate Linear Icon */}
            <div className="flex items-center justify-between gap-2 relative z-10">
              <span
                className={`text-[9px] sm:text-[9.5px] font-medium uppercase tracking-[0.16em] truncate transition-colors duration-200 ${isDark
                    ? "text-[#8e95a5] group-hover:text-white"
                    : "text-slate-500 group-hover:text-slate-900"
                  }`}
              >
                {card.label}
              </span>

              <Icon
                className={`w-3.5 h-3.5 shrink-0 stroke-[1.4] transition-colors duration-200 ${isDark
                    ? "text-[#717682] group-hover:text-white"
                    : "text-slate-400 group-hover:text-slate-700"
                  }`}
              />
            </div>

            {/* Middle Row: Large Numeral + Whisper Vector Spline */}
            <div className="my-2 sm:my-2.5 flex items-baseline justify-between gap-2 relative z-10">
              <span
                className={`text-[28px] sm:text-[32px] font-light tracking-[-0.03em] leading-none tabular-nums shrink-0 ${isDark ? "text-white" : "text-[#0B0F17]"
                  }`}
              >
                <AnimatedCounter value={card.value} delay={idx * 0.08} />
              </span>

              {/* Minimalist Whisper-Thin Sparkline */}
              <div className="w-14 sm:w-18 md:w-20 h-6 sm:h-7 relative flex items-center shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                <svg
                  viewBox="0 0 120 32"
                  className="w-full h-full overflow-visible"
                  fill="none"
                >
                  <defs>
                    <linearGradient id={`spark-grad-${card.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={strokeColor} stopOpacity={isDark ? "0.18" : "0.12"} />
                      <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Gentle Shaded Area */}
                  <motion.path
                    d={`${card.sparklineD} L 120 32 L 0 32 Z`}
                    fill={`url(#spark-grad-${card.id})`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.15 + idx * 0.05 }}
                  />

                  {/* Silky Hairline Stroke */}
                  <motion.path
                    d={card.sparklineD}
                    stroke={strokeColor}
                    strokeWidth="1.35"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      pathLength: { duration: 0.85, delay: 0.12 + idx * 0.05, ease: [0.16, 1, 0.3, 1] },
                      opacity: { duration: 0.2, delay: 0.12 + idx * 0.05 },
                    }}
                  />
                </svg>
              </div>
            </div>

            {/* Bottom Row: Minimalist Editorial Trend Context with Luxury Gold */}
            <div className="flex items-center gap-1.5 text-[10.5px] sm:text-[11.5px] tracking-tight relative z-10 truncate">
              <span
                className={`font-medium shrink-0 ${card.isPositive
                    ? isDark
                      ? "text-[#fbbf24]"
                      : "text-[#d97706]"
                    : isDark
                      ? "text-rose-400"
                      : "text-rose-600"
                  }`}
              >
                {card.isPositive ? "↑" : "↓"} {card.isPositive ? "+" : "-"}{card.changePct}%
              </span>

              <span className={`shrink-0 ${isDark ? "text-white/20" : "text-slate-300"}`}>·</span>

              <span
                className={`truncate ${isDark ? "text-[#717682]" : "text-slate-500"
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



