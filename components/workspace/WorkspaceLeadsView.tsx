"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Phone,
  PhoneIncoming,
  Headphones,
  CheckCircle,
  Search,
  Plus,
  X,
  Calendar,
  Mail,
  MessageSquare,
  Sparkles,
  Copy,
  ChevronRight,
  Check,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import {
  LeadItem,
  LeadStatus,
  LeadPriority,
  LEAD_STATUS_CONFIG,
  getStatusBadgeStyle,
  getStatusDotColor,
} from "./types";

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

const LEADS_METRICS_DATA: MetricCardProps[] = [
  {
    id: "total-leads",
    label: "TOTAL LEADS",
    value: 248,
    changePct: 18,
    isPositive: true,
    timeframe: "vs last month",
    icon: Users,
    strokeColorDark: "#38bdf8",
    strokeColorLight: "#0284c7",
    sparklineD: "M 0 24 C 25 26, 45 18, 70 16 C 95 14, 105 8, 120 5",
  },
  {
    id: "new-leads",
    label: "NEW PROSPECTS",
    value: 48,
    changePct: 32,
    isPositive: true,
    timeframe: "this week",
    icon: PhoneIncoming,
    strokeColorDark: "#fbbf24",
    strokeColorLight: "#d97706",
    sparklineD: "M 0 26 C 25 27, 45 18, 65 13 C 85 8, 105 6, 120 4",
  },
  {
    id: "interested",
    label: "HIGH INTENT",
    value: 76,
    changePct: 12,
    isPositive: true,
    timeframe: "qualified",
    icon: Headphones,
    strokeColorDark: "#c084fc",
    strokeColorLight: "#7c3aed",
    sparklineD: "M 0 23 C 25 25, 45 16, 70 17 C 95 18, 105 10, 120 6",
  },
  {
    id: "enrolled",
    label: "CONVERTED",
    value: 34,
    changePct: 21,
    isPositive: true,
    timeframe: "enrolled",
    icon: CheckCircle,
    strokeColorDark: "#34d399",
    strokeColorLight: "#059669",
    sparklineD: "M 0 25 C 20 22, 40 18, 65 12 C 90 9, 105 5, 120 3",
  },
];

