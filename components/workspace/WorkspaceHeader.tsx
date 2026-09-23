"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Bell } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import MayaBrand from "@/components/MayaBrand";

interface WorkspaceHeaderProps {
  isAgentChatOpen?: boolean;
  onToggleAgentChat?: () => void;
}

export default function WorkspaceHeader({
  isAgentChatOpen = false,
  onToggleAgentChat,
}: WorkspaceHeaderProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  return (
    <header
      className={`sticky top-0 z-40 w-full h-13 sm:h-13.5 px-5 sm:px-6 flex items-center justify-between border-b shrink-0 transition-all duration-300 ${
        isDark
          ? "bg-[#060709]/85 border-white/[0.08] backdrop-blur-xl text-white shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
          : "bg-white/90 border-[#E2E8F0] backdrop-blur-xl text-[#0F172A] shadow-xs"
      }`}
    >
      {/* Left: Authentic MayaBrand Lockup */}
      <div className="flex items-center gap-6 shrink-0">
        <MayaBrand href="/" animated={false} />
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-xl mx-8 hidden md:block">
        <div
          className={`relative flex items-center w-full h-9.5 px-4 rounded-full border transition-all duration-200 ${
            searchFocused
              ? isDark
                ? "bg-[#0e121d] border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
                : "bg-white border-[#0B0F17] shadow-[0_0_0_1px_rgba(11,15,23,0.12)]"
              : isDark
              ? "bg-[#0b0e16]/80 border-white/[0.08] hover:border-white/15"
              : "bg-[#F8FAFC] border-[#E2E8F0] hover:border-slate-300"
          }`}
        >
          <Search
            className={`w-3.5 h-3.5 shrink-0 transition-colors ${
              searchFocused
                ? isDark
                  ? "text-white"
                  : "text-[#0B0F17]"
                : isDark
                ? "text-[#556070]"
                : "text-slate-400"
            }`}
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search leads, appointments, calls..."
            className={`w-full ml-2.5 bg-transparent text-[12.5px] outline-none font-normal placeholder:transition-opacity ${
              isDark
                ? "text-white placeholder:text-[#556070]"
                : "text-[#0F172A] placeholder:text-[#94A3B8]"
            }`}
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue("")}
              className="text-xs text-[#6b7280] hover:text-white px-1"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right Utilities: Theme Toggle, Notifications, Agent Chat Toggle, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Theme Toggle matching main navbar */}
        <ThemeToggle />

        {/* Notifications Bell */}
        <button
          type="button"
          className={`relative w-8.5 h-8.5 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            isDark
              ? "text-[#8a929f] hover:text-white hover:bg-white/[0.04]"
              : "text-[#64748B] hover:text-slate-900 hover:bg-slate-100"
          }`}
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#060709] dark:ring-[#060709]" />
        </button>

        {/* Agent Chat Side Toggle Bar Button - Minimal, premium squircle matching Cursor / VS Code layout toggle */}
        <button
          type="button"
          onClick={onToggleAgentChat}
          className={`relative w-8.5 h-8.5 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 border ${
            isAgentChatOpen
              ? isDark
                ? "bg-[#252a36] text-white border-white/25 shadow-[0_1px_3px_rgba(0,0,0,0.35)]"
                : "bg-[#0F172A] text-white border-[#0F172A] shadow-xs"
              : isDark
              ? "bg-white/[0.04] border-white/[0.08] text-[#8a929f] hover:text-white hover:bg-white/[0.08] hover:border-white/15"
              : "bg-slate-100/90 border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/80 hover:border-slate-300"
          }`}
          aria-label={isAgentChatOpen ? "Close Agent Chat Window" : "Open Agent Chat Window"}
          title={isAgentChatOpen ? "Close Agent Chat Window" : "Open Agent Chat Window"}
        >
          {/* Side Toggle Bar Icon - Right toggle square goes white ONLY when open, otherwise normal outline */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-4 h-4 shrink-0 transition-colors"
            aria-hidden="true"
          >
            {isAgentChatOpen ? (
              // Open State: Right toggle square goes solid white (matching reference image)
              <path d="M12.5 1C13.881 1 15 2.119 15 3.5V12.5C15 13.881 13.881 15 12.5 15H3.5C2.119 15 1 13.881 1 12.5V3.5C1 2.119 2.119 1 3.5 1H12.5ZM9 14V2H3.5C2.672 2 2 2.672 2 3.5V12.5C2 13.328 2.672 14 3.5 14H9Z" />
            ) : (
              // Closed State: Right toggle square remains normal (hollow outline matching left pane)
              <path d="M12.5 1H3.5C2.122 1 1 2.122 1 3.5V12.5C1 13.879 2.122 15 3.5 15H12.5C13.878 15 15 13.879 15 12.5V3.5C15 2.122 13.878 1 12.5 1ZM2 12.5V3.5C2 2.673 2.673 2 3.5 2H9V14H3.5C2.673 14 2 13.327 2 12.5ZM14 12.5C14 13.327 13.327 14 12.5 14H10V2H12.5C13.327 2 14 2.673 14 3.5V12.5Z" />
            )}
          </svg>
        </button>

        {/* User Profile Avatar & Name */}
        <div
          className={`flex items-center gap-2.5 pl-3 select-none border-l ${
            isDark ? "border-white/[0.08]" : "border-[#E2E8F0]"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold tracking-tight shadow-sm shrink-0 border ${
              isDark
                ? "bg-white text-black border-white"
                : "bg-[#0B0F17] text-white border-[#0B0F17]"
            }`}
          >
            S
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span
              className={`text-[12.5px] font-medium leading-tight ${
                isDark ? "text-white" : "text-[#0B0F17]"
              }`}
            >
              Sujal
            </span>
            <span
              className={`text-[10px] leading-tight font-normal ${
                isDark ? "text-[#8e95a5]" : "text-[#64748B]"
              }`}
            >
              Front Desk Manager
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
