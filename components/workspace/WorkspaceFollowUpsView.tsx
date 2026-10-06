"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Search,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MessageSquare,
  MessageCircle,
  MoreHorizontal,
  X,
  ArrowRight,
  Edit3,
  RotateCcw,
  SlidersHorizontal,
  LayoutGrid,
  Check,
  User,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

// ============================================================================
// TYPES & DATA CONTRACTS
// ============================================================================

export type FollowUpStatus = "Pending" | "Scheduled" | "Overdue" | "Completed";
export type FollowUpType = "Call" | "WhatsApp" | "Email" | "SMS";
export type FollowUpPriority = "High" | "Medium" | "Low";

export interface StaffMember {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
  role: string;
}

export interface FollowUpItem {
  id: string;
  leadName: string;
  leadInitials: string;
  leadAvatarUrl?: string;
  course: string;
  phone: string;
  email?: string;
  type: FollowUpType;
  reason: string;
  scheduledTime: string;
  relativeUrgency?: string;
  isUrgent?: boolean;
  status: FollowUpStatus;
  assignedTo: StaffMember;
  attempts: string;
  priority: FollowUpPriority;
  leadId: string;
  leadStatus: string;
  notes: string;
  history?: {
    date: string;
    action: string;
    staff: string;
  }[];
}

interface MetricCardItem {
  id: string;
  label: string;
  value: string | number;
  changePct: string;
  isPositive: boolean;
  timeframe: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBgLight: string;
  iconColorLight: string;
  iconBgDark: string;
  iconColorDark: string;
  sparklineD: string;
  strokeDark: string;
  strokeLight: string;
}

// ============================================================================
// 5 KPI METRIC CARDS (EXACT FIDELITY TO REFERENCE)
// ============================================================================

const FOLLOWUPS_METRICS: MetricCardItem[] = [
  {
    id: "total",
    label: "TOTAL FOLLOW-UPS",
    value: 86,
    changePct: "↑ 18%",
    isPositive: true,
    timeframe: "vs last week",
    icon: CheckSquare,
    iconBgLight: "bg-sky-50 border-sky-100",
    iconColorLight: "text-sky-600",
    iconBgDark: "bg-sky-500/10 border-sky-500/20",
    iconColorDark: "text-sky-400",
    sparklineD: "M 0 24 C 20 22, 45 16, 70 12 C 95 9, 105 6, 120 3",
    strokeDark: "#38bdf8",
    strokeLight: "#0284c7",
  },
  {
    id: "pending",
    label: "PENDING",
    value: 24,
    changePct: "↑ 12%",
    isPositive: true,
    timeframe: "vs last week",
    icon: Clock,
    iconBgLight: "bg-amber-50 border-amber-100",
    iconColorLight: "text-amber-600",
    iconBgDark: "bg-amber-500/10 border-amber-500/20",
    iconColorDark: "text-amber-400",
    sparklineD: "M 0 20 C 25 18, 50 15, 75 14 C 100 12, 110 8, 120 6",
    strokeDark: "#fbbf24",
    strokeLight: "#d97706",
  },
  {
    id: "due-today",
    label: "DUE TODAY",
    value: 6,
    changePct: "↓ 50%",
    isPositive: false,
    timeframe: "vs yesterday",
    icon: Calendar,
    iconBgLight: "bg-rose-50 border-rose-100",
    iconColorLight: "text-rose-600",
    iconBgDark: "bg-rose-500/10 border-rose-500/20",
    iconColorDark: "text-rose-400",
    sparklineD: "M 0 8 C 25 10, 50 16, 75 20 C 100 24, 110 25, 120 27",
    strokeDark: "#f43f5e",
    strokeLight: "#e11d48",
  },
  {
    id: "completed",
    label: "COMPLETED",
    value: 48,
    changePct: "↑ 28%",
    isPositive: true,
    timeframe: "vs last week",
    icon: CheckCircle2,
    iconBgLight: "bg-emerald-50 border-emerald-100",
    iconColorLight: "text-emerald-600",
    iconBgDark: "bg-emerald-500/10 border-emerald-500/20",
    iconColorDark: "text-emerald-400",
    sparklineD: "M 0 25 C 20 23, 45 15, 70 11 C 95 8, 105 5, 120 3",
    strokeDark: "#34d399",
    strokeLight: "#059669",
  },
  {
    id: "overdue",
    label: "OVERDUE",
    value: 8,
    changePct: "↑ 33%",
    isPositive: false,
    timeframe: "vs last week",
    icon: AlertCircle,
    iconBgLight: "bg-rose-50 border-rose-100",
    iconColorLight: "text-rose-600",
    iconBgDark: "bg-rose-500/10 border-rose-500/20",
    iconColorDark: "text-rose-400",
    sparklineD: "M 0 10 C 25 12, 50 18, 75 22 C 100 25, 110 26, 120 28",
    strokeDark: "#f43f5e",
    strokeLight: "#e11d48",
  },
];

// ============================================================================
// STAFF REPO & SEED FOLLOW-UP RECORDS
// ============================================================================

const STAFF_MEMBERS: Record<string, StaffMember> = {
  Amit: {
    id: "staff-1",
    name: "Amit Kumar",
    initials: "AK",
    role: "Senior Admissions Counsellor",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
  },
  Neha: {
    id: "staff-2",
    name: "Neha Sharma",
    initials: "NS",
    role: "Academic Advisor",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
  },
  Rohan: {
    id: "staff-3",
    name: "Rohan Varma",
    initials: "RV",
    role: "Program Coordinator",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
  },
  Ishita: {
    id: "staff-4",
    name: "Ishita Roy",
    initials: "IR",
    role: "Student Relations Lead",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
  },
};

