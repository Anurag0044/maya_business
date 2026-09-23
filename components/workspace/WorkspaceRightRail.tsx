"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Zap,
  ArrowUp,
  Sparkles,
  RotateCcw,
  Paperclip,
  CheckCircle2,
  Clock,
  Calendar,
  Users,
  PhoneCall,
  ChevronRight,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import MayaWordmark from "@/components/MayaWordmark";

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

const SUGGESTED_PROMPTS = [
  "Summarize today's calls",
  "Check tomorrow's slots",
  "Draft follow-up to Priya",
  "Front desk conversion rate",
];

interface LiveActionItem {
  id: string;
  time: string;
  name: string;
  action: string;
  channel: string;
  status: "Completed" | "Synced" | "Queued";
}

const LIVE_ACTIONS: LiveActionItem[] = [
  {
    id: "act-1",
    time: "10:30 AM",
    name: "Rahul Sharma",
    action: "Counselling appointment confirmed & calendar invite dispatched",
    channel: "WhatsApp",
    status: "Completed",
  },
  {
    id: "act-2",
    time: "11:00 AM",
    name: "Priya Mehta",
    action: "Course syllabus delivered; priority follow-up booked",
    channel: "Call",
    status: "Completed",
  },
  {
    id: "act-3",
    time: "12:30 PM",
    name: "Arjun Patel",
    action: "Admission query answered with tuition schedule",
    channel: "Web Chat",
    status: "Completed",
  },
  {
    id: "act-4",
    time: "01:15 PM",
    name: "Sneha Iyer",
    action: "Requested callback time slot synced to CRM",
    channel: "Call",
    status: "Synced",
  },
  {
    id: "act-5",
    time: "01:40 PM",
    name: "Karan Verma",
    action: "Sent personalized appointment confirmation SMS",
    channel: "SMS",
    status: "Completed",
  },
];