const INITIAL_LEADS: LeadItem[] = [
  {
    id: "lead-1",
    initials: "RS",
    name: "Rahul Sharma",
    source: "Website",
    timeAgo: "2m ago",
    status: "NEW",
    phone: "+91 98765 43210",
    email: "rahul.sharma@example.com",
    course: "Data Science & AI",
    priority: "High",
    assignedTo: { name: "Amit Kumar", avatarInitials: "AK" },
    lastContact: "2 min ago",
    nextFollowUp: "Today, 5:00 PM",
    notes: "Interested in executive weekend batch. Looking for placement guidance and financial support options.",
  },
  {
    id: "lead-2",
    initials: "PM",
    name: "Priya Mehta",
    source: "WhatsApp",
    timeAgo: "15m ago",
    status: "CONTACTED",
    phone: "+91 98765 12345",
    email: "priya.mehta@example.com",
    course: "UI/UX Architecture",
    priority: "Medium",
    assignedTo: { name: "Neha Sharma", avatarInitials: "NS" },
    lastContact: "15 min ago",
    nextFollowUp: "Tomorrow, 11:00 AM",
    notes: "Requested complete design curriculum and alumni portfolio showcase. Reviewing brochure with team.",
  },
  {
    id: "lead-3",
    initials: "AP",
    name: "Arjun Patel",
    source: "Phone",
    timeAgo: "32m ago",
    status: "INTERESTED",
    phone: "+91 91234 56789",
    email: "arjun.patel@example.com",
    course: "Full Stack Engineering",
    priority: "High",
    assignedTo: { name: "Rohan Varma", avatarInitials: "RV" },
    lastContact: "32 min ago",
    nextFollowUp: "Tomorrow, 2:00 PM",
    notes: "Working professional transitioning from legacy software. Evening batches preferred.",
  },
  {
    id: "lead-4",
    initials: "SI",
    name: "Sneha Iyer",
    source: "Walk-in",
    timeAgo: "1h ago",
    status: "COUNSELLING",
    phone: "+91 99887 66554",
    email: "sneha.iyer@example.com",
    course: "Data Analytics",
    priority: "Medium",
    assignedTo: { name: "Neha Sharma", avatarInitials: "NS" },
    lastContact: "1 hour ago",
    nextFollowUp: "25 Sep, 11:00 AM",
    notes: "Attended on-campus counselling. Deeply interested in capstone enterprise projects.",
  },
  {
    id: "lead-5",
    initials: "KV",
    name: "Karan Verma",
    source: "Website",
    timeAgo: "2h ago",
    status: "VISITED",
    phone: "+91 88776 55443",
    email: "karan.verma@example.com",
    course: "Cloud Architecture",
    priority: "Low",
    assignedTo: { name: "Amit Kumar", avatarInitials: "AK" },
    lastContact: "2 hours ago",
    nextFollowUp: "26 Sep, 3:00 PM",
    notes: "Wants AWS Solutions Architect track and DevOps CI/CD integration.",
  },
  {
    id: "lead-6",
    initials: "RS",
    name: "Riya Singh",
    source: "Instagram",
    timeAgo: "3h ago",
    status: "ENROLLED",
    phone: "+91 77665 44332",
    email: "riya.singh@example.com",
    course: "Growth & Product Marketing",
    priority: "High",
    assignedTo: { name: "Ishita Roy", avatarInitials: "IR" },
    lastContact: "3 hours ago",
    nextFollowUp: "Orientation on 1st Oct",
    notes: "Converted & enrolled in executive batch. Welcome kit and LMS credentials active.",
  },
  {
    id: "lead-7",
    initials: "AN",
    name: "Aditya Nair",
    source: "Phone",
    timeAgo: "5h ago",
    status: "LOST",
    phone: "+91 88774 22110",
    email: "aditya.nair@example.com",
    course: "Python Backend",
    priority: "Low",
    assignedTo: { name: "Rohan Varma", avatarInitials: "RV" },
    lastContact: "5 hours ago",
    nextFollowUp: "Next Quarter",
    notes: "College exams clash. Requested follow-up call at the start of next quarter.",
  },
  {
    id: "lead-8",
    initials: "MJ",
    name: "Meera Joshi",
    source: "Website",
    timeAgo: "1d ago",
    status: "NEW",
    phone: "+91 99881 22334",
    email: "meera.joshi@example.com",
    course: "AI Product Management",
    priority: "Medium",
    assignedTo: { name: "Neha Sharma", avatarInitials: "NS" },
    lastContact: "1 day ago",
    nextFollowUp: "26 Sep, 11:00 AM",
    notes: "Product manager looking for AI transformation and LLM orchestration mastery.",
  },
];

