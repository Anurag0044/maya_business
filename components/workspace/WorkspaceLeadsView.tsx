"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Phone,
  PhoneIncoming,
  Headphones,
  CheckCircle,
  Search,
  Filter,
  Grid,
  List,
  Plus,
  X,
  MoreHorizontal,
  Calendar,
  Mail,
  MessageSquare,
  Clock,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Copy,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { LeadItem, LeadStatus, LeadPriority } from "./types";

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
    label: "NEW LEADS",
    value: 48,
    changePct: 32,
    isPositive: true,
    timeframe: "vs last month",
    icon: PhoneIncoming,
    strokeColorDark: "#fbbf24",
    strokeColorLight: "#d97706",
    sparklineD: "M 0 26 C 25 27, 45 18, 65 13 C 85 8, 105 6, 120 4",
  },
  {
    id: "interested",
    label: "INTERESTED",
    value: 76,
    changePct: 12,
    isPositive: true,
    timeframe: "vs last month",
    icon: Headphones,
    strokeColorDark: "#c084fc",
    strokeColorLight: "#7c3aed",
    sparklineD: "M 0 23 C 25 25, 45 16, 70 17 C 95 18, 105 10, 120 6",
  },
  {
    id: "enrolled",
    label: "ENROLLED",
    value: 34,
    changePct: 21,
    isPositive: true,
    timeframe: "vs last month",
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
    timeAgo: "2 min ago",
    status: "NEW",
    phone: "+91 98765 43210",
    email: "rahul@email.com",
    course: "Data Science",
    priority: "High",
    assignedTo: { name: "Amit Kumar", avatarInitials: "AK" },
    lastContact: "2 min ago",
    nextFollowUp: "Today, 5:00 PM",
    notes: "Interested in weekend batch. Wants to know about fees and placement support.",
  },
  {
    id: "lead-2",
    initials: "PM",
    name: "Priya Mehta",
    source: "WhatsApp",
    timeAgo: "15 min ago",
    status: "CONTACTED",
    phone: "+91 98765 12345",
    email: "priya@email.com",
    course: "UI/UX Design",
    priority: "Medium",
    assignedTo: { name: "Neha Sharma", avatarInitials: "NS" },
    lastContact: "15 min ago",
    nextFollowUp: "Tomorrow, 11:00 AM",
    notes: "Requested complete syllabus and portfolio requirements. Reviewing brochure.",
  },
  {
    id: "lead-3",
    initials: "AP",
    name: "Arjun Patel",
    source: "Phone",
    timeAgo: "32 min ago",
    status: "INTERESTED",
    phone: "+91 91234 56789",
    email: "arjun@email.com",
    course: "Full Stack Dev",
    priority: "High",
    assignedTo: { name: "Rohan Varma", avatarInitials: "RV" },
    lastContact: "32 min ago",
    nextFollowUp: "Tomorrow, 2:00 PM",
    notes: "Wants full-stack curriculum with React & Node. Working professional looking for evening classes.",
  },
  {
    id: "lead-4",
    initials: "SI",
    name: "Sneha Iyer",
    source: "Walk-in",
    timeAgo: "1 hour ago",
    status: "COUNSELLING",
    phone: "+91 99887 66554",
    email: "sneha@email.com",
    course: "Data Analytics",
    priority: "Medium",
    assignedTo: { name: "Neha Sharma", avatarInitials: "NS" },
    lastContact: "1 hour ago",
    nextFollowUp: "25 Sep, 11:00 AM",
    notes: "Attended on-campus counselling session with parents. Very interested in job assurance.",
  },
  {
    id: "lead-5",
    initials: "KV",
    name: "Karan Verma",
    source: "Website",
    timeAgo: "2 hours ago",
    status: "VISITED",
    phone: "+91 88776 55443",
    email: "karan@email.com",
    course: "Cloud Computing",
    priority: "Low",
    assignedTo: { name: "Amit Kumar", avatarInitials: "AK" },
    lastContact: "2 hours ago",
    nextFollowUp: "26 Sep, 3:00 PM",
    notes: "Looking for AWS Certified Solutions Architect and Azure DevOps integration.",
  },
  {
    id: "lead-6",
    initials: "RS",
    name: "Riya Singh",
    source: "Instagram",
    timeAgo: "3 hours ago",
    status: "INTERESTED",
    phone: "+91 77665 44332",
    email: "riya@email.com",
    course: "Digital Marketing",
    priority: "High",
    assignedTo: { name: "Ishita Roy", avatarInitials: "IR" },
    lastContact: "3 hours ago",
    nextFollowUp: "Today, 4:00 PM",
    notes: "Enquired via Instagram campaign. Needs live performance marketing projects.",
  },
  {
    id: "lead-7",
    initials: "AN",
    name: "Aditya Nair",
    source: "Phone",
    timeAgo: "5 hours ago",
    status: "LOST",
    phone: "+91 88774 22110",
    email: "aditya@email.com",
    course: "Python",
    priority: "Low",
    assignedTo: { name: "Rohan Varma", avatarInitials: "RV" },
    lastContact: "5 hours ago",
    nextFollowUp: "—",
    notes: "Currently overwhelmed with college exams. Asked to reconnect next quarter.",
  },
  {
    id: "lead-8",
    initials: "MJ",
    name: "Meera Joshi",
    source: "Website",
    timeAgo: "1 day ago",
    status: "NEW",
    phone: "+91 99881 22334",
    email: "meera@email.com",
    course: "Product Management",
    priority: "Medium",
    assignedTo: { name: "Neha Sharma", avatarInitials: "NS" },
    lastContact: "1 day ago",
    nextFollowUp: "26 Sep, 11:00 AM",
    notes: "Product manager with 2 years experience looking for strategic leadership roadmap.",
  },
  {
    id: "lead-9",
    initials: "VR",
    name: "Vikram Rao",
    source: "Referral",
    timeAgo: "1 day ago",
    status: "CONTACTED",
    phone: "+91 91231 33445",
    email: "vikram@email.com",
    course: "Cyber Security",
    priority: "Medium",
    assignedTo: { name: "Amit Kumar", avatarInitials: "AK" },
    lastContact: "1 day ago",
    nextFollowUp: "25 Sep, 5:00 PM",
    notes: "Alumni referral. Looking for Certified Ethical Hacker training.",
  },
  {
    id: "lead-10",
    initials: "AG",
    name: "Ananya Gupta",
    source: "WhatsApp",
    timeAgo: "1 day ago",
    status: "INTERESTED",
    phone: "+91 88770 99887",
    email: "ananya@email.com",
    course: "AI & ML",
    priority: "High",
    assignedTo: { name: "Ishita Roy", avatarInitials: "IR" },
    lastContact: "1 day ago",
    nextFollowUp: "Tomorrow, 10:00 AM",
    notes: "Enquired about deep learning & Generative AI LLM fine-tuning tracks.",
  },
];

