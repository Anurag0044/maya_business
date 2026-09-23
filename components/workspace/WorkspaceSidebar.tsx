"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

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
}: {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [currentTab, setCurrentTab] = useState(activeTab);

  const handleSelect = (id: string) => {
    setCurrentTab(id);
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
      {/* Top Section: Main Navigation */}
      <div className="flex flex-col gap-1">
        {PRIMARY_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className={`group flex items-center gap-3.5 px-4 py-2 rounded-full text-[13px] tracking-[-0.01em] transition-all duration-200 cursor-pointer ${
                isActive
                  ? isDark
                    ? "bg-white text-[#0B0F17] font-medium shadow-sm"
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

      {/* Bottom Section: Settings, Help, MAYA Online, Misty Mountain Motto */}
      <div className="flex flex-col gap-3.5 pt-3 select-none">
        {/* Settings & Help Navigation */}
        <div className="flex flex-col gap-0.5">
          {SECONDARY_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`group flex items-center gap-3.5 px-4 py-1.5 rounded-full text-[12.5px] font-normal transition-colors cursor-pointer ${
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

        {/* MAYA Online (Clean, Minimalist Unboxed Presentation matching reference image) */}
        <div className="flex items-center gap-3 px-3 pt-1">
          <div className="relative flex items-center justify-center shrink-0">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isDark ? "bg-emerald-400" : "bg-[#0F172A]"
              }`}
            />
            <span
              className={`absolute w-2.5 h-2.5 rounded-full ${
                isDark ? "bg-emerald-400" : "bg-[#0F172A]"
              } animate-ping opacity-35`}
            />
          </div>
          <div className="flex flex-col text-left">
            <span
              className={`text-[12.5px] font-semibold leading-tight tracking-tight ${
                isDark ? "text-white" : "text-[#0F172A]"
              }`}
            >
              MAYA Online
            </span>
            <span
              className={`text-[10.5px] leading-tight font-normal mt-0.5 ${
                isDark ? "text-[#8e95a5]" : "text-[#64748B]"
              }`}
            >
              Ready to assist
            </span>
          </div>
        </div>

        {/* Ethereal Misty Mountain Graphic & Motto */}
        <div className="relative pt-1 overflow-hidden pointer-events-none opacity-80">
          <div className="w-full h-9 relative flex items-end">
            <svg
              viewBox="0 0 200 45"
              className="w-full h-full"
              preserveAspectRatio="none"
              shapeRendering="geometricPrecision"
            >
              <defs>
                <linearGradient id="sb-mist-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={isDark ? "#ffffff" : "#0F172A"}
                    stopOpacity={isDark ? "0.14" : "0.10"}
                  />
                  <stop
                    offset="100%"
                    stopColor={isDark ? "#060709" : "#ffffff"}
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>
              <path
                d="M 0 35 Q 30 15, 65 24 T 140 10 T 200 28 L 200 45 L 0 45 Z"
                fill="url(#sb-mist-grad)"
              />
              <path
                d="M 0 39 Q 45 22, 90 30 T 160 18 T 200 33 L 200 45 L 0 45 Z"
                fill={isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)"}
              />
            </svg>
          </div>

          <div
            className={`text-[8.5px] uppercase tracking-[0.24em] font-medium leading-[1.65] text-left px-3 pt-1 ${
              isDark ? "text-[#717682]" : "text-[#94A3B8]"
            }`}
          >
            A quieter way
            <br />
            to a bigger tomorrow.
          </div>
        </div>
      </div>
    </aside>
  );
}