const INITIAL_FOLLOWUPS: FollowUpItem[] = [
  {
    id: "followup-1",
    leadName: "Rahul Sharma",
    leadInitials: "RS",
    leadAvatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    course: "Data Science",
    phone: "+91 98765 43210",
    email: "rahul.sharma@example.com",
    type: "Call",
    reason: "Discuss course fees",
    scheduledTime: "Today, 11:00 AM",
    relativeUrgency: "in 30 min",
    isUrgent: true,
    status: "Pending",
    assignedTo: STAFF_MEMBERS.Amit,
    attempts: "0/3",
    priority: "High",
    leadId: "#1024",
    leadStatus: "NEW",
    notes: "Discuss course fees and available batches. Student is interested in weekend batch.",
    history: [
      { date: "Yesterday, 4:15 PM", action: "Lead intake registered via WhatsApp bot", staff: "MAYA Autonomous" },
      { date: "Today, 9:00 AM", action: "Follow-up priority escalated to High", staff: "Amit Kumar" },
    ],
  },
  {
    id: "followup-2",
    leadName: "Priya Mehta",
    leadInitials: "PM",
    leadAvatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    course: "UI/UX Design",
    phone: "+91 98765 12345",
    email: "priya.mehta@example.com",
    type: "WhatsApp",
    reason: "Send brochure",
    scheduledTime: "Today, 12:30 PM",
    relativeUrgency: "in 2 hr",
    isUrgent: true,
    status: "Pending",
    assignedTo: STAFF_MEMBERS.Neha,
    attempts: "1/3",
    priority: "Medium",
    leadId: "#1025",
    leadStatus: "CONTACTED",
    notes: "Send the updated Q4 design curriculum PDF and zero-interest EMI breakdown on WhatsApp.",
    history: [
      { date: "Today, 10:15 AM", action: "Initial phone consultation completed", staff: "Neha Sharma" },
    ],
  },
  {
    id: "followup-3",
    leadName: "Arjun Patel",
    leadInitials: "AP",
    leadAvatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    course: "Full Stack Dev",
    phone: "+91 99887 66554",
    email: "arjun.patel@example.com",
    type: "Email",
    reason: "Share curriculum",
    scheduledTime: "Today, 4:00 PM",
    status: "Pending",
    assignedTo: STAFF_MEMBERS.Rohan,
    attempts: "0/3",
    priority: "Medium",
    leadId: "#1026",
    leadStatus: "ENGAGED",
    notes: "Send detailed full stack MERN + Next.js syllabus breakdown with capstone project links.",
    history: [
      { date: "Yesterday, 2:30 PM", action: "Lead submitted web form enquiry", staff: "System" },
    ],
  },
  {
    id: "followup-4",
    leadName: "Sneha Iyer",
    leadInitials: "SI",
    leadAvatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    course: "Data Analytics",
    phone: "+91 77665 44332",
    email: "sneha.iyer@example.com",
    type: "Call",
    reason: "Follow up on demo",
    scheduledTime: "Tomorrow, 11:00 AM",
    status: "Scheduled",
    assignedTo: STAFF_MEMBERS.Neha,
    attempts: "1/3",
    priority: "High",
    leadId: "#1027",
    leadStatus: "DEMO_ATTENDED",
    notes: "Sneha attended the Saturday masterclass demo. Wants clarification on live 1-on-1 mentor hours.",
    history: [
      { date: "Saturday, 11:30 AM", action: "Attended live demo webinar", staff: "Neha Sharma" },
    ],
  },
  {
    id: "followup-5",
    leadName: "Karan Verma",
    leadInitials: "KV",
    leadAvatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    course: "Cloud Computing",
    phone: "+91 88776 55443",
    email: "karan.verma@example.com",
    type: "WhatsApp",
    reason: "Check decision",
    scheduledTime: "Tomorrow, 3:00 PM",
    status: "Scheduled",
    assignedTo: STAFF_MEMBERS.Amit,
    attempts: "0/3",
    priority: "Low",
    leadId: "#1028",
    leadStatus: "EVALUATING",
    notes: "Awaiting corporate reimbursement sign-off from employer.",
    history: [
      { date: "Friday, 3:00 PM", action: "Dispatched corporate quote letter", staff: "Amit Kumar" },
    ],
  },
  {
    id: "followup-6",
    leadName: "Riya Singh",
    leadInitials: "RS",
    leadAvatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    course: "Digital Marketing",
    phone: "+91 88990 11223",
    email: "riya.singh@example.com",
    type: "SMS",
    reason: "Share offer details",
    scheduledTime: "23 Sep, 10:00 AM",
    status: "Pending",
    assignedTo: STAFF_MEMBERS.Ishita,
    attempts: "0/3",
    priority: "Medium",
    leadId: "#1029",
    leadStatus: "PROMO_ELIGIBLE",
    notes: "Send the 15% festival registration discount code via automated SMS gateway.",
    history: [
      { date: "Sunday, 5:00 PM", action: "Lead qualified for festival offer", staff: "Ishita Roy" },
    ],
  },
  {
    id: "followup-7",
    leadName: "Aditya Nair",
    leadInitials: "AN",
    leadAvatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    course: "Python",
    phone: "+91 88774 22110",
    email: "aditya.nair@example.com",
    type: "Call",
    reason: "Follow up on trial class",
    scheduledTime: "22 Sep, 5:00 PM",
    status: "Overdue",
    assignedTo: STAFF_MEMBERS.Rohan,
    attempts: "2/3",
    priority: "High",
    leadId: "#1030",
    leadStatus: "URGENT",
    notes: "Missed scheduled callback yesterday evening. Immediate re-engagement requested by senior counsellor.",
    history: [
      { date: "22 Sep, 5:00 PM", action: "Outbound call attempted — no answer", staff: "Rohan Varma" },
    ],
  },
  {
    id: "followup-8",
    leadName: "Meera Joshi",
    leadInitials: "MJ",
    leadAvatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    course: "Product Management",
    phone: "+91 99881 22334",
    email: "meera.joshi@example.com",
    type: "Email",
    reason: "Send fee structure",
    scheduledTime: "22 Sep, 6:00 PM",
    status: "Overdue",
    assignedTo: STAFF_MEMBERS.Neha,
    attempts: "1/3",
    priority: "High",
    leadId: "#1031",
    leadStatus: "FINANCE_REVIEW",
    notes: "Candidate requested Women-In-Tech scholarship form and tuition installment schedule.",
    history: [
      { date: "22 Sep, 6:00 PM", action: "Email draft initiated", staff: "Neha Sharma" },
    ],
  },
  {
    id: "followup-9",
    leadName: "Vikram Rao",
    leadInitials: "VR",
    leadAvatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    course: "Cyber Security",
    phone: "+91 77665 99887",
    email: "vikram.rao@example.com",
    type: "WhatsApp",
    reason: "Share batch timing",
    scheduledTime: "24 Sep, 11:30 AM",
    status: "Scheduled",
    assignedTo: STAFF_MEMBERS.Amit,
    attempts: "0/3",
    priority: "Low",
    leadId: "#1032",
    leadStatus: "EXPLORING",
    notes: "Confirmed preference for weekend morning practical lab sessions.",
    history: [
      { date: "Monday, 11:00 AM", action: "Initial WhatsApp conversation", staff: "Amit Kumar" },
    ],
  },
  {
    id: "followup-10",
    leadName: "Ananya Gupta",
    leadInitials: "AG",
    leadAvatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    course: "AI & ML",
    phone: "+91 91234 88990",
    email: "ananya.gupta@example.com",
    type: "Call",
    reason: "Understand requirements",
    scheduledTime: "24 Sep, 2:00 PM",
    status: "Scheduled",
    assignedTo: STAFF_MEMBERS.Ishita,
    attempts: "0/3",
    priority: "Medium",
    leadId: "#1033",
    leadStatus: "NEW",
    notes: "Final year B.Tech student exploring career roadmap into Generative AI and production MLOps.",
    history: [
      { date: "Monday, 2:00 PM", action: "Consultation slot reserved", staff: "Ishita Roy" },
    ],
  },
];