export default function WorkspaceLeadsView() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // State Management
  const [leads, setLeads] = useState<LeadItem[]>(INITIAL_LEADS);
  const [selectedLeadId, setSelectedLeadId] = useState<string>("lead-1");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(["lead-1"]));
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [drawerActiveTab, setDrawerActiveTab] = useState<"details" | "activity" | "notes" | "appointments">("details");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Lead Form State
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadCourse, setNewLeadCourse] = useState("Data Science");
  const [newLeadSource, setNewLeadSource] = useState<LeadItem["source"]>("Website");
  const [newLeadPriority, setNewLeadPriority] = useState<LeadPriority>("High");

  // Selected Lead object for Right Drawer
  const activeLead = useMemo(() => {
    return leads.find((l) => l.id === selectedLeadId) || leads[0];
  }, [leads, selectedLeadId]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.phone && item.phone.includes(searchQuery)) ||
        (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.course && item.course.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      const matchesSource = sourceFilter === "ALL" || item.source === sourceFilter;
      const matchesPriority = priorityFilter === "ALL" || item.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesSource && matchesPriority;
    });
  }, [leads, searchQuery, statusFilter, sourceFilter, priorityFilter]);

  // Multi-select actions
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLeads.map((l) => l.id)));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Status Styling Badge
  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case "NEW":
        return isDark
          ? "bg-sky-500/10 text-sky-400 border-sky-500/25"
          : "bg-sky-50 text-sky-700 border-sky-200";
      case "CONTACTED":
        return isDark
          ? "bg-purple-500/10 text-purple-400 border-purple-500/25"
          : "bg-purple-50 text-purple-700 border-purple-200";
      case "INTERESTED":
        return isDark
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
          : "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "COUNSELLING":
        return isDark
          ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
          : "bg-amber-50 text-amber-700 border-amber-200";
      case "VISITED":
        return isDark
          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/25"
          : "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "LOST":
        return isDark
          ? "bg-rose-500/10 text-rose-400 border-rose-500/25"
          : "bg-rose-50 text-rose-700 border-rose-200";
      case "ENROLLED":
        return isDark
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
          : "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Priority Styling Badge
  const getPriorityBadge = (priority?: LeadPriority) => {
    switch (priority) {
      case "High":
        return isDark
          ? "bg-rose-500/10 text-rose-400 border-rose-500/25"
          : "bg-rose-50 text-rose-600 border-rose-200";
      case "Medium":
        return isDark
          ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
          : "bg-amber-50 text-amber-700 border-amber-200";
      case "Low":
        return isDark
          ? "bg-slate-500/10 text-slate-400 border-slate-500/25"
          : "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  // Source Dot Color
  const getSourceDotColor = (source: string) => {
    switch (source) {
      case "Website":
        return "bg-emerald-400";
      case "WhatsApp":
        return "bg-emerald-500";
      case "Phone":
        return "bg-sky-400";
      case "Walk-in":
        return "bg-slate-400";
      case "Instagram":
        return "bg-pink-400";
      case "Referral":
        return "bg-purple-400";
      default:
        return "bg-slate-400";
    }
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
      phone: newLeadPhone || "+91 90000 00000",
      email: newLeadEmail || `${newLeadName.toLowerCase().replace(/\s+/g, "")}@email.com`,
      course: newLeadCourse,
      source: newLeadSource,
      status: "NEW",
      priority: newLeadPriority,
      timeAgo: "Just now",
      lastContact: "Just now",
      nextFollowUp: "Today, 6:00 PM",
      assignedTo: { name: "Amit Kumar", avatarInitials: "AK" },
      notes: "Newly created lead. Awaiting initial callback.",
    };

    setLeads([createdLead, ...leads]);
    setSelectedLeadId(createdLead.id);
    setIsAddLeadModalOpen(false);
    showToast(`Lead "${newLeadName}" added successfully.`);

    // Reset Form
    setNewLeadName("");
    setNewLeadPhone("");
    setNewLeadEmail("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 min-w-0 h-full flex flex-col justify-between gap-3.5 overflow-hidden min-h-0 select-none"
    >
      {/* 1. Header Greeting Banner: Exact Dashboard Hierarchy & Spacing */}
      <div className="flex items-center justify-between gap-4 select-none shrink-0">
        <div>
          <h1
            className={`text-[23px] sm:text-[25px] font-light tracking-[-0.03em] leading-tight ${
              isDark ? "text-white" : "text-[#0B0F17]"
            }`}
          >
            Turn enquiries into opportunities.
          </h1>
          <p
            className={`text-[12.5px] sm:text-[13px] font-normal leading-normal mt-1 ${
              isDark ? "text-[#9ca3af]" : "text-[#64748B]"
            }`}
          >
            Manage, track, and convert high-intent prospects with MAYA Copilot.
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Active Leads Counter Pill */}
          <div
            className={`inline-flex items-center gap-2 h-8.5 px-3 rounded-full border text-[11.5px] font-normal tracking-tight shrink-0 transition-all ${
              isDark
                ? "bg-white/[0.04] border-white/[0.08] text-neutral-300"
                : "bg-white border-slate-200 text-slate-700 shadow-2xs"
            }`}
          >
            <Users className={`w-3.5 h-3.5 stroke-[1.8] ${isDark ? "text-neutral-400" : "text-slate-500"}`} />
            <span>{leads.length} Leads</span>
          </div>

          {/* Primary Action Button */}
          <motion.button
            type="button"
            onClick={() => setIsAddLeadModalOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`inline-flex items-center gap-2 h-8.5 px-4 rounded-full text-[12px] font-medium transition-all duration-200 cursor-pointer shadow-sm shrink-0 ${
              isDark
                ? "bg-white text-[#0B0F17] hover:bg-neutral-100"
                : "bg-[#0B0F17] text-white hover:bg-[#1E293B]"
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Add Lead</span>
          </motion.button>
        </div>
      </div>

      {/* 2. Top 4 Metric KPI Cards: Exact Signature Dashboard Styling & Sparklines */}
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
                    isDark ? "text-[#8e95a5] group-hover:text-white" : "text-slate-500 group-hover:text-slate-900"
                  }`}
                >
                  {card.label}
                </span>
                <Icon className="w-3.5 h-3.5 stroke-[1.8]" />
              </div>

              {/* Middle Row: Massive Architectural Value & Sparkline Graphic */}
              <div className="flex items-baseline justify-between gap-2 mt-2 mb-1.5 relative z-10">
                <span
                  className={`text-[26px] sm:text-[29px] font-light tracking-[-0.04em] leading-none transition-colors duration-200 ${
                    isDark ? "text-white group-hover:text-white" : "text-[#0B0F17] group-hover:text-black"
                  }`}
                >
                  {card.value}
                </span>

                {/* Delicate Sparkline */}
                <div className="h-6 w-20 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <svg viewBox="0 0 120 30" className="w-full h-full overflow-visible">
                    <path
                      d={card.sparklineD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Bottom Row: Pill badge with percentage + timeframe */}
              <div className="flex items-center gap-1.5 relative z-10">
                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9.5px] font-medium border ${
                    card.isPositive
                      ? isDark
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : isDark
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {card.isPositive ? "↑" : "↓"} {card.changePct}%
                </span>
                <span className={`text-[10px] truncate ${isDark ? "text-[#717682]" : "text-slate-400"}`}>
                  {card.timeframe}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. Main Stage: Table on Left + Slide-Over Drawer on Right */}
      <div className="flex-1 min-h-0 flex gap-3.5 overflow-hidden">
        {/* Left Side: Table & Filters */}
        <div
          className={`flex-1 min-w-0 h-full rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden select-none ${
            isDark
              ? "bg-gradient-to-b from-[#111724]/95 via-[#0c101a]/95 to-[#080b12]/98 border-white/[0.09] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_24px_-6px_rgba(0,0,0,0.55)]"
              : "bg-gradient-to-b from-white via-white to-[#F8FAFC] border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_4px_16px_rgba(15,23,42,0.05)]"
          }`}
        >
          {/* Filter & Search Toolbar */}
          <div
            className={`p-3 px-4 border-b flex flex-wrap items-center justify-between gap-2.5 shrink-0 ${
              isDark ? "border-white/[0.08]" : "border-slate-200/80"
            }`}
          >
            {/* Search Input: Precision Pill Shape matching Header */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <div
                className={`flex items-center h-8.5 px-3.5 rounded-full border transition-all ${
                  isDark
                    ? "bg-[#0b0e16]/80 border-white/[0.08] focus-within:border-white/25 focus-within:bg-[#0e121d]"
                    : "bg-white border-slate-200/90 focus-within:border-[#0B0F17] shadow-2xs"
                }`}
              >
                <Search className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-neutral-400" : "text-slate-400"}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search leads by name, phone, email..."
                  className={`w-full ml-2 text-[12px] bg-transparent outline-none font-normal ${
                    isDark ? "text-white placeholder:text-[#556070]" : "text-[#0F172A] placeholder:text-[#94A3B8]"
                  }`}
                />
                <span
                  className={`text-[9.5px] px-1.5 py-0.5 rounded-full border font-mono shrink-0 select-none ${
                    isDark ? "bg-white/[0.06] border-white/10 text-neutral-400" : "bg-slate-100 border-slate-200 text-slate-500"
                  }`}
                >
                  Ctrl K
                </span>
              </div>
            </div>

            {/* Filter Dropdown Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`h-8 px-3 rounded-full border text-[11.5px] font-normal outline-none cursor-pointer transition-colors ${
                  isDark
                    ? "bg-[#0b0e16]/80 border-white/[0.08] text-white hover:border-white/20"
                    : "bg-white border-slate-200 text-[#0F172A] hover:border-slate-300 shadow-2xs"
                }`}
              >
                <option value="ALL">Status: All</option>
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="INTERESTED">Interested</option>
                <option value="COUNSELLING">Counselling</option>
                <option value="VISITED">Visited</option>
                <option value="LOST">Lost</option>
              </select>

              {/* Source Filter */}
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className={`h-8 px-3 rounded-full border text-[11.5px] font-normal outline-none cursor-pointer transition-colors ${
                  isDark
                    ? "bg-[#0b0e16]/80 border-white/[0.08] text-white hover:border-white/20"
                    : "bg-white border-slate-200 text-[#0F172A] hover:border-slate-300 shadow-2xs"
                }`}
              >
                <option value="ALL">Source: All</option>
                <option value="Website">Website</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Phone">Phone</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Instagram">Instagram</option>
                <option value="Referral">Referral</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className={`h-8 px-3 rounded-full border text-[11.5px] font-normal outline-none cursor-pointer transition-colors ${
                  isDark
                    ? "bg-[#0b0e16]/80 border-white/[0.08] text-white hover:border-white/20"
                    : "bg-white border-slate-200 text-[#0F172A] hover:border-slate-300 shadow-2xs"
                }`}
              >
                <option value="ALL">Priority: All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              {(statusFilter !== "ALL" || sourceFilter !== "ALL" || priorityFilter !== "ALL" || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("ALL");
                    setSourceFilter("ALL");
                    setPriorityFilter("ALL");
                    setSearchQuery("");
                  }}
                  className={`h-8 px-2.5 rounded-full text-[11px] border flex items-center gap-1 transition-colors cursor-pointer ${
                    isDark
                      ? "text-neutral-400 hover:text-white border-white/[0.08] bg-white/[0.03]"
                      : "text-slate-600 hover:text-slate-900 border-slate-200 bg-white shadow-2xs"
                  }`}
                  title="Reset filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}

              {/* View Toggle */}
              <div
                className={`h-8 flex items-center p-0.5 rounded-full border ml-1 ${
                  isDark ? "bg-[#0b0e16]/80 border-white/[0.08]" : "bg-slate-100 border-slate-200/90"
                }`}
              >
                <button
                  type="button"
                  className={`p-1 rounded-full transition-colors cursor-pointer ${
                    isDark ? "bg-white/[0.1] text-white" : "bg-white text-slate-900 shadow-2xs"
                  }`}
                  title="Table view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className={`p-1 rounded-full transition-colors cursor-pointer ${
                    isDark ? "text-neutral-500 hover:text-white" : "text-slate-400 hover:text-slate-900"
                  }`}
                  title="Grid view"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto pr-1">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr
                  className={`border-b text-[9.5px] uppercase tracking-[0.16em] font-medium sticky top-0 z-10 backdrop-blur-md select-none ${
                    isDark
                      ? "bg-[#0c101a]/95 border-white/[0.06] text-[#717682]"
                      : "bg-[#F8FAFC]/95 border-slate-200 text-[#94A3B8]"
                  }`}
                >
                  <th className="py-2.5 px-3.5 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.size > 0 && selectedIds.size === filteredLeads.length}
                      onChange={toggleSelectAll}
                      className="cursor-pointer accent-blue-600 rounded"
                    />
                  </th>
                  <th className="py-2.5 px-2">Name</th>
                  <th className="py-2.5 px-2">Contact</th>
                  <th className="py-2.5 px-2">Course</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-2">Priority</th>
                  <th className="py-2.5 px-2">Assigned To</th>
                  <th className="py-2.5 px-2">Last Contact</th>
                  <th className="py-2.5 px-2">Next Follow-up</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-white/[0.04]" : "divide-slate-100"}`}>
                {filteredLeads.map((lead) => {
                  const isSelected = selectedLeadId === lead.id;
                  const isChecked = selectedIds.has(lead.id);

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className={`group transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? isDark
                            ? "bg-white/[0.06] border-l-2 border-l-white"
                            : "bg-blue-50/70 border-l-2 border-l-blue-600"
                          : isDark
                          ? "hover:bg-white/[0.02]"
                          : "hover:bg-slate-50/80"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-2 px-3.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => toggleSelectRow(lead.id, e as any)}
                          className="cursor-pointer accent-blue-600 rounded"
                        />
                      </td>

                      {/* Name + Initials + Source */}
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 border ${
                              isDark
                                ? "bg-white/[0.06] text-white border-white/[0.1]"
                                : "bg-slate-100 text-slate-800 border-slate-200"
                            }`}
                          >
                            {lead.initials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span
                              className={`text-[12px] font-medium truncate ${
                                isDark ? "text-white" : "text-[#0F172A]"
                              }`}
                            >
                              {lead.name}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${getSourceDotColor(lead.source)}`} />
                              <span
                                className={`text-[10px] leading-tight ${
                                  isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                                }`}
                              >
                                {lead.source}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-2 px-2 text-[11px] leading-tight">
                        <div className={isDark ? "text-neutral-300" : "text-slate-700"}>{lead.phone}</div>
                        <div className={`text-[10px] truncate max-w-[130px] ${isDark ? "text-[#717682]" : "text-[#94A3B8]"}`}>
                          {lead.email}
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-2 px-2 text-[11.5px]">
                        <span className={isDark ? "text-neutral-300" : "text-slate-800"}>
                          {lead.course}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-2 px-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8.5px] font-medium tracking-wider border uppercase select-none ${getStatusBadge(
                            lead.status
                          )}`}
                        >
                          {lead.status}
                        </span>
                      </td>

                      {/* Priority Badge */}
                      <td className="py-2 px-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8.5px] font-medium border select-none ${getPriorityBadge(
                            lead.priority
                          )}`}
                        >
                          {lead.priority}
                        </span>
                      </td>

                      {/* Assigned Counselor */}
                      <td className="py-2 px-2 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[8.5px] font-semibold shrink-0 border ${
                              isDark
                                ? "bg-white/[0.08] text-white border-white/[0.1]"
                                : "bg-slate-200 text-slate-700 border-slate-300"
                            }`}
                          >
                            {lead.assignedTo?.avatarInitials}
                          </div>
                          <span className={isDark ? "text-neutral-300" : "text-slate-700"}>
                            {lead.assignedTo?.name.split(" ")[0]}
                          </span>
                        </div>
                      </td>

                      {/* Last Contact */}
                      <td className={`py-2 px-2 text-[10.5px] whitespace-nowrap ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"}`}>
                        {lead.lastContact}
                      </td>

                      {/* Next Follow-up */}
                      <td className={`py-2 px-2 text-[10.5px] whitespace-nowrap ${isDark ? "text-neutral-300" : "text-slate-800"}`}>
                        {lead.nextFollowUp}
                      </td>

                      {/* Actions */}
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            showToast(`Actions for ${lead.name}`);
                          }}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            isDark
                              ? "text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                              : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div
            className={`p-2.5 px-4 border-t flex items-center justify-between text-[11px] shrink-0 select-none ${
              isDark ? "border-white/[0.08] text-[#8e95a5]" : "border-slate-200/80 text-slate-600"
            }`}
          >
            <span>Showing 1–{filteredLeads.length} of 248 leads</span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                  isDark
                    ? "bg-white/[0.04] border-white/[0.08] text-neutral-400 hover:text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                className={`w-6 h-6 rounded-lg text-[11px] font-medium flex items-center justify-center transition-colors cursor-pointer ${
                  isDark ? "bg-white text-black" : "bg-[#0B0F17] text-white"
                }`}
              >
                1
              </button>
              <button
                type="button"
                className={`w-6 h-6 rounded-lg text-[11px] flex items-center justify-center transition-colors cursor-pointer ${
                  isDark ? "text-neutral-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                2
              </button>
              <button
                type="button"
                className={`w-6 h-6 rounded-lg text-[11px] flex items-center justify-center transition-colors cursor-pointer ${
                  isDark ? "text-neutral-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                3
              </button>
              <span className="text-neutral-500 px-0.5">...</span>
              <button
                type="button"
                className={`w-6 h-6 rounded-lg text-[11px] flex items-center justify-center transition-colors cursor-pointer ${
                  isDark ? "text-neutral-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                25
              </button>

              <button
                type="button"
                className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                  isDark
                    ? "bg-white/[0.04] border-white/[0.08] text-neutral-400 hover:text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Lead Detail Drawer (Slide-Over Card with Matching Dashboard Surface) */}
        {activeLead && (
          <div
            className={`w-[340px] shrink-0 h-full rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden select-none ${
              isDark
                ? "bg-gradient-to-b from-[#111724]/95 via-[#0c101a]/95 to-[#080b12]/98 border-white/[0.09] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_24px_-6px_rgba(0,0,0,0.55)]"
                : "bg-gradient-to-b from-white via-white to-[#F8FAFC] border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_4px_16px_rgba(15,23,42,0.05)]"
            }`}
          >
            {/* Drawer Top Header */}
            <div
              className={`p-3.5 px-4 border-b flex items-center justify-between shrink-0 select-none ${
                isDark ? "border-white/[0.08]" : "border-slate-200/80"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8.5 h-8.5 rounded-full flex items-center justify-center text-[11px] font-semibold border shrink-0 ${
                    isDark
                      ? "bg-white/[0.08] text-white border-white/[0.12]"
                      : "bg-slate-100 text-slate-800 border-slate-200"
                  }`}
                >
                  {activeLead.initials}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className={`text-[13px] font-medium leading-tight ${isDark ? "text-white" : "text-[#0B0F17]"}`}>
                      {activeLead.name}
                    </h3>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium border uppercase select-none ${getStatusBadge(
                        activeLead.status
                      )}`}
                    >
                      {activeLead.status}
                    </span>
                  </div>
                  <span className={`text-[10px] block mt-0.5 leading-tight ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"}`}>
                    {activeLead.source} • {activeLead.timeAgo}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedLeadId("")}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isDark ? "text-neutral-400 hover:text-white" : "text-slate-400 hover:text-slate-900"
                }`}
                title="Close drawer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Action Buttons */}
            <div
              className={`px-4 py-2 border-b flex items-center gap-2 shrink-0 ${
                isDark ? "border-white/[0.08]" : "border-slate-200/80"
              }`}
            >
              <button
                type="button"
                onClick={() => showToast(`Initiating call with ${activeLead.name}...`)}
                className={`flex-1 py-1.5 px-3 rounded-xl text-[11px] font-medium border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isDark
                    ? "bg-white/[0.06] border-white/10 text-white hover:bg-white/10"
                    : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-2xs"
                }`}
              >
                <Phone className="w-3 h-3 text-blue-500" />
                <span>Call</span>
              </button>

              <button
                type="button"
                onClick={() => showToast(`Opening WhatsApp chat with ${activeLead.phone}...`)}
                className={`flex-1 py-1.5 px-3 rounded-xl text-[11px] font-medium border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isDark
                    ? "bg-white/[0.06] border-white/10 text-white hover:bg-white/10"
                    : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-2xs"
                }`}
              >
                <MessageSquare className="w-3 h-3 text-emerald-500" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => showToast("Additional lead options")}
                className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                  isDark
                    ? "bg-white/[0.06] border-white/10 text-neutral-400 hover:text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-2xs"
                }`}
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sub-Tabs Bar */}
            <div
              className={`px-4 flex items-center gap-4 text-[11.5px] font-medium border-b shrink-0 select-none ${
                isDark ? "border-white/[0.08]" : "border-slate-200/80"
              }`}
            >
              {(["details", "activity", "notes", "appointments"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setDrawerActiveTab(tab)}
                  className={`py-2 relative capitalize transition-colors cursor-pointer ${
                    drawerActiveTab === tab
                      ? isDark
                        ? "text-white"
                        : "text-[#0B0F17]"
                      : isDark
                      ? "text-[#717682] hover:text-white"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {tab}
                  {drawerActiveTab === tab && (
                    <motion.div
                      layoutId="drawer-tab-underline"
                      className={`absolute bottom-0 inset-x-0 h-0.5 rounded-full ${
                        isDark ? "bg-white" : "bg-[#0B0F17]"
                      }`}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Scrollable Drawer Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3.5 text-[11.5px]">
              {drawerActiveTab === "details" && (
                <>
                  {/* Contact Information */}
                  <div>
                    <span className={`text-[9.5px] font-medium uppercase tracking-[0.16em] block mb-1.5 select-none ${
                      isDark ? "text-[#717682]" : "text-[#94A3B8]"
                    }`}>
                      Contact Information
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span className={isDark ? "text-neutral-200" : "text-slate-800"}>{activeLead.phone}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(activeLead.phone || "");
                            showToast("Phone number copied");
                          }}
                          className="text-neutral-400 hover:text-white cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className={isDark ? "text-neutral-200" : "text-slate-800"}>{activeLead.email}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(activeLead.email || "");
                            showToast("Email address copied");
                          }}
                          className="text-neutral-400 hover:text-white cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Lead Information Key-Values */}
                  <div className={`pt-3 border-t ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
                    <span className={`text-[9.5px] font-medium uppercase tracking-[0.16em] block mb-2 select-none ${
                      isDark ? "text-[#717682]" : "text-[#94A3B8]"
                    }`}>
                      Lead Information
                    </span>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className={isDark ? "text-[#8e95a5]" : "text-[#64748B]"}>Interested Course</span>
                        <span className={`font-medium ${isDark ? "text-white" : "text-[#0B0F17]"}`}>
                          {activeLead.course}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={isDark ? "text-[#8e95a5]" : "text-[#64748B]"}>Source</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${getSourceDotColor(activeLead.source)}`} />
                          <span className={isDark ? "text-white" : "text-[#0B0F17]"}>{activeLead.source}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={isDark ? "text-[#8e95a5]" : "text-[#64748B]"}>Status</span>
                        <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-medium border uppercase ${getStatusBadge(activeLead.status)}`}>
                          {activeLead.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={isDark ? "text-[#8e95a5]" : "text-[#64748B]"}>Priority</span>
                        <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-medium border ${getPriorityBadge(activeLead.priority)}`}>
                          {activeLead.priority}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={isDark ? "text-[#8e95a5]" : "text-[#64748B]"}>Assigned To</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-slate-300 text-slate-800 text-[8px] flex items-center justify-center font-bold">
                            {activeLead.assignedTo?.avatarInitials}
                          </div>
                          <span className={isDark ? "text-white" : "text-[#0B0F17]"}>{activeLead.assignedTo?.name}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={isDark ? "text-[#8e95a5]" : "text-[#64748B]"}>Next Follow-up</span>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className={isDark ? "text-white" : "text-[#0B0F17]"}>{activeLead.nextFollowUp}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes Box */}
                  <div className={`pt-3 border-t ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[9.5px] font-medium uppercase tracking-[0.16em] select-none ${
                        isDark ? "text-[#717682]" : "text-[#94A3B8]"
                      }`}>
                        Notes
                      </span>
                      <button
                        type="button"
                        onClick={() => showToast("Edit note")}
                        className="text-neutral-400 hover:text-white cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                    <div
                      className={`p-2.5 rounded-xl border text-[11px] leading-relaxed ${
                        isDark
                          ? "bg-white/[0.03] border-white/[0.06] text-neutral-300"
                          : "bg-slate-50/80 border-slate-200 text-slate-700"
                      }`}
                    >
                      {activeLead.notes || "No notes added yet."}
                    </div>
                  </div>
                </>
              )}

              {drawerActiveTab === "activity" && (
                <div className="flex flex-col gap-2.5 py-1">
                  <div className="flex gap-2.5 items-start">
                    <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquare className="w-2.5 h-2.5" />
                    </div>
                    <div>
                      <span className="font-medium block leading-tight">Inquiry received via {activeLead.source}</span>
                      <span className="text-[10px] text-neutral-400">{activeLead.timeAgo}</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-2.5 h-2.5" />
                    </div>
                    <div>
                      <span className="font-medium block leading-tight">Lead status assigned to {activeLead.status}</span>
                      <span className="text-[10px] text-neutral-400">Assigned to {activeLead.assignedTo?.name}</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <div className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                    </div>
                    <div>
                      <span className="font-medium block leading-tight">Follow-up scheduled</span>
                      <span className="text-[10px] text-neutral-400">{activeLead.nextFollowUp}</span>
                    </div>
                  </div>
                </div>
              )}

              {drawerActiveTab === "notes" && (
                <div className="flex flex-col gap-2">
                  <textarea
                    rows={4}
                    placeholder="Add a new note for this lead..."
                    className={`w-full p-2.5 rounded-xl border text-[11px] outline-none leading-relaxed resize-none ${
                      isDark
                        ? "bg-[#0b0e16] border-white/10 text-white focus:border-white/30"
                        : "bg-white border-slate-200 text-slate-800 focus:border-slate-800 shadow-2xs"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => showToast("Note saved")}
                    className={`self-end px-3 py-1.5 rounded-lg text-[10.5px] font-medium transition-colors cursor-pointer ${
                      isDark ? "bg-white text-black" : "bg-[#0B0F17] text-white"
                    }`}
                  >
                    Save Note
                  </button>
                </div>
              )}

              {drawerActiveTab === "appointments" && (
                <div className="flex flex-col gap-2 py-1">
                  <div className={`p-3 rounded-xl border ${isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-slate-200 shadow-2xs"}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[11.5px]">Consultation Briefing</span>
                      <span className="px-1.5 py-0.5 rounded text-[8.5px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        Confirmed
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 block mt-1">
                      {activeLead.nextFollowUp} with {activeLead.assignedTo?.name}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Bottom Action Button */}
            <div
              className={`p-3 border-t shrink-0 ${
                isDark ? "border-white/[0.08]" : "border-slate-200/80"
              }`}
            >
              <motion.button
                type="button"
                onClick={() => showToast(`Follow-up schedule reminder dispatched for ${activeLead.name}`)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-2 px-4 rounded-xl text-[11.5px] font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                  isDark
                    ? "bg-white text-[#0B0F17] hover:bg-neutral-100"
                    : "bg-[#0B0F17] text-white hover:bg-[#1E293B]"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule Follow-up</span>
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Add Lead Modal Dialog */}
      <AnimatePresence>
        {isAddLeadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full max-w-md p-5 rounded-2xl border shadow-2xl overflow-hidden ${
                isDark
                  ? "bg-[#0c101a] border-white/15 text-white shadow-black/80"
                  : "bg-white border-slate-200 text-[#0B0F17] shadow-xl"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-inherit">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-[14px] font-medium">Add New Lead</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddLeadModalOpen(false)}
                  className="p-1 rounded text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddLeadSubmit} className="mt-4 flex flex-col gap-3">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-400 mb-1">
                    Lead Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={newLeadName}
                    onChange={(e) => setNewLeadName(e.target.value)}
                    autoFocus
                    className={`w-full px-3 py-2 rounded-xl text-[12.5px] border outline-none ${
                      isDark
                        ? "bg-white/[0.04] border-white/10 text-white focus:border-white/30"
                        : "bg-slate-50 border-slate-200 text-[#0B0F17] focus:border-slate-800"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-400 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="+91 98765 00000"
                      value={newLeadPhone}
                      onChange={(e) => setNewLeadPhone(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-[12px] border outline-none font-mono ${
                        isDark
                          ? "bg-white/[0.04] border-white/10 text-white focus:border-white/30"
                          : "bg-slate-50 border-slate-200 text-[#0B0F17] focus:border-slate-800"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-400 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="rahul@email.com"
                      value={newLeadEmail}
                      onChange={(e) => setNewLeadEmail(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-[12px] border outline-none ${
                        isDark
                          ? "bg-white/[0.04] border-white/10 text-white focus:border-white/30"
                          : "bg-slate-50 border-slate-200 text-[#0B0F17] focus:border-slate-800"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-400 mb-1">
                      Interested Course
                    </label>
                    <select
                      value={newLeadCourse}
                      onChange={(e) => setNewLeadCourse(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-[12px] border outline-none cursor-pointer ${
                        isDark
                          ? "bg-[#0c101a] border-white/10 text-white focus:border-white/30"
                          : "bg-slate-50 border-slate-200 text-[#0B0F17] focus:border-slate-800"
                      }`}
                    >
                      <option value="Data Science">Data Science</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="Full Stack Dev">Full Stack Dev</option>
                      <option value="Cloud Computing">Cloud Computing</option>
                      <option value="AI & ML">AI & ML</option>
                      <option value="Cyber Security">Cyber Security</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-400 mb-1">
                      Lead Source
                    </label>
                    <select
                      value={newLeadSource}
                      onChange={(e) => setNewLeadSource(e.target.value as any)}
                      className={`w-full px-3 py-2 rounded-xl text-[12px] border outline-none cursor-pointer ${
                        isDark
                          ? "bg-[#0c101a] border-white/10 text-white focus:border-white/30"
                          : "bg-slate-50 border-slate-200 text-[#0B0F17] focus:border-slate-800"
                      }`}
                    >
                      <option value="Website">Website</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Phone">Phone</option>
                      <option value="Walk-in">Walk-in</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Referral">Referral</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-400 mb-1">
                    Priority Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["High", "Medium", "Low"] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setNewLeadPriority(lvl)}
                        className={`py-1.5 px-2 rounded-lg text-[11.5px] border text-center transition-colors cursor-pointer ${
                          newLeadPriority === lvl
                            ? isDark
                              ? "bg-white text-black font-medium border-white"
                              : "bg-[#0B0F17] text-white font-medium border-[#0B0F17]"
                            : isDark
                            ? "bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white"
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
                    className="px-3.5 py-1.5 rounded-xl text-[12px] font-medium text-neutral-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[12px] font-medium transition-all duration-200 cursor-pointer shadow-sm ${
                      isDark
                        ? "bg-white text-black hover:bg-neutral-100"
                        : "bg-[#0B0F17] text-white hover:bg-slate-800"
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Lead</span>
                  </button>
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
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
