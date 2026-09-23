"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paperclip, Mic, ArrowUp, Sparkles, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const PROMPT_SUGGESTIONS = [
  "Summarize today",
  "Create a report",
  "Draft a follow-up email",
  "Schedule a meeting",
  "···",
];

export default function WorkspaceAIPromptBar() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (text?: string) => {
    const query = text || prompt;
    if (!query.trim()) return;

    setIsThinking(true);
    setResponseMessage(null);

    // Simulated executive copilot response
    setTimeout(() => {
      setIsThinking(false);
      if (query.toLowerCase().includes("summarize")) {
        setResponseMessage(
          "Today your front desk handled 24 calls with an 18.4% conversion rate, qualified 12 new leads (mostly from Website and Phone), and booked 8 appointments into the calendar."
        );
      } else if (query.toLowerCase().includes("report")) {
        setResponseMessage(
          "Performance report prepared: Weekly lead influx is up 20% vs last week, with Friday reaching peak volume of 12 appointments scheduled."
        );
      } else if (query.toLowerCase().includes("follow-up") || query.toLowerCase().includes("email")) {
        setResponseMessage(
          "Follow-up draft ready for Priya Mehta (Admission inquiry): Personalized confirmation and checklist prepared for review."
        );
      } else if (query.toLowerCase().includes("meeting") || query.toLowerCase().includes("schedule")) {
        setResponseMessage(
          "Next available slots checked for tomorrow: 11:30 AM and 3:00 PM are clear with zero calendar conflicts."
        );
      } else {
        setResponseMessage(
          `Analysis complete for "${query}": CRM synchronized and operational actions updated.`
        );
      }
      setPrompt("");
    }, 700);
  };

  const handleChipClick = (suggestion: string) => {
    if (suggestion === "···") {
      setPrompt("What are the key priorities for the rest of this afternoon?");
      inputRef.current?.focus();
      return;
    }
    setPrompt(suggestion);
    handleSubmit(suggestion);
  };

  return (
    <div className="fixed bottom-3 sm:bottom-4 inset-x-0 z-50 flex flex-col items-center pointer-events-none px-4">
      {/* Interactive Floating Response Card */}
      <AnimatePresence>
        {(isThinking || responseMessage) && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto max-w-lg w-full mb-2 p-3.5 rounded-2xl border shadow-2xl backdrop-blur-2xl ${
              isDark
                ? "bg-[#0e121b]/95 border-white/[0.08] text-white shadow-black/60"
                : "bg-white/95 border-[#E2E8F0] text-[#0F172A] shadow-slate-200/80"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
                <span className="text-[11px] font-medium tracking-tight">
                  {isThinking ? "MAYA is synthesizing front desk data..." : "MAYA Synthesis"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResponseMessage(null);
                  setIsThinking(false);
                }}
                className="text-[#6b7280] hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {isThinking ? (
              <div className="mt-2 flex items-center gap-2 text-[11.5px] text-[#8e95a5]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>Reading live CRM feeds, appointment rosters, and activity logs...</span>
              </div>
            ) : (
              <p
                className={`mt-1.5 text-[11.5px] leading-relaxed font-normal ${
                  isDark ? "text-[#9ca3af]" : "text-[#475569]"
                }`}
              >
                {responseMessage}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Pill Floating Dock */}
      <div className="pointer-events-auto max-w-lg w-full flex flex-col items-center">
        {/* Input Bar */}
        <div
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-full border shadow-2xl backdrop-blur-2xl transition-all duration-200 ${
            isFocused
              ? isDark
                ? "bg-[#0e121d] border-white/25 shadow-[0_4px_24px_rgba(0,0,0,0.7)]"
                : "bg-white border-[#0B0F17] shadow-lg"
              : isDark
              ? "bg-[#0b0e16]/90 border-white/[0.08] hover:border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              : "bg-white/95 border-[#E2E8F0] hover:border-slate-300 shadow-slate-200/70"
          }`}
        >
          {/* Attachment Icon */}
          <button
            type="button"
            className={`p-1 rounded-full transition-colors cursor-pointer ${
              isDark
                ? "text-[#8a929f] hover:text-white hover:bg-white/[0.04]"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            }`}
            title="Attach documents"
          >
            <Paperclip className="w-3.5 h-3.5" />
          </button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
            placeholder="Ask MAYA anything..."
            className={`w-full mx-2 bg-transparent text-[12px] outline-none font-normal placeholder:transition-opacity ${
              isDark
                ? "text-white placeholder:text-[#556070]"
                : "text-[#0F172A] placeholder:text-[#94A3B8]"
            }`}
          />

          {/* Right Actions: Mic + Send Button */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              className={`p-1 rounded-full transition-colors cursor-pointer ${
                isDark
                  ? "text-[#8a929f] hover:text-white hover:bg-white/[0.04]"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              }`}
              title="Voice dictation"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>

            {/* Circular Send Button */}
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!prompt.trim()}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer ${
                prompt.trim()
                  ? isDark
                    ? "bg-white hover:bg-neutral-100 text-black scale-100 active:scale-95 shadow-sm"
                    : "bg-[#0B0F17] hover:bg-[#1E293B] text-white scale-100 active:scale-95 shadow-sm"
                  : isDark
                  ? "bg-white/[0.06] text-[#556070] cursor-not-allowed"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
              title="Send to MAYA"
            >
              <ArrowUp className="w-3 h-3 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* Suggestion Prompt Chips */}
        <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap">
          {PROMPT_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleChipClick(suggestion)}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border backdrop-blur-md transition-all duration-150 cursor-pointer active:scale-95 ${
                isDark
                  ? "bg-[#0b0e16]/80 border-white/[0.08] text-[#8e95a5] hover:bg-white/[0.06] hover:text-white hover:border-white/15"
                  : "bg-white/80 border-[#E2E8F0] text-[#64748B] hover:bg-white hover:text-[#0B0F17] shadow-2xs"
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
