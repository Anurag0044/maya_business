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
      {/* Top Section: Main Navigation */}
      <div className="flex flex-col gap-1">
        {PRIMARY_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

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

      {/* Bottom Section: Settings & Help */}
      <div className={`flex flex-col gap-0.5 pt-3 border-t select-none ${
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
              className={`group flex items-center gap-3.5 px-4 py-2 rounded-full text-[12.5px] font-normal transition-colors cursor-pointer ${
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
