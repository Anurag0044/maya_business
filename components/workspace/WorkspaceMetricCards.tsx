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
  strokeColorDark: string;
  strokeColorLight: string;
  sparklineD: string;
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
    strokeColorDark: "#38bdf8",
    strokeColorLight: "#2563EB",
    sparklineD: "M 0 32 Q 22 28, 45 31 T 90 22 T 135 12 T 160 8",
  },
  {
    id: "appointments",
    title: "Appointments",
    value: 8,
    changePct: 12,
    isPositive: true,
    timeframe: "vs last week",
    icon: Calendar,
    strokeColorDark: "#c084fc",
    strokeColorLight: "#8B5CF6",
    sparklineD: "M 0 30 Q 30 33, 60 25 T 110 20 T 145 10 T 160 6",
  },
  {
    id: "calls-handled",
    title: "Calls Handled",
    value: 24,
    changePct: 33,
    isPositive: true,
    timeframe: "vs last week",
    icon: Phone,
    strokeColorDark: "#34d399",
    strokeColorLight: "#10B981",
    sparklineD: "M 0 34 Q 25 35, 55 28 T 100 24 T 130 14 T 160 5",
  },
  {
    id: "pending-followups",
    title: "Pending Follow-ups",
    value: 6,
    changePct: 14,
    isPositive: false,
    timeframe: "vs last week",
    icon: CheckSquare,
    strokeColorDark: "#fb7185",
    strokeColorLight: "#F43F5E",
    sparklineD: "M 0 8 Q 30 12, 60 16 T 110 24 T 140 29 T 160 33",
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
      {METRICS_DATA.map((card, idx) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: idx * 0.05,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{ y: -1, transition: { duration: 0.15 } }}
            className={`p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
              isDark
                ? "bg-[#0e121b]/85 border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:border-white/20"
                : "bg-white border-[#E2E8F0] shadow-2xs hover:border-slate-300"
            }`}
          >
            {/* Top row: Icon + Title */}
            <div className="flex items-center justify-between">
              <span
                className={`text-[9px] font-medium uppercase tracking-[0.18em] select-none truncate ${
                  isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                }`}
              >
                {card.title}
              </span>
              <div
                className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${
                  isDark
                    ? "bg-white/[0.04] border-white/[0.08] text-white/80"
                    : "bg-[#F1F5F9] border-[#E2E8F0] text-[#0F172A]"
                }`}
              >
                <Icon className="w-3 h-3" />
              </div>
            </div>

            {/* Middle row: Big metric number + Sparkline curve */}
            <div className="my-1.5 flex items-baseline justify-between gap-2">
              <span
                className={`text-[23px] sm:text-[25px] font-light tracking-[-0.035em] leading-none tabular-nums ${
                  isDark ? "text-white" : "text-[#0B0F17]"
                }`}
              >
                <AnimatedCounter value={card.value} />
              </span>

              {/* Compact Sparkline Curve */}
              <div className="w-18 h-7 relative flex items-center">
                <svg
                  viewBox="0 0 160 40"
                  className="w-full h-full overflow-visible"
                  fill="none"
                >
                  <motion.path
                    d={card.sparklineD}
                    stroke={isDark ? card.strokeColorDark : card.strokeColorLight}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      pathLength: { duration: 1.2, delay: 0.15 + idx * 0.06, ease: "easeOut" },
                      opacity: { duration: 0.25, delay: 0.15 + idx * 0.06 },
                    }}
                  />
                </svg>
              </div>
            </div>

            {/* Bottom row: Trend indicator badge */}
            <div className="flex items-center gap-1.5 text-[10px] font-mono leading-none">
              {card.isPositive ? (
                <>
                  <span className="text-emerald-400 font-medium inline-flex items-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5" />
                    +{card.changePct}%
                  </span>
                  <span className={isDark ? "text-[#717682]" : "text-[#94A3B8]"}>
                    {card.timeframe}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-rose-400 font-medium inline-flex items-center gap-0.5">
                    <TrendingDown className="w-2.5 h-2.5" />
                    -{card.changePct}%
                  </span>
                  <span className={isDark ? "text-[#717682]" : "text-[#94A3B8]"}>
                    {card.timeframe}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
