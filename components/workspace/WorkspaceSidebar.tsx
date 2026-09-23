"use client";

import React from "react";
import {
  Home,
  MessageSquare,
  Users,
  Calendar,
  CheckCircle2,
  Contact,
  Box,
  TrendingUp,
  Wrench,
  Settings,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import MayaWordmark from "@/components/MayaWordmark";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "conversations", label: "Conversations", icon: MessageSquare },
  { id: "leads", label: "Leads", icon: Users },
  { id: "appointments", label: "Appointments", icon: Calendar },
  { id: "follow-ups", label: "Follow-ups", icon: CheckCircle2 },
  { id: "contacts", label: "Contacts", icon: Contact },
  { id: "knowledge", label: "Knowledge", icon: Box },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "tools", label: "Tools", icon: Wrench },
];

const SECONDARY_NAV_ITEMS: NavItem[] = [
  { id: "settings", label: "Settings", icon: Settings },
  { id: "help", label: "Help", icon: HelpCircle },
];

export default function WorkspaceSidebar({
  activeTab = "home",
  onTabChange,
  onTalkToMaya,
}: {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onTalkToMaya?: () => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleSelect = (id: string) => {
    if (onTabChange) onTabChange(id);
  };

  return (
    <aside
      className={`w-56 lg:w-60 shrink-0 h-full flex flex-col justify-between border-r px-3.5 py-4 transition-colors duration-300 select-none overflow-hidden ${
        isDark
          ? "bg-[#060709] border-white/[0.07] text-[#8a929f]"
          : "bg-white border-slate-200/80 text-[#475569]"
      }`}
    >
      {/* Top Section: Main Navigation + Meet Maya Card */}
      <div className="flex flex-col flex-1 min-h-0 justify-between">
        <div className="flex flex-col gap-1">
          {PRIMARY_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`group flex items-center gap-3.5 px-3.5 py-2 rounded-xl text-[13px] tracking-[-0.01em] transition-all duration-150 cursor-pointer ${
                  isActive
                    ? isDark
                      ? "bg-white text-[#0B0F17] font-medium shadow-[0_1px_3px_rgba(0,0,0,0.35)]"
                      : "bg-[#0F172A] text-white font-medium shadow-sm"
                    : isDark
                    ? "text-[#8a929f] hover:text-white hover:bg-white/[0.04]"
                    : "text-[#475569] hover:text-[#0F172A] hover:bg-slate-100/70"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive
                      ? "scale-105 stroke-[2]"
                      : "opacity-75 stroke-[1.65] group-hover:opacity-100"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* MEET MAYA - Apple-Grade Luxury Card Lowered Gracefully Below Tools */}
        <div className="mt-5 mb-auto">
          <div
            className={`relative rounded-2xl p-4 border overflow-hidden transition-all duration-200 shrink-0 select-none ${
              isDark
                ? "bg-gradient-to-b from-[#111724]/95 via-[#0c101a]/95 to-[#080b12]/98 border-white/[0.09] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_24px_-6px_rgba(0,0,0,0.55)]"
                : "bg-gradient-to-b from-white via-white to-[#F8FAFC] border-slate-200/90 text-[#0B0F17] shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_4px_16px_rgba(15,23,42,0.05)]"
            }`}
          >
            {/* Misty Mountain Artistic SVG Backdrop */}
            <div className="absolute top-0 right-0 left-0 h-32 pointer-events-none opacity-25 select-none overflow-hidden">
              <svg
                viewBox="0 0 320 180"
                className="w-full h-full object-cover"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="sidebar-maya-sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isDark ? "#1e293b" : "#e0f2fe"} stopOpacity="0.6" />
                    <stop offset="100%" stopColor={isDark ? "#060709" : "#ffffff"} stopOpacity="1" />
                  </linearGradient>
                  <linearGradient id="sidebar-maya-ridge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isDark ? "#ffffff" : "#0F172A"} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={isDark ? "#060709" : "#ffffff"} stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                <rect width="320" height="180" fill="url(#sidebar-maya-sky)" />
                <path
                  d="M -20 120 Q 50 60, 120 90 T 260 40 T 340 100 L 340 180 L -20 180 Z"
                  fill="url(#sidebar-maya-ridge)"
                />
              </svg>
            </div>

            {/* Content Container: Apple Hierarchy & Prominent Typography */}
            <div className="relative z-10 flex flex-col gap-2">
              {/* Eyebrow */}
              <span className="text-[9px] font-semibold uppercase tracking-[0.24em] inline-block animate-luxury-shimmer select-none">
                MEET MAYA
              </span>

              {/* Headline */}
              <h4 className="text-[14px] font-light tracking-[-0.03em] leading-snug">
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
                  onClick={() => (onTalkToMaya ? onTalkToMaya() : handleSelect("conversations"))}
                  className={`w-fit inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 cursor-pointer active:scale-95 shadow-sm group ${
                    isDark
                      ? "bg-white text-[#0B0F17] hover:bg-neutral-100"
                      : "bg-[#0B0F17] text-white hover:bg-[#1E293B]"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span>Talk to</span>
                    <MayaWordmark className="h-2.5 w-auto text-current translate-y-[0.5px]" />
                  </span>
                  <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Settings & Help */}
      <div className={`flex flex-col gap-1 pt-3.5 border-t select-none shrink-0 ${
        isDark ? "border-white/[0.08]" : "border-[#E2E8F0]"
      }`}>
        {SECONDARY_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className={`group flex items-center gap-3.5 px-3.5 py-2 rounded-xl text-[12.5px] font-normal transition-colors cursor-pointer ${
                isActive
                  ? isDark
                    ? "text-white bg-white/[0.06]"
                    : "text-[#0F172A] bg-slate-100"
                  : isDark
                  ? "text-[#8a929f] hover:text-white hover:bg-white/[0.03]"
                  : "text-[#475569] hover:text-[#0F172A] hover:bg-slate-100/50"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0 opacity-70 stroke-[1.65] group-hover:opacity-100" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