const STATUS_FILTERS: { id: "ALL" | LeadStatus; label: string }[] = [
  { id: "ALL", label: "All Leads" },
  { id: "NEW", label: "New" },
  { id: "CONTACTED", label: "Contacted" },
  { id: "INTERESTED", label: "Interested" },
  { id: "COUNSELLING", label: "Counselling" },
  { id: "VISITED", label: "Visited" },
  { id: "ENROLLED", label: "Enrolled" },
  { id: "LOST", label: "Lost" },
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

export default function WorkspaceLeadsView() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // State Management
  const [leads, setLeads] = useState<LeadItem[]>(INITIAL_LEADS);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Lead Form State
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadCourse, setNewLeadCourse] = useState("Data Science & AI");
  const [newLeadPriority, setNewLeadPriority] = useState<LeadPriority>("High");

  // Selected Lead Details
  const activeLead = useMemo(() => {
    return leads.find((l) => l.id === selectedLeadId) || null;
  }, [leads, selectedLeadId]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        item.name.toLowerCase().includes(q) ||
        (item.phone && item.phone.includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.course && item.course.toLowerCase().includes(q));

      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchQuery, statusFilter]);

  // Status Change Handler
  const handleUpdateStatus = (id: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );
    showToast(`Lead updated to ${newStatus}`);
  };

  // Add Lead Handler
  const handleAddLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim()) return;

    const initials = newLeadName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const createdLead: LeadItem = {
      id: `lead-${Date.now()}`,
      initials: initials || "NL",
      name: newLeadName.trim(),
      phone: newLeadPhone.trim() || "+91 98000 12345",
      email: newLeadEmail.trim() || `${newLeadName.toLowerCase().replace(/\s+/g, "")}@example.com`,
      course: newLeadCourse,
      source: "Website",
      status: "NEW",
      priority: newLeadPriority,
      timeAgo: "Just now",
      lastContact: "Just now",
      nextFollowUp: "Today, 6:00 PM",
      assignedTo: { name: "Amit Kumar", avatarInitials: "AK" },
      notes: "Inbound prospect created directly. Auto-scheduled for first call briefing.",
    };

    setLeads([createdLead, ...leads]);
    setSelectedLeadId(createdLead.id);
    setIsAddLeadModalOpen(false);
    showToast(`Lead "${newLeadName}" added successfully`);

    // Reset Form
    setNewLeadName("");
    setNewLeadPhone("");
    setNewLeadEmail("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 min-w-0 h-full flex flex-col justify-between gap-3.5 overflow-hidden min-h-0 select-none"
    >
      {/* 1. Header: Minimal Title + Fast Action */}
      <div className="flex items-center justify-between gap-4 select-none shrink-0">
        <div>
          <h1
            className={`text-[23px] sm:text-[25px] font-light tracking-[-0.03em] leading-tight ${
              isDark ? "text-white" : "text-[#0B0F17]"
            }`}
          >
            Leads & Pipeline
          </h1>
          <p
            className={`text-[12.5px] sm:text-[13px] font-normal leading-normal mt-0.5 ${
              isDark ? "text-[#9ca3af]" : "text-[#64748B]"
            }`}
          >
            High-intent opportunities managed and qualified by MAYA Copilot.
          </p>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            type="button"
            onClick={() => setIsAddLeadModalOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={`inline-flex items-center gap-1.5 h-8.5 px-4 rounded-full text-[12.5px] font-medium transition-all duration-200 cursor-pointer shadow-sm ${
              isDark
                ? "bg-white text-[#0B0F17] hover:bg-neutral-100"
                : "bg-[#0B0F17] text-white hover:bg-[#1E293B]"
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>New Lead</span>
          </motion.button>
        </div>
      </div>

      {/* 2. Sleek KPI Metrics Strip (Dashboard Premium Velvet Texture) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 shrink-0 select-none">
        {LEADS_METRICS_DATA.map((card, idx) => {
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
              className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-default select-none ${
                isDark
                  ? "bg-gradient-to-b from-[#111724]/95 via-[#0c101a]/95 to-[#080b12]/98 border-white/[0.09] hover:border-white/[0.2] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_24px_-6px_rgba(0,0,0,0.55)]"
                  : "bg-gradient-to-b from-white via-white to-[#F8FAFC] border-slate-200/90 hover:border-slate-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_4px_16px_rgba(15,23,42,0.05)]"
              }`}
            >
              {/* Top Row: Architectural Eyebrow + Delicate Linear Icon */}
              <div className="flex items-center justify-between gap-2 relative z-10">
                <span
                  className={`text-[9px] sm:text-[9.5px] font-medium uppercase tracking-[0.16em] truncate transition-colors duration-200 ${
                    isDark
                      ? "text-[#8e95a5] group-hover:text-white"
                      : "text-slate-500 group-hover:text-slate-900"
                  }`}
                >
                  {card.label}
                </span>

                <Icon
                  className={`w-3.5 h-3.5 shrink-0 stroke-[1.4] transition-colors duration-200 ${
                    isDark
                      ? "text-[#717682] group-hover:text-white"
                      : "text-slate-400 group-hover:text-slate-700"
                  }`}
                />
              </div>

              {/* Middle Row: Large Numeral + Whisper Vector Spline */}
              <div className="my-2 sm:my-2.5 flex items-baseline justify-between gap-2 relative z-10">
                <span
                  className={`text-[28px] sm:text-[32px] font-light tracking-[-0.03em] leading-none tabular-nums shrink-0 ${
                    isDark ? "text-white" : "text-[#0B0F17]"
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
                      <linearGradient id={`leads-kpi-spark-${card.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={strokeColor} stopOpacity={isDark ? "0.18" : "0.12"} />
                        <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Gentle Shaded Area */}
                    <motion.path
                      d={`${card.sparklineD} L 120 32 L 0 32 Z`}
                      fill={`url(#leads-kpi-spark-${card.id})`}
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
                  className={`font-medium shrink-0 ${
                    card.isPositive
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
                  className={`truncate ${
                    isDark ? "text-[#717682]" : "text-slate-500"
                  }`}
                >
                  {card.timeframe}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. Main Stage: Clean Breathing Leads View */}
      <div className="flex-1 min-h-0 flex gap-3.5 overflow-hidden relative">
        {/* Main Leads Table Surface */}
        <div
          className={`flex-1 min-w-0 h-full rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
            isDark
              ? "bg-gradient-to-b from-[#111724]/95 via-[#0c101a]/95 to-[#080b12]/98 border-white/[0.09] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_30px_rgba(0,0,0,0.55)]"
              : "bg-gradient-to-b from-white via-white to-[#F8FAFC] border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_4px_20px_rgba(15,23,42,0.06)]"
          }`}
        >
          {/* Executive Minimalist Toolbar: Search + Quick Category Pills */}
          <div
            className={`p-3 px-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
              isDark ? "border-white/[0.06]" : "border-slate-100"
            }`}
          >
            {/* Search Pill */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <div
                className={`flex items-center h-8.5 px-3 rounded-full border transition-all ${
                  isDark
                    ? "bg-[#0c101a] border-white/[0.08] focus-within:border-white/25 focus-within:bg-[#0e121d]"
                    : "bg-slate-50 border-slate-200 focus-within:border-[#0B0F17] focus-within:bg-white"
                }`}
              >
                <Search className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-neutral-400" : "text-slate-400"}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, contact, course..."
                  className={`w-full ml-2 text-[12px] bg-transparent outline-none font-normal ${
                    isDark ? "text-white placeholder:text-[#556070]" : "text-[#0F172A] placeholder:text-[#94A3B8]"
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-neutral-400 hover:text-white cursor-pointer ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Segmented Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {STATUS_FILTERS.map((tab) => {
                const isActive = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`relative px-3 py-1 rounded-full text-[11.5px] font-medium transition-colors cursor-pointer outline-none ${
                      isActive
                        ? isDark
                          ? "text-black font-semibold"
                          : "text-white font-semibold"
                        : isDark
                        ? "text-[#8e95a5] hover:text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-lead-filter-pill"
                        className={`absolute inset-0 rounded-full ${
                          isDark ? "bg-white" : "bg-[#0B0F17]"
                        }`}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clean, High-Signal Table */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr
                  className={`border-b text-[9px] uppercase tracking-[0.18em] font-medium sticky top-0 z-10 backdrop-blur-md select-none ${
                    isDark
                      ? "bg-[#090C12]/95 border-white/[0.06] text-[#717682]"
                      : "bg-white/95 border-slate-100 text-[#94A3B8]"
                  }`}
                >
                  <th className="py-2.5 px-4 font-medium">Lead Profile</th>
                  <th className="py-2.5 px-3 font-medium">Interest</th>
                  <th className="py-2.5 px-3 font-medium">Status</th>
                  <th className="py-2.5 px-3 font-medium">Next Follow-Up</th>
                  <th className="py-2.5 px-4 text-right font-medium">Quick Connect</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-white/[0.035]" : "divide-slate-100"}`}>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[12px] text-neutral-400">
                      No matching leads found.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const isSelected = selectedLeadId === lead.id;

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className={`group transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? isDark
                              ? "bg-white/[0.05]"
                              : "bg-slate-50"
                            : isDark
                            ? "hover:bg-white/[0.025]"
                            : "hover:bg-slate-50/70"
                        }`}
                      >
                        {/* 1. Lead Profile */}
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0 border ${
                                isDark
                                  ? "bg-white/[0.05] text-white border-white/[0.08]"
                                  : "bg-slate-100 text-slate-800 border-slate-200"
                              }`}
                            >
                              {lead.initials}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span
                                className={`text-[12.5px] font-medium truncate ${
                                  isDark ? "text-white" : "text-[#0F172A]"
                                }`}
                              >
                                {lead.name}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5 text-[10.5px]">
                                <span className={isDark ? "text-[#8e95a5]" : "text-slate-500"}>
                                  {lead.phone}
                                </span>
                                <span className="opacity-30">•</span>
                                <span className={isDark ? "text-[#717682]" : "text-slate-400"}>
                                  {lead.source}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Interest / Course */}
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[12px] font-normal truncate block max-w-[200px] ${
                              isDark ? "text-neutral-200" : "text-slate-800"
                            }`}
                          >
                            {lead.course}
                          </span>
                        </td>

                        {/* 3. Status Badge */}
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-medium tracking-wide border uppercase select-none transition-colors duration-150 ${getStatusBadgeStyle(
                              lead.status,
                              isDark
                            )}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusDotColor(
                                lead.status,
                                isDark
                              )}`}
                            />
                            <span>{lead.status}</span>
                          </span>
                        </td>

                        {/* 4. Follow-Up */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Calendar className="w-3 h-3 text-neutral-400 shrink-0" />
                            <span className={isDark ? "text-neutral-300" : "text-slate-700"}>
                              {lead.nextFollowUp}
                            </span>
                          </div>
                        </td>

                        {/* 5. Quick Connect Actions */}
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.94 }}
                              onClick={() => showToast(`Calling ${lead.name} (${lead.phone})...`)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isDark
                                  ? "text-neutral-300 hover:text-white hover:bg-white/[0.08]"
                                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                              }`}
                              title="Call Lead"
                            >
                              <Phone className="w-3.5 h-3.5 text-sky-400" />
                            </motion.button>

                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.94 }}
                              onClick={() => showToast(`Opening WhatsApp chat with ${lead.name}...`)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isDark
                                  ? "text-neutral-300 hover:text-white hover:bg-white/[0.08]"
                                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                              }`}
                              title="WhatsApp Chat"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                            </motion.button>

                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.94 }}
                              onClick={() => setSelectedLeadId(lead.id)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ml-1 ${
                                isDark
                                  ? "text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                                  : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                              }`}
                              title="View Details"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div
            className={`p-2.5 px-4 border-t flex items-center justify-between text-[11px] shrink-0 select-none ${
              isDark ? "border-white/[0.06] text-[#8e95a5]" : "border-slate-100 text-slate-500"
            }`}
          >
            <span>Showing {filteredLeads.length} leads</span>
            <span className="text-[10.5px]">Click any lead to view full summary</span>
          </div>
        </div>

        {/* 4. Elegant Slide-Over Lead Details Panel (Opens smoothly when requested) */}
        <AnimatePresence>
          {activeLead && (
            <motion.div
              initial={{ x: 380, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 380, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className={`w-[360px] shrink-0 h-full rounded-2xl border flex flex-col justify-between overflow-hidden z-20 ${
                isDark
                  ? "bg-gradient-to-b from-[#111724]/98 via-[#0c101a]/98 to-[#080b12]/99 border-white/[0.1] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),0_12px_40px_rgba(0,0,0,0.7)]"
                  : "bg-gradient-to-b from-white via-white to-[#F8FAFC] border-slate-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_8px_32px_rgba(15,23,42,0.1)]"
              }`}
            >
              {/* Header */}
              <div
                className={`p-4 border-b flex items-center justify-between shrink-0 select-none ${
                  isDark ? "border-white/[0.06]" : "border-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-medium border shrink-0 ${
                      isDark
                        ? "bg-white/[0.08] text-white border-white/[0.1]"
                        : "bg-slate-100 text-slate-800 border-slate-200"
                    }`}
                  >
                    {activeLead.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-[13.5px] font-medium leading-tight truncate ${isDark ? "text-white" : "text-[#0B0F17]"}`}>
                        {activeLead.name}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-medium tracking-wide border uppercase select-none transition-colors duration-150 ${getStatusBadgeStyle(
                          activeLead.status,
                          isDark
                        )}`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full shrink-0 ${getStatusDotColor(
                            activeLead.status,
                            isDark
                          )}`}
                        />
                        <span>{activeLead.status}</span>
                      </span>
                    </div>
                    <span className={`text-[10.5px] block mt-0.5 ${isDark ? "text-[#8e95a5]" : "text-slate-500"}`}>
                      {activeLead.source} • {activeLead.timeAgo}
                    </span>
                  </div>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setSelectedLeadId(null)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isDark ? "text-neutral-400 hover:text-white" : "text-slate-400 hover:text-slate-800"
                  }`}
                  title="Close inspector"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-4 text-[12px]">
                {/* Fast Action Connect Row */}
                <div className="grid grid-cols-2 gap-2 shrink-0">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => showToast(`Initiating call with ${activeLead.name}...`)}
                    className={`py-2 px-3 rounded-xl font-medium text-[11.5px] flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      isDark
                        ? "bg-white/[0.06] border-white/10 text-white hover:bg-white/10"
                        : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-2xs"
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5 text-sky-400" />
                    <span>Call Now</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => showToast(`Opening WhatsApp chat with ${activeLead.phone}...`)}
                    className={`py-2 px-3 rounded-xl font-medium text-[11.5px] flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      isDark
                        ? "bg-white/[0.06] border-white/10 text-white hover:bg-white/10"
                        : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-2xs"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </motion.button>
                </div>

                {/* AI Briefing Card from MAYA */}
                <div
                  className={`p-3.5 rounded-xl border relative overflow-hidden ${
                    isDark
                      ? "bg-gradient-to-br from-[#121826]/90 to-[#0B0F17]/90 border-white/[0.08]"
                      : "bg-gradient-to-br from-slate-50 to-white border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-sky-400">
                      MAYA Copilot Insights
                    </span>
                  </div>
                  <p className={`text-[11.5px] leading-relaxed ${isDark ? "text-neutral-300" : "text-slate-700"}`}>
                    {activeLead.notes}
                  </p>
                </div>

                {/* Quick Status Selector */}
                <div>
                  <span className={`text-[9.5px] font-medium uppercase tracking-[0.16em] block mb-2 select-none ${
                    isDark ? "text-[#717682]" : "text-[#94A3B8]"
                  }`}>
                    Update Stage
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                    {(["NEW", "CONTACTED", "INTERESTED", "COUNSELLING", "VISITED", "ENROLLED", "LOST"] as LeadStatus[]).map((st) => {
                      const isCurrent = activeLead.status === st;
                      const conf = LEAD_STATUS_CONFIG[st];
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleUpdateStatus(activeLead.id, st)}
                          className={`py-1.5 px-2 rounded-lg text-[9.5px] font-medium border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            isCurrent
                              ? isDark
                                ? conf.activeBtnDark
                                : conf.activeBtnLight
                              : isDark
                              ? "bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.05]"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isCurrent
                                ? getStatusDotColor(st, isDark)
                                : isDark
                                ? "bg-white/20"
                                : "bg-slate-300"
                            }`}
                          />
                          <span>{st}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Contact Card with 1-click Copy */}
                <div className={`pt-3 border-t ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
                  <span className={`text-[9.5px] font-medium uppercase tracking-[0.16em] block mb-2 select-none ${
                    isDark ? "text-[#717682]" : "text-[#94A3B8]"
                  }`}>
                    Contact & Lead Info
                  </span>

                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-neutral-400" />
                        <span className={isDark ? "text-white" : "text-slate-800"}>{activeLead.phone}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (activeLead.phone) navigator.clipboard.writeText(activeLead.phone);
                          showToast("Phone number copied");
                        }}
                        className="text-neutral-400 hover:text-white cursor-pointer"
                        title="Copy phone"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-neutral-400" />
                        <span className={isDark ? "text-white" : "text-slate-800"}>{activeLead.email}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (activeLead.email) navigator.clipboard.writeText(activeLead.email);
                          showToast("Email address copied");
                        }}
                        className="text-neutral-400 hover:text-white cursor-pointer"
                        title="Copy email"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className={isDark ? "text-[#8e95a5]" : "text-slate-500"}>Course Program</span>
                      <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{activeLead.course}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className={isDark ? "text-[#8e95a5]" : "text-slate-500"}>Assigned Officer</span>
                      <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{activeLead.assignedTo?.name}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className={isDark ? "text-[#8e95a5]" : "text-slate-500"}>Next Follow-up</span>
                      <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{activeLead.nextFollowUp}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Drawer CTA */}
              <div
                className={`p-3 border-t shrink-0 ${
                  isDark ? "border-white/[0.06]" : "border-slate-100"
                }`}
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    showToast(`Follow-up confirmed for ${activeLead.name}`);
                    setSelectedLeadId(null);
                  }}
                  className={`w-full py-2 px-4 rounded-xl text-[12px] font-medium transition-all cursor-pointer shadow-sm ${
                    isDark
                      ? "bg-white text-black hover:bg-neutral-100"
                      : "bg-[#0B0F17] text-white hover:bg-slate-800"
                  }`}
                >
                  Confirm Next Action
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. Minimalist "Add Lead" Modal */}
      <AnimatePresence>
        {isAddLeadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddLeadModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`relative w-full max-w-md rounded-2xl border p-6 z-10 shadow-2xl ${
                isDark
                  ? "bg-gradient-to-b from-[#111724]/98 via-[#0c101a]/98 to-[#080b12]/99 border-white/[0.1] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),0_20px_50px_rgba(0,0,0,0.8)]"
                  : "bg-gradient-to-b from-white via-white to-[#F8FAFC] border-slate-200 text-[#0F172A] shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_12px_40px_rgba(15,23,42,0.12)]"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[17px] font-medium">Add New Lead</h3>
                <button
                  type="button"
                  onClick={() => setIsAddLeadModalOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddLeadSubmit} className="flex flex-col gap-3.5">
                <div>
                  <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                    Lead Full Name
                  </label>
                  <input
                    type="text"
                    value={newLeadName}
                    onChange={(e) => setNewLeadName(e.target.value)}
                    placeholder="e.g. Aryan Malhotra"
                    autoFocus
                    className={`w-full h-10 px-3.5 rounded-xl border text-[12.5px] outline-none transition-all ${
                      isDark
                        ? "bg-[#0c101a] border-white/10 text-white focus:border-white/30"
                        : "bg-slate-50 border-slate-200 text-slate-800 focus:border-slate-800"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={newLeadPhone}
                      onChange={(e) => setNewLeadPhone(e.target.value)}
                      placeholder="+91 98765 00000"
                      className={`w-full h-10 px-3.5 rounded-xl border text-[12.5px] outline-none transition-all ${
                        isDark
                          ? "bg-[#0c101a] border-white/10 text-white focus:border-white/30"
                          : "bg-slate-50 border-slate-200 text-slate-800 focus:border-slate-800"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={newLeadEmail}
                      onChange={(e) => setNewLeadEmail(e.target.value)}
                      placeholder="prospect@domain.com"
                      className={`w-full h-10 px-3.5 rounded-xl border text-[12.5px] outline-none transition-all ${
                        isDark
                          ? "bg-[#0c101a] border-white/10 text-white focus:border-white/30"
                          : "bg-slate-50 border-slate-200 text-slate-800 focus:border-slate-800"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                    Interested Course / Program
                  </label>
                  <input
                    type="text"
                    value={newLeadCourse}
                    onChange={(e) => setNewLeadCourse(e.target.value)}
                    className={`w-full h-10 px-3.5 rounded-xl border text-[12.5px] outline-none transition-all ${
                      isDark
                        ? "bg-[#0c101a] border-white/10 text-white focus:border-white/30"
                        : "bg-slate-50 border-slate-200 text-slate-800 focus:border-slate-800"
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-neutral-400 block mb-1.5">
                    Priority Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["High", "Medium", "Low"] as LeadPriority[]).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setNewLeadPriority(lvl)}
                        className={`py-2 rounded-xl text-[11.5px] font-medium border text-center transition-all cursor-pointer ${
                          newLeadPriority === lvl
                            ? isDark
                              ? "bg-white text-black border-white"
                              : "bg-[#0B0F17] text-white border-[#0B0F17]"
                            : isDark
                            ? "bg-white/[0.03] border-white/10 text-neutral-400 hover:text-white"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-inherit">
                  <button
                    type="button"
                    onClick={() => setIsAddLeadModalOpen(false)}
                    className="px-4 py-2 rounded-full text-[12px] font-medium text-neutral-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[12px] font-medium transition-all duration-200 cursor-pointer shadow-sm ${
                      isDark
                        ? "bg-white text-black hover:bg-neutral-100"
                        : "bg-[#0B0F17] text-white hover:bg-slate-800"
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Create Lead</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Micro Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className={`fixed bottom-5 right-5 z-50 px-4 py-2 rounded-xl border text-[12px] font-medium shadow-2xl backdrop-blur-md flex items-center gap-2 ${
              isDark
                ? "bg-[#0c101a]/95 border-white/15 text-white"
                : "bg-white/95 border-slate-200 text-[#0F172A]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