// ============================================================================
// RESILIENT AVATAR COMPONENTS
// ============================================================================

function LeadAvatar({
  name,
  initials,
  avatarUrl,
  size = "md",
  isDark,
}: {
  name: string;
  initials: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
  isDark: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-8 h-8 text-[11px]",
    lg: "w-11 h-11 text-[14px]",
  }[size];

  if (avatarUrl && !imgError) {
    return (
      <div
        className={`${sizeClasses} rounded-full relative shrink-0 overflow-hidden border shadow-2xs ${
          isDark ? "border-white/10" : "border-slate-200"
        }`}
      >
        <img
          src={avatarUrl}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses} rounded-full flex items-center justify-center font-medium shrink-0 border transition-all duration-200 select-none ${
        isDark
          ? "bg-white/[0.06] text-white border-white/[0.09]"
          : "bg-slate-100 text-slate-800 border-slate-200 shadow-2xs"
      }`}
      title={name}
    >
      {initials || "—"}
    </div>
  );
}

function StaffAvatar({
  staff,
  size = "sm",
  isDark,
}: {
  staff: StaffMember;
  size?: "xs" | "sm" | "md";
  isDark: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: "w-5 h-5 text-[8.5px]",
    sm: "w-6 h-6 text-[9.5px]",
    md: "w-7 h-7 text-[10.5px]",
  }[size];

  if (staff.avatarUrl && !imgError) {
    return (
      <div
        className={`${sizeClasses} rounded-full relative shrink-0 overflow-hidden border ${
          isDark ? "border-white/10" : "border-slate-200"
        }`}
      >
        <img
          src={staff.avatarUrl}
          alt={staff.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses} rounded-full flex items-center justify-center font-medium shrink-0 border ${
        isDark
          ? "bg-white/[0.08] text-white border-white/10"
          : "bg-slate-200 text-slate-700 border-slate-300"
      }`}
      title={staff.name}
    >
      {staff.initials}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT: WORKSPACE FOLLOW-UPS VIEW
// ============================================================================

export default function WorkspaceFollowUpsView() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Data State
  const [followups, setFollowups] = useState<FollowUpItem[]>(INITIAL_FOLLOWUPS);
  const [activeStatusTab, setActiveStatusTab] = useState<"All" | "Pending" | "Today" | "Overdue" | "Completed">("All");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [staffFilter, setStaffFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("Mon, 22 Sep 2025");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Inspector Panel State
  const [selectedFollowUpId, setSelectedFollowUpId] = useState<string>("followup-1");
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [inspectorTab, setInspectorTab] = useState<"Details" | "History" | "Related" | "Notes">("Details");

  // Selection Checkbox State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal & Toast States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for "Create Follow-up"
  const [formLeadName, setFormLeadName] = useState("");
  const [formCourse, setFormCourse] = useState("Data Science");
  const [formType, setFormType] = useState<FollowUpType>("Call");
  const [formTime, setFormTime] = useState("Today, 3:00 PM");
  const [formStaff, setFormStaff] = useState("Amit");
  const [formReason, setFormReason] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsCreateModalOpen(false);
        setIsDatePickerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // Currently Selected Item
  const activeFollowUp = useMemo(() => {
    return followups.find((f) => f.id === selectedFollowUpId) || followups[0];
  }, [followups, selectedFollowUpId]);

  // Tab Counts for Segmented Control
  const tabCounts = useMemo(() => {
    return {
      all: 86,
      pending: 24,
      today: 6,
      overdue: 8,
      completed: 48,
    };
  }, []);

  // Filtered Pipeline
  const filteredFollowups = useMemo(() => {
    return followups.filter((f) => {
      // Tab filter
      if (activeStatusTab === "Pending" && f.status !== "Pending") return false;
      if (activeStatusTab === "Today" && !f.scheduledTime.toLowerCase().includes("today")) return false;
      if (activeStatusTab === "Overdue" && f.status !== "Overdue") return false;
      if (activeStatusTab === "Completed" && f.status !== "Completed") return false;

      // Dropdown filters
      if (typeFilter !== "ALL" && f.type !== typeFilter) return false;
      if (staffFilter !== "ALL" && f.assignedTo.name.split(" ")[0] !== staffFilter) return false;
      if (statusFilter !== "ALL" && f.status !== statusFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesLead = f.leadName.toLowerCase().includes(q);
        const matchesCourse = f.course.toLowerCase().includes(q);
        const matchesReason = f.reason.toLowerCase().includes(q);
        const matchesPhone = f.phone.includes(q);
        if (!matchesLead && !matchesCourse && !matchesReason && !matchesPhone) return false;
      }
      return true;
    });
  }, [followups, activeStatusTab, typeFilter, staffFilter, statusFilter, searchQuery]);

  // Selection Checkbox Logic
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredFollowups.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredFollowups.map((f) => f.id)));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Badge Style Resolvers
  const getStatusBadgeStyle = (status: FollowUpStatus) => {
    switch (status) {
      case "Pending":
        return isDark
          ? "bg-amber-500/10 text-amber-300 border-amber-500/25"
          : "bg-amber-50 text-amber-700 border-amber-200";
      case "Scheduled":
        return isDark
          ? "bg-sky-500/10 text-sky-300 border-sky-500/25"
          : "bg-sky-50 text-sky-700 border-sky-200";
      case "Overdue":
        return isDark
          ? "bg-rose-500/10 text-rose-300 border-rose-500/25"
          : "bg-rose-50 text-rose-700 border-rose-200";
      case "Completed":
        return isDark
          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25"
          : "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  const getStatusDotColor = (status: FollowUpStatus) => {
    switch (status) {
      case "Pending":
        return "bg-amber-400";
      case "Scheduled":
        return "bg-sky-400";
      case "Overdue":
        return "bg-rose-400";
      case "Completed":
        return "bg-emerald-400";
    }
  };

  // Type Channel Icon Resolver
  const renderTypeIcon = (type: FollowUpType) => {
    switch (type) {
      case "Call":
        return <Phone className="w-3.5 h-3.5 text-sky-500 shrink-0" />;
      case "WhatsApp":
        return <MessageCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case "Email":
        return <Mail className="w-3.5 h-3.5 text-sky-500 shrink-0" />;
      case "SMS":
        return <MessageSquare className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
    }
  };

  // Create Follow-up submission handler
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLeadName.trim()) return;

    const assignedStaff = STAFF_MEMBERS[formStaff] || STAFF_MEMBERS.Amit;
    const initials = formLeadName
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const newItem: FollowUpItem = {
      id: `followup-${Date.now()}`,
      leadName: formLeadName.trim(),
      leadInitials: initials,
      course: formCourse,
      phone: "+91 98765 00000",
      type: formType,
      reason: formReason.trim() || "Course details follow-up",
      scheduledTime: formTime,
      status: "Pending",
      assignedTo: assignedStaff,
      attempts: "0/3",
      priority: "Medium",
      leadId: `#${Math.floor(1000 + Math.random() * 9000)}`,
      leadStatus: "NEW",
      notes: formReason.trim() || "Initial follow-up registered.",
    };

    setFollowups((prev) => [newItem, ...prev]);
    setSelectedFollowUpId(newItem.id);
    setIsCreateModalOpen(false);
    setFormLeadName("");
    setFormReason("");
    showToast(`Follow-up created for ${newItem.leadName}.`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 min-w-0 h-full flex flex-col justify-between gap-3.5 overflow-hidden min-h-0 select-none"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            className={`fixed top-4 right-8 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium shadow-xl border backdrop-blur-md ${
              isDark
                ? "bg-[#0b0e14]/95 border-white/20 text-white shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
                : "bg-white/95 border-slate-200 text-slate-900 shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================================================================== */}
      {/* 1. EDITORIAL HEADER & ACTION BAR                                     */}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none shrink-0">
        <div>
          <span
            className={`text-[9px] sm:text-[9.5px] font-mono tracking-[0.2em] uppercase font-semibold block ${
              isDark ? "text-neutral-400" : "text-slate-500"
            }`}
          >
            FOLLOW-UPS
          </span>
          <h1
            className={`text-[23px] sm:text-[25px] font-light tracking-[-0.03em] leading-tight mt-0.5 ${
              isDark ? "text-white" : "text-[#0B0F17]"
            }`}
          >
            Never miss an opportunity.
          </h1>
          <p
            className={`text-[12.5px] sm:text-[13px] font-normal leading-normal mt-0.5 ${
              isDark ? "text-[#9ca3af]" : "text-[#64748B]"
            }`}
          >
            Stay on top of every follow-up and keep your pipeline moving.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* Omni Search Pill */}
          <div
            className={`relative flex items-center h-8.5 w-60 sm:w-68 px-3 rounded-full border transition-all duration-200 ${
              isDark
                ? "bg-[#0c101a] border-white/[0.08] focus-within:border-white/25 focus-within:bg-[#0e121d]"
                : "bg-slate-50 border-slate-200 focus-within:border-[#0B0F17] focus-within:bg-white shadow-2xs"
            }`}
          >
            <Search
              className={`w-3.5 h-3.5 shrink-0 ${
                isDark ? "text-neutral-400" : "text-slate-400"
              }`}
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search follow-ups, leads..."
              className={`w-full ml-2 bg-transparent text-[12px] outline-none ${
                isDark ? "text-white placeholder:text-neutral-500" : "text-slate-900 placeholder:text-slate-400"
              }`}
            />
            <kbd
              className={`hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono rounded-md border shrink-0 ${
                isDark
                  ? "bg-white/[0.06] border-white/10 text-neutral-400"
                  : "bg-slate-100 border-slate-200 text-slate-500"
              }`}
            >
              Ctrl K
            </kbd>
          </div>

          {/* Primary CTA: Create Follow-up */}
          <motion.button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`inline-flex items-center gap-1.5 h-8.5 px-4 rounded-full text-[12px] font-medium transition-all duration-200 cursor-pointer shadow-sm select-none ${
              isDark
                ? "bg-white text-black hover:bg-neutral-100 shadow-[0_2px_10px_rgba(255,255,255,0.08)]"
                : "bg-[#0B0F17] text-white hover:bg-slate-800 shadow-xs"
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Create Follow-up</span>
          </motion.button>

          {/* Date Selector Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className={`inline-flex items-center gap-2 h-8.5 px-3.5 rounded-full text-[11.5px] font-medium border transition-all duration-200 cursor-pointer ${
                isDark
                  ? "bg-[#0c101a] border-white/[0.08] text-neutral-300 hover:text-white hover:border-white/20 shadow-2xs"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-2xs"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>{selectedDateRange}</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {isDatePickerOpen && (
              <div
                className={`absolute right-0 top-10.5 z-40 w-56 rounded-2xl p-1.5 border shadow-xl backdrop-blur-xl ${
                  isDark
                    ? "bg-[#0b0e14]/95 border-white/15 text-white shadow-black/80"
                    : "bg-white border-slate-200 text-slate-900 shadow-slate-200/50"
                }`}
              >
                {[
                  "Mon, 22 Sep 2025",
                  "Tue, 23 Sep 2025",
                  "Wed, 24 Sep 2025",
                  "This Week (Sep 2025)",
                  "All Active Follow-ups",
                ].map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => {
                      setSelectedDateRange(range);
                      setIsDatePickerOpen(false);
                      showToast(`Date scope: ${range}`);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-[12px] transition-colors cursor-pointer ${
                      selectedDateRange === range
                        ? isDark
                          ? "bg-white/10 text-white font-medium"
                          : "bg-slate-100 text-slate-900 font-medium"
                        : isDark
                        ? "hover:bg-white/[0.04] text-neutral-300"
                        : "hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. 5 KPI METRICS STRIP                                               */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 shrink-0 select-none">
        {FOLLOWUPS_METRICS.map((card, idx) => {
          const Icon = card.icon;
          const strokeColor = isDark ? card.strokeDark : card.strokeLight;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: idx * 0.04,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -2, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
              className={`relative p-3.5 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-default select-none ${
                isDark
                  ? "bg-gradient-to-b from-[#111724]/95 via-[#0c101a]/95 to-[#080b12]/98 border-white/[0.09] hover:border-white/[0.2] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_24px_-6px_rgba(0,0,0,0.55)]"
                  : "bg-gradient-to-b from-white via-white to-[#F8FAFC] border-slate-200/90 hover:border-slate-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_4px_16px_rgba(15,23,42,0.05)]"
              }`}
            >
              {/* Top Row: Eyebrow + Linear Icon */}
              <div className="flex items-center justify-between gap-2 relative z-10">
                <span
                  className={`text-[9px] sm:text-[9.5px] font-medium uppercase tracking-[0.16em] truncate transition-colors duration-200 ${
                    isDark ? "text-[#8e95a5] group-hover:text-white" : "text-slate-500 group-hover:text-slate-900"
                  }`}
                >
                  {card.label}
                </span>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all duration-300 shrink-0 ${
                    isDark
                      ? `${card.iconBgDark} ${card.iconColorDark}`
                      : `${card.iconBgLight} ${card.iconColorLight}`
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 stroke-[1.8]" />
                </div>
              </div>

              {/* Middle Row: Large Value + Sparkline */}
              <div className="flex items-baseline justify-between gap-2 my-2 relative z-10">
                <span
                  className={`text-[23px] sm:text-[25px] font-light tracking-[-0.03em] tabular-nums leading-none ${
                    isDark ? "text-white" : "text-[#0B0F17]"
                  }`}
                >
                  {card.value}
                </span>

                <div className="w-16 h-6 opacity-45 group-hover:opacity-85 transition-opacity duration-300 shrink-0">
                  <svg viewBox="0 0 120 30" fill="none" className="w-full h-full overflow-visible">
                    <motion.path
                      d={card.sparklineD}
                      stroke={strokeColor}
                      strokeWidth="1.35"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{
                        pathLength: { duration: 0.85, delay: 0.1 + idx * 0.05, ease: [0.16, 1, 0.3, 1] },
                        opacity: { duration: 0.2, delay: 0.1 + idx * 0.05 },
                      }}
                    />
                  </svg>
                </div>
              </div>

              {/* Bottom Row: Trend Context */}
              <div className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] tracking-tight relative z-10 truncate">
                <span
                  className={`font-medium shrink-0 ${
                    card.isPositive
                      ? isDark
                        ? "text-emerald-400"
                        : "text-emerald-600"
                      : isDark
                      ? "text-rose-400"
                      : "text-rose-600"
                  }`}
                >
                  {card.changePct}
                </span>
                <span className={`shrink-0 ${isDark ? "text-white/20" : "text-slate-300"}`}>·</span>
                <span className={`truncate ${isDark ? "text-[#717682]" : "text-slate-500"}`}>
                  {card.timeframe}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* 3. MAIN STAGE: DE-CLUTTERED TABLE & RIGHT DRAWER                     */}
      {/* ==================================================================== */}
      <div className="flex-1 w-full flex gap-3.5 overflow-hidden min-h-0">
        {/* Table Surface */}
        <div
          className={`flex-1 min-w-0 h-full rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
            isDark
              ? "bg-gradient-to-b from-[#111724]/95 via-[#0c101a]/95 to-[#080b12]/98 border-white/[0.09] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_30px_rgba(0,0,0,0.55)]"
              : "bg-gradient-to-b from-white via-white to-[#F8FAFC] border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_4px_20px_rgba(15,23,42,0.06)]"
          }`}
        >
          {/* Toolbar: Segmented Controls + Filters */}
          <div
            className={`p-3 px-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
              isDark ? "border-white/[0.06]" : "border-slate-100"
            }`}
          >
            {/* Segmented Status Filter Pills */}
            <div
              className={`inline-flex items-center p-0.75 rounded-full border ${
                isDark ? "bg-[#090C12]/90 border-white/[0.08]" : "bg-slate-100/80 border-slate-200/60"
              }`}
            >
              {[
                { key: "All", label: "All", count: tabCounts.all },
                { key: "Pending", label: "Pending", count: tabCounts.pending },
                { key: "Today", label: "Today", count: tabCounts.today },
                { key: "Overdue", label: "Overdue", count: tabCounts.overdue },
                { key: "Completed", label: "Completed", count: tabCounts.completed },
              ].map((tab) => {
                const isActive = activeStatusTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveStatusTab(tab.key as any)}
                    className={`relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-medium transition-colors duration-200 cursor-pointer select-none ${
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
                        layoutId="active-followup-status-pill"
                        className={`absolute inset-0 rounded-full ${
                          isDark ? "bg-white" : "bg-[#0B0F17]"
                        }`}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                    <span
                      className={`relative z-10 px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums ${
                        isActive
                          ? isDark
                            ? "bg-black/10 text-black font-bold"
                            : "bg-white/20 text-white font-bold"
                          : isDark
                          ? "bg-white/[0.06] text-neutral-400"
                          : "bg-slate-200/70 text-slate-500"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2">
              {/* Type Filter */}
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className={`h-8 pl-3 pr-7 rounded-full text-[11.5px] font-medium border appearance-none cursor-pointer outline-none transition-all duration-200 ${
                    isDark
                      ? "bg-[#0b0e14] border-white/[0.08] text-neutral-200 hover:border-white/20"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <option value="ALL">Follow-up Type</option>
                  <option value="Call">Call</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                </select>
                <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Assigned Staff Filter */}
              <div className="relative">
                <select
                  value={staffFilter}
                  onChange={(e) => setStaffFilter(e.target.value)}
                  className={`h-8 pl-3 pr-7 rounded-full text-[11.5px] font-medium border appearance-none cursor-pointer outline-none transition-all duration-200 ${
                    isDark
                      ? "bg-[#0b0e14] border-white/[0.08] text-neutral-200 hover:border-white/20"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <option value="ALL">Assigned To</option>
                  <option value="Amit">Amit</option>
                  <option value="Neha">Neha</option>
                  <option value="Rohan">Rohan</option>
                  <option value="Ishita">Ishita</option>
                </select>
                <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`h-8 pl-3 pr-7 rounded-full text-[11.5px] font-medium border appearance-none cursor-pointer outline-none transition-all duration-200 ${
                    isDark
                      ? "bg-[#0b0e14] border-white/[0.08] text-neutral-200 hover:border-white/20"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <option value="ALL">Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Completed">Completed</option>
                </select>
                <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Quick Reset / Options */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setTypeFilter("ALL");
                  setStaffFilter("ALL");
                  setStatusFilter("ALL");
                  setSearchQuery("");
                  showToast("Filters reset to default.");
                }}
                className={`h-8 px-2.5 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isDark
                    ? "bg-[#0b0e14] border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20"
                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 shadow-2xs hover:border-slate-300"
                }`}
                title="Reset filters"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>

          {/* Table Container - no-scrollbar removes ugly native scrollbars */}
          <div className="flex-1 overflow-auto no-scrollbar min-h-0">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead
                className={`sticky top-0 z-10 text-[9.5px] sm:text-[10px] font-mono uppercase tracking-[0.14em] font-medium border-b select-none ${
                  isDark
                    ? "bg-[#0c101a] border-white/[0.07] text-[#8e95a5]"
                    : "bg-slate-50/95 border-slate-200 text-slate-500 backdrop-blur-md"
                }`}
              >
                <tr>
                  <th className="py-2.5 pl-4 pr-2 w-9">
                    <input
                      type="checkbox"
                      checked={
                        filteredFollowups.length > 0 &&
                        selectedIds.size === filteredFollowups.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 accent-neutral-800 cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-3">Lead</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Reason / Notes</th>
                  <th className="py-2.5 px-3">Scheduled Time ↓</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Assigned To</th>
                  <th className="py-2.5 px-3 text-center">Attempts</th>
                  <th className="py-2.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className={`divide-y ${isDark ? "divide-white/[0.04]" : "divide-slate-100"}`}>
                {filteredFollowups.map((item) => {
                  const isSelected = selectedFollowUpId === item.id;
                  const isChecked = selectedIds.has(item.id);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => {
                        setSelectedFollowUpId(item.id);
                        if (!isInspectorOpen) setIsInspectorOpen(true);
                      }}
                      className={`group transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? isDark
                            ? "bg-white/[0.06] hover:bg-white/[0.08]"
                            : "bg-slate-100/90 hover:bg-slate-100"
                          : isDark
                          ? "hover:bg-white/[0.02]"
                          : "hover:bg-slate-50/70"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-2.5 pl-4 pr-2" onClick={(e) => toggleSelectRow(item.id, e)}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-slate-300 accent-neutral-800 cursor-pointer"
                        />
                      </td>

                      {/* Lead */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <LeadAvatar
                            name={item.leadName}
                            initials={item.leadInitials}
                            avatarUrl={item.leadAvatarUrl}
                            size="sm"
                            isDark={isDark}
                          />

                          <div className="min-w-0">
                            <span
                              className={`font-medium block leading-tight truncate ${
                                isDark ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {item.leadName}
                            </span>
                            <span
                              className={`text-[10px] leading-tight block mt-0.5 truncate ${
                                isDark ? "text-neutral-400" : "text-slate-500"
                              }`}
                            >
                              {item.course}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 font-medium">
                          {renderTypeIcon(item.type)}
                          <span className={isDark ? "text-neutral-200" : "text-slate-800"}>
                            {item.type}
                          </span>
                        </div>
                      </td>

                      {/* Reason / Notes */}
                      <td className={`py-2.5 px-3 truncate max-w-[220px] ${isDark ? "text-neutral-300" : "text-slate-700"}`}>
                        {item.reason}
                      </td>

                      {/* Scheduled Time */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                            {item.scheduledTime}
                          </span>
                          {item.relativeUrgency && (
                            <span className="text-[10px] font-mono text-rose-500 font-semibold leading-tight mt-0.5">
                              {item.relativeUrgency}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-medium tracking-wider border uppercase select-none transition-colors duration-150 ${getStatusBadgeStyle(
                            item.status
                          )}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusDotColor(item.status)}`} />
                          <span>{item.status}</span>
                        </span>
                      </td>

                      {/* Assigned To */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <StaffAvatar staff={item.assignedTo} size="xs" isDark={isDark} />
                          <span className={isDark ? "text-neutral-300" : "text-slate-700"}>
                            {item.assignedTo.name.split(" ")[0]}
                          </span>
                        </div>
                      </td>

                      {/* Attempts */}
                      <td className="py-2.5 px-3 text-center font-mono text-[11px] tabular-nums whitespace-nowrap text-neutral-400">
                        {item.attempts}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 pr-4 text-right whitespace-nowrap">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            showToast(`Actions for ${item.leadName}`);
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                            isDark
                              ? "text-neutral-400 hover:text-white hover:bg-white/10"
                              : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </motion.button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer: Sleek Apple Status Bar */}
          <div
            className={`p-2.5 px-4 flex items-center justify-between border-t shrink-0 text-[11px] select-none ${
              isDark ? "border-white/[0.06] text-[#8e95a5]" : "border-slate-100 text-slate-500"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Showing 1–10 of 86 follow-ups</span>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[10.5px]">
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => showToast("Previous page")}
                className={`h-6 px-2 rounded-md border flex items-center justify-center cursor-pointer transition-all duration-150 ${
                  isDark
                    ? "border-white/10 hover:border-white/20 text-neutral-400 hover:text-white"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                title="Previous"
              >
                <ChevronLeft className="w-3 h-3" />
              </motion.button>

              <span className="px-1 tabular-nums">Page 1 of 9</span>

              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => showToast("Next page")}
                className={`h-6 px-2 rounded-md border flex items-center justify-center cursor-pointer transition-all duration-150 ${
                  isDark
                    ? "border-white/10 hover:border-white/20 text-neutral-400 hover:text-white"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                title="Next"
              >
                <ChevronRight className="w-3 h-3" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* RIGHT DRAWER: "FOLLOW-UP DETAILS" INSPECTOR                        */}
        {/* ================================================================== */}
        <AnimatePresence>
          {isInspectorOpen && (
            <motion.div
              key="followup-details-inspector"
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 360 }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className={`w-[360px] shrink-0 h-full flex flex-col justify-between overflow-hidden rounded-2xl border transition-all select-none ${
                isDark
                  ? "bg-gradient-to-b from-[#111724]/98 via-[#0c101a]/98 to-[#080b12]/98 border-white/[0.09] shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
                  : "bg-white border-slate-200/90 shadow-sm"
              }`}
            >
              {/* Header: Title + Close Icon */}
              <div
                className={`p-3.5 px-4 flex items-center justify-between border-b shrink-0 ${
                  isDark ? "border-white/[0.06]" : "border-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-medium text-[12px] border ${
                      isDark
                        ? "bg-white/10 text-white border-white/15"
                        : "bg-slate-100 text-slate-800 border-slate-200"
                    }`}
                  >
                    {activeFollowUp.leadInitials}
                  </div>
                  <div>
                    <h2 className={`text-[13.5px] font-semibold tracking-tight leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                      {activeFollowUp.leadName}
                    </h2>
                    <span className="text-[10px] text-neutral-400 mt-0.5 block">
                      {activeFollowUp.course} • Lead {activeFollowUp.leadId}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsInspectorOpen(false)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                    isDark
                      ? "text-neutral-400 hover:text-white hover:bg-white/10"
                      : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                  title="Close Details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Inspector Content */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 min-h-0">
                {/* Segmented Navigation Tabs */}
                <div
                  className={`flex items-center border-b text-[11.5px] font-medium shrink-0 ${
                    isDark ? "border-white/[0.06]" : "border-slate-200"
                  }`}
                >
                  {(["Details", "History", "Related", "Notes"] as const).map((tab) => {
                    const isActive = inspectorTab === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setInspectorTab(tab)}
                        className={`relative pb-2 px-3 transition-colors cursor-pointer ${
                          isActive
                            ? isDark
                              ? "text-white font-semibold"
                              : "text-slate-900 font-semibold"
                            : isDark
                            ? "text-neutral-500 hover:text-neutral-300"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <span>{tab}</span>
                        {isActive && (
                          <motion.div
                            layoutId="followUpTabUnderline"
                            className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                              isDark ? "bg-white" : "bg-slate-900"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Tab: Details */}
                {inspectorTab === "Details" && (
                  <div className="space-y-4">
                    {/* Follow-up Information Key-Value List */}
                    <div>
                      <span className={`text-[11.5px] font-semibold block mb-2.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                        Follow-up Information
                      </span>

                      <div className="space-y-2.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className={isDark ? "text-neutral-400" : "text-slate-500"}>Type</span>
                          <div className="inline-flex items-center gap-1.5 font-medium">
                            {renderTypeIcon(activeFollowUp.type)}
                            <span className={isDark ? "text-white" : "text-slate-900"}>{activeFollowUp.type}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={isDark ? "text-neutral-400" : "text-slate-500"}>Scheduled Time</span>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-neutral-400" />
                            <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                              {activeFollowUp.scheduledTime}
                            </span>
                            {activeFollowUp.relativeUrgency && (
                              <span className="text-[10px] text-rose-500 font-mono font-semibold">
                                {activeFollowUp.relativeUrgency}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={isDark ? "text-neutral-400" : "text-slate-500"}>Status</span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-medium tracking-wider border uppercase select-none ${getStatusBadgeStyle(
                              activeFollowUp.status
                            )}`}
                          >
                            {activeFollowUp.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={isDark ? "text-neutral-400" : "text-slate-500"}>Assigned To</span>
                          <div className="flex items-center gap-1.5">
                            <StaffAvatar staff={activeFollowUp.assignedTo} size="xs" isDark={isDark} />
                            <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                              {activeFollowUp.assignedTo.name}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={isDark ? "text-neutral-400" : "text-slate-500"}>Attempts</span>
                          <span className="font-mono tabular-nums text-neutral-400">{activeFollowUp.attempts}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={isDark ? "text-neutral-400" : "text-slate-500"}>Priority</span>
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            {activeFollowUp.priority}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={isDark ? "text-neutral-400" : "text-slate-500"}>Related to</span>
                          <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>Lead</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={isDark ? "text-neutral-400" : "text-slate-500"}>Lead Status</span>
                          <span className="px-2 py-0.5 rounded-md text-[9.5px] font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            {activeFollowUp.leadStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reason / Notes Card */}
                    <div>
                      <span className={`text-[11.5px] font-semibold block mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                        Reason / Notes
                      </span>
                      <div
                        className={`p-3 rounded-2xl border text-[11.5px] leading-relaxed ${
                          isDark ? "bg-white/[0.02] border-white/[0.06] text-neutral-300" : "bg-slate-50 border-slate-100 text-slate-700"
                        }`}
                      >
                        {activeFollowUp.notes}
                      </div>
                    </div>

                    {/* 3 Squircle Quick Actions */}
                    <div className="grid grid-cols-3 gap-2 select-none">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => showToast(`Reschedule requested for ${activeFollowUp.leadName}.`)}
                        className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isDark
                            ? "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] text-neutral-300"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                        }`}
                      >
                        <Calendar className="w-4 h-4 text-sky-400" />
                        <span className="text-[10px] font-medium leading-tight">Reschedule</span>
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setFollowups((prev) =>
                            prev.map((f) => (f.id === activeFollowUp.id ? { ...f, status: "Completed" } : f))
                          );
                          showToast(`Follow-up marked as Completed.`);
                        }}
                        className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isDark
                            ? "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] text-neutral-300"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-medium leading-tight">Mark as Completed</span>
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => showToast(`Editing follow-up notes for ${activeFollowUp.leadName}.`)}
                        className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isDark
                            ? "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] text-neutral-300"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                        }`}
                      >
                        <Edit3 className="w-4 h-4 text-amber-400" />
                        <span className="text-[10px] font-medium leading-tight">Edit</span>
                      </motion.button>
                    </div>

                    {/* Primary Direct CTA: Start Call */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => showToast(`Initiating call with ${activeFollowUp.leadName} (${activeFollowUp.phone})...`)}
                      className={`w-full h-9.5 rounded-full text-[12px] font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm select-none ${
                        isDark
                          ? "bg-white text-black hover:bg-neutral-100 font-semibold"
                          : "bg-[#0B0F17] text-white hover:bg-slate-800 font-semibold"
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Start Call</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                    </motion.button>
                  </div>
                )}

                {/* Tab: History */}
                {inspectorTab === "History" && (
                  <div className="space-y-3">
                    <span className={`text-[11.5px] font-semibold block mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                      Audit Trail
                    </span>
                    {activeFollowUp.history && activeFollowUp.history.length > 0 ? (
                      activeFollowUp.history.map((h, i) => (
                        <div
                          key={i}
                          className={`p-2.5 rounded-xl border space-y-1 ${
                            isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-slate-50 border-slate-100"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                            <span>{h.date}</span>
                            <span>{h.staff}</span>
                          </div>
                          <p className={`text-[11.5px] ${isDark ? "text-neutral-300" : "text-slate-700"}`}>
                            {h.action}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[12px] text-neutral-500 py-4 text-center">No previous history entries recorded.</p>
                    )}
                  </div>
                )}

                {/* Tab: Related */}
                {inspectorTab === "Related" && (
                  <div className="space-y-3">
                    <span className={`text-[11.5px] font-semibold block mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                      Connected CRM Record
                    </span>
                    <div
                      className={`p-3 rounded-2xl border space-y-2 text-[11.5px] ${
                        isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Lead ID</span>
                        <span className="font-mono">{activeFollowUp.leadId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Phone</span>
                        <span className="font-mono">{activeFollowUp.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Email</span>
                        <span>{activeFollowUp.email || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Course</span>
                        <span className="font-medium">{activeFollowUp.course}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Notes */}
                {inspectorTab === "Notes" && (
                  <div className="space-y-3">
                    <textarea
                      rows={4}
                      defaultValue={activeFollowUp.notes}
                      placeholder="Add internal notes for this follow-up..."
                      className={`w-full p-3 rounded-2xl border text-[12px] outline-none transition-all ${
                        isDark
                          ? "bg-[#06080e] border-white/10 text-white focus:border-white/25 placeholder:text-neutral-600"
                          : "bg-white border-slate-200 text-slate-900 focus:border-slate-400 placeholder:text-slate-400"
                      }`}
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => showToast("Note updated successfully.")}
                      className={`w-full py-2 rounded-full text-[12px] font-medium transition-all cursor-pointer ${
                        isDark ? "bg-white text-black font-semibold" : "bg-slate-900 text-white font-semibold"
                      }`}
                    >
                      Save Internal Note
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ==================================================================== */}
      {/* 4. MODAL: "CREATE FOLLOW-UP"                                         */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl relative ${
                isDark ? "bg-[#090C12] border-white/15 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute top-4.5 right-4.5 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                  <Plus className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-[15.5px] font-semibold tracking-tight">Schedule New Follow-up</h3>
                  <p className="text-[12px] text-neutral-400">
                    Assign a lead task to your admissions pipeline
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                    Lead Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formLeadName}
                    onChange={(e) => setFormLeadName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full h-10 px-3.5 rounded-xl border text-[13px] outline-none ${
                      isDark
                        ? "bg-[#06080e] border-white/15 text-white focus:border-white/40"
                        : "bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-500"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                      Channel Type
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as FollowUpType)}
                      className={`w-full h-10 px-3 rounded-xl border text-[12.5px] outline-none cursor-pointer ${
                        isDark ? "bg-[#06080e] border-white/15 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
                    >
                      <option value="Call">Call</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Email">Email</option>
                      <option value="SMS">SMS</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                      Assigned To
                    </label>
                    <select
                      value={formStaff}
                      onChange={(e) => setFormStaff(e.target.value)}
                      className={`w-full h-10 px-3 rounded-xl border text-[12.5px] outline-none cursor-pointer ${
                        isDark ? "bg-[#06080e] border-white/15 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
                    >
                      <option value="Amit">Amit Kumar</option>
                      <option value="Neha">Neha Sharma</option>
                      <option value="Rohan">Rohan Varma</option>
                      <option value="Ishita">Ishita Roy</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="e.g. Today, 3:00 PM"
                    className={`w-full h-10 px-3.5 rounded-xl border text-[13px] outline-none font-mono ${
                      isDark
                        ? "bg-[#06080e] border-white/15 text-white focus:border-white/40"
                        : "bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-500"
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                    Reason / Objective
                  </label>
                  <textarea
                    rows={2}
                    value={formReason}
                    onChange={(e) => setFormReason(e.target.value)}
                    placeholder="e.g. Discuss course fees and schedule campus walkthrough..."
                    className={`w-full p-3 rounded-xl border text-[12px] outline-none ${
                      isDark
                        ? "bg-[#06080e] border-white/15 text-white focus:border-white/40"
                        : "bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-500"
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className={`flex-1 h-9.5 rounded-full text-[12px] font-medium border cursor-pointer ${
                      isDark
                        ? "border-white/10 text-neutral-300 hover:bg-white/5"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 h-9.5 rounded-full text-[12px] font-medium cursor-pointer shadow-md flex items-center justify-center gap-1.5 ${
                      isDark ? "bg-white text-black font-semibold" : "bg-[#0B0F17] text-white font-semibold"
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Task</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
