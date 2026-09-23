"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Bell } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import MayaBrand from "@/components/MayaBrand";

export default function WorkspaceHeader() {
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

      {/* Right Utilities: Theme Toggle, Notifications, Profile */}
      <div className="flex items-center gap-3.5 shrink-0">
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