export default function WorkspaceRightRail({ onClose }: WorkspaceRightRailProps = {}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState<"chat" | "actions">("chat");
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
    <aside className="w-full max-w-[340px] h-full flex flex-col gap-2.5 select-none overflow-hidden">
      {/* 1. Above Side Toggle Bar: Clean Segmented Header */}
      <div
        className={`p-2 rounded-2xl border transition-all duration-300 flex items-center justify-between shrink-0 ${
          isDark
            ? "bg-gradient-to-b from-[#111724]/95 via-[#0c101a]/95 to-[#080b12]/98 border-white/[0.09] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_4px_16px_rgba(0,0,0,0.3)]"
            : "bg-white border-slate-200/90 shadow-2xs"
        }`}
      >
        {/* Left: Segmented Mode Switcher */}
        <div className="flex items-center p-0.5 rounded-xl bg-black/25 dark:bg-white/[0.04] border border-white/[0.06]">
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 cursor-pointer ${
              activeTab === "chat"
                ? isDark
                  ? "bg-white text-[#0B0F17] shadow-xs"
                  : "bg-[#0F172A] text-white shadow-xs"
                : isDark
                ? "text-[#8a929f] hover:text-white"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Agent Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("actions")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 cursor-pointer ${
              activeTab === "actions"
                ? isDark
                  ? "bg-white text-[#0B0F17] shadow-xs"
                  : "bg-[#0F172A] text-white shadow-xs"
                : isDark
                ? "text-[#8a929f] hover:text-white"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Actions</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" />
          </button>
        </div>

        {/* Right: Live Beacon, Reset Button & Close Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 pr-1">
          <div className="flex items-center gap-1.5 select-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[10px] font-medium text-emerald-400 tracking-tight">
              Live
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetChat}
            title="Reset conversation"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? "text-[#717682] hover:text-white hover:bg-white/[0.06]"
                : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Close Agent Chat Window"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? "text-[#717682] hover:text-white hover:bg-white/[0.06]"
                  : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Agent Window: Live Chat or Automated Actions */}
      <div
        className={`flex-1 min-h-0 rounded-2xl border flex flex-col justify-between overflow-hidden transition-all duration-300 ${
          isDark
            ? "bg-gradient-to-b from-[#111724]/95 via-[#0c101a]/95 to-[#080b12]/98 border-white/[0.09] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_24px_-6px_rgba(0,0,0,0.55)]"
            : "bg-gradient-to-b from-white via-white to-[#F8FAFC] border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_4px_16px_rgba(15,23,42,0.05)]"
        }`}
      >
        {activeTab === "chat" ? (
          <>
            {/* Messages Thread Container */}
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-3 sm:p-3.5 space-y-3">
              {/* Agent Intro Greeting Header */}
              <div
                className={`p-3 rounded-xl border text-center relative overflow-hidden select-none ${
                  isDark
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
                  className={`text-[12.5px] font-light tracking-[-0.02em] ${
                    isDark ? "text-white" : "text-[#0B0F17]"
                  }`}
                >
                  Front Desk Copilot
                </h4>
                <p
                  className={`text-[10px] leading-relaxed mt-0.5 ${
                    isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                  }`}
                >
                  Ready to answer inquiries, review bookings & dispatch follow-ups.
                </p>
              </div>

              {/* Message Bubbles */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
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
                        className={`text-[9.5px] font-medium ${
                          isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                        }`}
                      >
                        You
                      </span>
                    )}
                    <span
                      className={`text-[9px] ${
                        isDark ? "text-[#556070]" : "text-slate-400"
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Bubble Content */}
                  <div
                    className={`max-w-[92%] px-3.5 py-2.5 rounded-2xl text-[11.5px] leading-relaxed break-words overflow-hidden ${
                      msg.sender === "user"
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
                        className={`mt-2 p-2.5 rounded-xl border flex flex-col gap-1 ${
                          isDark
                            ? "bg-black/40 border-white/[0.08]"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10.5px] font-medium ${
                              isDark ? "text-white" : "text-[#0B0F17]"
                            }`}
                          >
                            {msg.actionCard.title}
                          </span>
                          <span className="text-[8px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {msg.actionCard.badge}
                          </span>
                        </div>
                        <span
                          className={`text-[9.5px] leading-snug ${
                            isDark ? "text-[#8e95a5]" : "text-[#64748B]"
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
                    className={`px-3.5 py-2 rounded-2xl rounded-bl-xs text-[11px] flex items-center gap-1.5 ${
                      isDark
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

            {/* Quick Prompt Suggestion Chips */}
            <div
              className={`px-3 py-1.5 border-t overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0 max-w-full ${
                isDark ? "border-white/[0.05]" : "border-slate-100"
              }`}
            >
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className={`text-[10px] font-normal px-2.5 py-1 rounded-full whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isDark
                      ? "bg-white/[0.04] text-[#8e95a5] hover:text-white hover:bg-white/[0.08] border border-white/[0.06]"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200/60"
                  }`}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Bottom Message Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className={`p-2.5 border-t shrink-0 flex items-center gap-1.5 w-full min-w-0 ${
                isDark ? "border-white/[0.08] bg-black/25" : "border-slate-200/90 bg-white"
              }`}
            >
              <div
                className={`flex-1 min-w-0 flex items-center gap-2 h-9 px-3 rounded-xl border transition-all duration-200 ${
                  isDark
                    ? "bg-[#0b0f17] border-white/[0.08] focus-within:border-white/25 focus-within:bg-[#0e131d]"
                    : "bg-slate-50 border-slate-200 focus-within:border-slate-400 focus-within:bg-white"
                }`}
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask MAYA anything..."
                  className={`w-full min-w-0 bg-transparent text-[11.5px] outline-none font-normal ${
                    isDark ? "text-white placeholder:text-[#556070]" : "text-slate-900 placeholder:text-slate-400"
                  }`}
                />

                <button
                  type="button"
                  title="Attach file"
                  className={`shrink-0 p-1 transition-colors cursor-pointer ${
                    isDark ? "text-[#556070] hover:text-white" : "text-slate-400 hover:text-slate-800"
                  }`}
                >
                  <Paperclip className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="submit"
                disabled={!inputText.trim() || isThinking}
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150 cursor-pointer ${
                  inputText.trim() && !isThinking
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
          </>
        ) : (
          /* Live Autonomous Actions Feed */
          <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
            {/* Header info */}
            <div
              className={`p-3.5 border-b shrink-0 flex items-center justify-between ${
                isDark ? "border-white/[0.08]" : "border-slate-200"
              }`}
            >
              <div>
                <h4
                  className={`text-[12px] font-medium ${
                    isDark ? "text-white" : "text-[#0B0F17]"
                  }`}
                >
                  Autonomous Front Desk Activity
                </h4>
                <p
                  className={`text-[10px] mt-0.5 ${
                    isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                  }`}
                >
                  Real-time actions handled by MAYA
                </p>
              </div>
              <span className="text-[8px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 uppercase tracking-wider select-none">
                100% SLA
              </span>
            </div>

            {/* Actions List */}
            <div
              className={`divide-y overflow-y-auto no-scrollbar flex-1 min-h-0 p-2 ${
                isDark ? "divide-white/[0.05]" : "divide-slate-100"
              }`}
            >
              {LIVE_ACTIONS.map((item) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl transition-colors ${
                    isDark ? "hover:bg-white/[0.03]" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[11px] font-medium truncate ${
                        isDark ? "text-white" : "text-[#0B0F17]"
                      }`}
                    >
                      {item.name}
                    </span>
                    <span
                      className={`text-[9.5px] font-mono ${
                        isDark ? "text-[#717682]" : "text-[#94A3B8]"
                      }`}
                    >
                      {item.time}
                    </span>
                  </div>

                  <p
                    className={`text-[10px] leading-relaxed mb-1.5 ${
                      isDark ? "text-[#9ca3af]" : "text-[#475569]"
                    }`}
                  >
                    {item.action}
                  </p>

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[8.5px] font-medium px-1.5 py-0.5 rounded select-none ${
                        isDark
                          ? "bg-white/[0.04] text-[#8e95a5]"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      via {item.channel}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[8.5px] font-medium text-emerald-400">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>{item.status}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions Summary Pill */}
            <div
              className={`p-3 border-t shrink-0 text-center select-none ${
                isDark ? "border-white/[0.08] bg-black/20" : "border-slate-200 bg-slate-50"
              }`}
            >
              <span
                className={`text-[10px] font-medium ${
                  isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                }`}
              >
                MAYA is handling inquiries 24/7 across Call, Web & WhatsApp.
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
