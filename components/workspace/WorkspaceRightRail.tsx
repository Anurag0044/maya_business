"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ArrowUp,
  Sparkles,
  RotateCcw,
  Plus,
  X,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface WorkspaceRightRailProps {
  onClose?: () => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "maya";
  text: string;
  timestamp: string;
  actionCard?: {
    title: string;
    details: string;
    badge: string;
  };
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "maya",
    text: "Good afternoon Sujal. All front desk channels are live. Today I've handled 24 calls with an 18.4% conversion rate and confirmed 8 calendar appointments. How can I assist you right now?",
    timestamp: "1:45 PM",
  },
];

export default function WorkspaceRightRail({ onClose }: WorkspaceRightRailProps = {}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(new Date()),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsThinking(true);

    // Simulated executive copilot synthesis
    setTimeout(() => {
      setIsThinking(false);
      let responseText = "";
      let actionCard: ChatMessage["actionCard"] | undefined = undefined;

      const lower = query.toLowerCase();
      if (lower.includes("summarize") || lower.includes("call")) {
        responseText =
          "Front Desk Summary:\n• 24 calls handled today (19 inbound, 5 automated callbacks)\n• 8 appointments confirmed with zero calendar overlap\n• 4 priority admission inquiries flagged for your review\n• Average front desk pickup latency: 1.8 seconds.";
        actionCard = {
          title: "Front Desk Overview",
          details: "24 calls handled · 8 confirmed · 18.4% conversion",
          badge: "Real-time",
        };
      } else if (lower.includes("slot") || lower.includes("tomorrow") || lower.includes("calendar")) {
        responseText =
          "Tomorrow's calendar has 3 optimal consultation openings:\n• 10:30 AM – 11:30 AM\n• 01:30 PM – 02:30 PM\n• 04:00 PM – 05:00 PM\nWould you like me to reserve the 10:30 AM slot for Priya Mehta?";
        actionCard = {
          title: "Calendar Availability",
          details: "3 open slots tomorrow · 0 schedule conflicts",
          badge: "Open Slots",
        };
      } else if (lower.includes("priya") || lower.includes("follow-up") || lower.includes("draft")) {
        responseText =
          "Draft prepared for Priya Mehta (Course Enquiry):\n'Hi Priya, thank you for reaching out to MAYA. We've reserved an admission briefing slot for you tomorrow at 1:30 PM. Click below to verify.'\nReady to dispatch via WhatsApp or SMS.";
        actionCard = {
          title: "Outbound Dispatch Draft",
          details: "WhatsApp & SMS template ready for Priya Mehta",
          badge: "Draft Ready",
        };
      } else if (lower.includes("conversion") || lower.includes("rate") || lower.includes("analytics")) {
        responseText =
          "Lead conversion is pacing at 18.4% today (+2.4% above last week's benchmark). Website inbound conversions are leading at 32%, followed by direct phone calls at 28%.";
      } else {
        responseText = `Understood. I have logged "${query}" into the front desk stream and synchronized with your workspace database.`;
      }

      const mayaMsg: ChatMessage = {
        id: `maya-${Date.now()}`,
        sender: "maya",
        text: responseText,
        timestamp: new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        }).format(new Date()),
        actionCard,
      };

      setMessages((prev) => [...prev, mayaMsg]);
    }, 750);
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
    setInputText("");
    setIsThinking(false);
  };

  return (
    <aside className="w-full max-w-[340px] h-full flex flex-col select-none overflow-hidden">
      {/* Unified Agent Chat Window */}
      <div
        className={`w-full h-full flex-1 min-h-0 rounded-2xl border flex flex-col justify-between overflow-hidden transition-all duration-300 ${isDark
            ? "bg-gradient-to-b from-[#111724]/95 via-[#0c101a]/95 to-[#080b12]/98 border-white/[0.09] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_24px_-6px_rgba(0,0,0,0.55)]"
            : "bg-gradient-to-b from-white via-white to-[#F8FAFC] border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_4px_16px_rgba(15,23,42,0.05)]"
          }`}
      >
        {/* Minimal Header with MAYA Agent, Reset and Close */}
        <div
          className={`p-3 px-3.5 border-b flex items-center justify-between shrink-0 select-none ${isDark
              ? "border-white/[0.08] bg-black/25"
              : "border-slate-200/80 bg-slate-50/70"
            }`}
        >
          <div className="flex items-center">
            <span
              className={`text-[12px] font-medium tracking-tight ${isDark ? "text-white" : "text-[#0B0F17]"
                }`}
            >
              MAYA Agent
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleResetChat}
              title="Reset conversation"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDark
                  ? "text-[#717682] hover:text-white hover:bg-white/[0.06]"
                  : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                title="Close Agent Chat Window"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDark
                    ? "text-[#717682] hover:text-white hover:bg-white/[0.06]"
                    : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                  }`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Messages Thread Container (clean, scrollbars hidden with no-scrollbar) */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-3 sm:p-3.5 space-y-3">
          {/* Agent Intro Greeting Header */}
          <div
            className={`p-3 rounded-xl border text-center relative overflow-hidden select-none ${isDark
                ? "bg-white/[0.02] border-white/[0.06]"
                : "bg-slate-50 border-slate-200/60"
              }`}
          >
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="text-[8px] font-semibold uppercase tracking-[0.24em] animate-luxury-shimmer">
                MAYA AUTONOMOUS AGENT
              </span>
            </div>
            <h4
              className={`text-[12.5px] font-light tracking-[-0.02em] ${isDark ? "text-white" : "text-[#0B0F17]"
                }`}
            >
              Front Desk Copilot
            </h4>
            <p
              className={`text-[10px] leading-relaxed mt-0.5 ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                }`}
            >
              Ready to answer inquiries, review bookings & dispatch follow-ups.
            </p>
          </div>

          {/* Message Bubbles */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"
                }`}
            >
              {/* Sender Label & Timestamp */}
              <div className="flex items-center gap-1.5 mb-1 px-1 select-none">
                {msg.sender === "maya" ? (
                  <span className="inline-flex items-center gap-1 text-[9.5px] font-medium text-emerald-400">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>MAYA</span>
                  </span>
                ) : (
                  <span
                    className={`text-[9.5px] font-medium ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                      }`}
                  >
                    You
                  </span>
                )}
                <span
                  className={`text-[9px] ${isDark ? "text-[#556070]" : "text-slate-400"
                    }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {/* Bubble Content */}
              <div
                className={`max-w-[92%] px-3.5 py-2.5 rounded-2xl text-[11.5px] leading-relaxed break-words overflow-hidden ${msg.sender === "user"
                    ? isDark
                      ? "bg-white text-[#0B0F17] font-normal shadow-sm rounded-br-xs"
                      : "bg-[#0B0F17] text-white font-normal shadow-sm rounded-br-xs"
                    : isDark
                      ? "bg-white/[0.05] border border-white/[0.08] text-neutral-200 rounded-bl-xs"
                      : "bg-slate-100/90 border border-slate-200/80 text-slate-800 rounded-bl-xs"
                  }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Rich Action Card Attachment */}
                {msg.actionCard && (
                  <div
                    className={`mt-2 p-2.5 rounded-xl border flex flex-col gap-1 ${isDark
                        ? "bg-black/40 border-white/[0.08]"
                        : "bg-white border-slate-200"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10.5px] font-medium ${isDark ? "text-white" : "text-[#0B0F17]"
                          }`}
                      >
                        {msg.actionCard.title}
                      </span>
                      <span className="text-[8px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {msg.actionCard.badge}
                      </span>
                    </div>
                    <span
                      className={`text-[9.5px] leading-snug ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                        }`}
                    >
                      {msg.actionCard.details}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Thinking Simulation Bubble */}
          {isThinking && (
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1.5 mb-1 px-1 select-none">
                <span className="inline-flex items-center gap-1 text-[9.5px] font-medium text-emerald-400">
                  <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                  <span>MAYA is synthesizing...</span>
                </span>
              </div>
              <div
                className={`px-3.5 py-2 rounded-2xl rounded-bl-xs text-[11px] flex items-center gap-1.5 ${isDark
                    ? "bg-white/[0.05] border border-white/[0.08] text-neutral-400"
                    : "bg-slate-100 border border-slate-200 text-slate-500"
                  }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Message Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className={`p-2.5 border-t shrink-0 flex items-center gap-1.5 w-full min-w-0 ${isDark ? "border-white/[0.08] bg-black/25" : "border-slate-200/90 bg-white"
            }`}
        >
          <div
            className={`flex-1 min-w-0 flex items-center gap-2 h-9 px-3 rounded-xl border transition-all duration-200 ${isDark
                ? "bg-[#0b0f17] border-white/[0.08] focus-within:border-white/25 focus-within:bg-[#0e131d]"
                : "bg-slate-50 border-slate-200 focus-within:border-slate-400 focus-within:bg-white"
              }`}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask MAYA anything..."
              className={`w-full min-w-0 bg-transparent text-[11.5px] outline-none font-normal ${isDark ? "text-white placeholder:text-[#556070]" : "text-slate-900 placeholder:text-slate-400"
                }`}
            />

            <button
              type="button"
              title="Add attachment"
              className={`shrink-0 p-1 transition-colors cursor-pointer ${isDark ? "text-[#556070] hover:text-white" : "text-slate-400 hover:text-slate-800"
                }`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150 cursor-pointer ${inputText.trim() && !isThinking
                ? isDark
                  ? "bg-white text-black hover:bg-neutral-100 active:scale-95 shadow-xs"
                  : "bg-[#0B0F17] text-white hover:bg-neutral-800 active:scale-95 shadow-xs"
                : isDark
                  ? "bg-white/[0.06] text-[#556070] cursor-not-allowed"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
          >
            <ArrowUp className="w-4 h-4 stroke-[2.2]" />
          </button>
        </form>
      </div>
    </aside>
  );
}
