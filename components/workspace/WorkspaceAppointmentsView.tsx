"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Phone,
  Users,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Sparkles,
  ArrowRight,
  Check,
  ExternalLink,
  ShieldCheck,
  FileText,
  Edit3,
  Share2,
  X,
  UserCheck,
  MapPin,
  CalendarDays,
  Send,
  Zap,
  TrendingUp,
  LayoutGrid,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

// ============================================================================
// TYPES & DATA CONTRACTS
// ============================================================================

export type AppointmentCategory =
  | "Counselling"
  | "Admission"
  | "Follow-up"
  | "Course Enquiry"
  | "Other";

export type AppointmentStatusType = "Confirmed" | "Pending" | "Cancelled";

export interface AppointmentSlotItem {
  id: string;
  clientName: string;
  clientInitials: string;
  clientPhone: string;
  clientEmail: string;
  category: AppointmentCategory;
  categoryDetail: string;
  staffId: "siddharth" | "neha" | "amit" | "rohan";
  staffName: string;
  startTime: string; // "10:00"
  endTime: string; // "10:30"
  timeDisplay: string; // "10:00 - 10:30"
  startHour: number; // 10
  startMinutes: number; // 0
  durationMinutes: number; // 30 or 60
  status: AppointmentStatusType;
  isVideoCall?: boolean;
  videoLink?: string;
  notes?: string;
}

export interface StaffMember {
  id: "siddharth" | "neha" | "amit" | "rohan";
  name: string;
  shortName: string;
  role: string;
  sessionsCount: number;
  initials: string;
  gradient: string;
  accentColor: string;
  dotColor: string;
}

// 4 Core Counselors with uniform naming and luxury vector gradients
const STAFF_MEMBERS: StaffMember[] = [
  {
    id: "siddharth",
    name: "Siddharth Malhotra",
    shortName: "Siddharth",
    role: "Lead Counsellor",
    sessionsCount: 3,
    initials: "SM",
    gradient: "from-sky-500 to-blue-600",
    accentColor: "#38bdf8",
    dotColor: "bg-sky-400",
  },
  {
    id: "neha",
    name: "Neha Sharma",
    shortName: "Neha",
    role: "Senior Counsellor",
    sessionsCount: 3,
    initials: "NS",
    gradient: "from-purple-500 to-indigo-600",
    accentColor: "#c084fc",
    dotColor: "bg-purple-400",
  },
  {
    id: "amit",
    name: "Amit Kumar",
    shortName: "Amit",
    role: "Associate Counsellor",
    sessionsCount: 4,
    initials: "AK",
    gradient: "from-amber-500 to-orange-600",
    accentColor: "#fbbf24",
    dotColor: "bg-amber-400",
  },
  {
    id: "rohan",
    name: "Rohan Verma",
    shortName: "Rohan",
    role: "Admissions Lead",
    sessionsCount: 1,
    initials: "RV",
    gradient: "from-emerald-500 to-teal-600",
    accentColor: "#34d399",
    dotColor: "bg-emerald-400",
  },
];

// Reference appointments from the design
const INITIAL_APPOINTMENTS: AppointmentSlotItem[] = [
  // Column 1: Siddharth (SM)
  {
    id: "apt-1",
    clientName: "Rahul Sharma",
    clientInitials: "RS",
    clientPhone: "+91 98765 43210",
    clientEmail: "rahul.sharma@example.com",
    category: "Course Enquiry",
    categoryDetail: "Course Enquiry",
    staffId: "siddharth",
    staffName: "Siddharth Malhotra",
    startTime: "10:00",
    endTime: "11:00",
    timeDisplay: "10:00 - 11:00",
    startHour: 10,
    startMinutes: 0,
    durationMinutes: 60,
    status: "Confirmed",
    isVideoCall: false,
    notes: "Executive weekend AI track inquiry. Reviewing syllabus and placement stats.",
  },
  {
    id: "apt-2",
    clientName: "Sneha Iyer",
    clientInitials: "SI",
    clientPhone: "+91 99887 66554",
    clientEmail: "sneha.iyer@example.com",
    category: "Follow-up",
    categoryDetail: "Scholarship Review",
    staffId: "siddharth",
    staffName: "Siddharth Malhotra",
    startTime: "11:00",
    endTime: "12:00",
    timeDisplay: "11:00 - 12:00",
    startHour: 11,
    startMinutes: 0,
    durationMinutes: 60,
    status: "Pending",
    isVideoCall: false,
    notes: "Reviewing scholarship options. Requested financial counselor callback.",
  },
  {
    id: "apt-3",
    clientName: "Riya Singh",
    clientInitials: "RS",
    clientPhone: "+91 77665 44332",
    clientEmail: "riya.singh@example.com",
    category: "Admission",
    categoryDetail: "Fee Discussion",
    staffId: "siddharth",
    staffName: "Siddharth Malhotra",
    startTime: "13:00",
    endTime: "14:00",
    timeDisplay: "1:00 - 2:00",
    startHour: 13,
    startMinutes: 0,
    durationMinutes: 60,
    status: "Confirmed",
    isVideoCall: false,
    notes: "Final fee verification and payment gateway approval.",
  },

  // Column 2: Neha Sharma (NS)
  {
    id: "apt-4",
    clientName: "Priya Mehta",
    clientInitials: "PM",
    clientPhone: "+91 98765 12345",
    clientEmail: "priya.mehta@example.com",
    category: "Admission",
    categoryDetail: "Admission Discussion",
    staffId: "neha",
    staffName: "Neha Sharma",
    startTime: "10:00",
    endTime: "11:00",
    timeDisplay: "10:00 - 11:00",
    startHour: 10,
    startMinutes: 0,
    durationMinutes: 60,
    status: "Pending",
    isVideoCall: true,
    videoLink: "https://meet.google.com/may-crm-pm",
    notes: "Virtual consultation on UI/UX Architecture track. Portfolio evaluation scheduled.",
  },
  {
    id: "apt-5",
    clientName: "Meera Joshi",
    clientInitials: "MJ",
    clientPhone: "+91 99881 22334",
    clientEmail: "meera.joshi@example.com",
    category: "Course Enquiry",
    categoryDetail: "Course Enquiry",
    staffId: "neha",
    staffName: "Neha Sharma",
    startTime: "14:00",
    endTime: "15:00",
    timeDisplay: "2:00 - 3:00",
    startHour: 14,
    startMinutes: 0,
    durationMinutes: 60,
    status: "Confirmed",
    isVideoCall: false,
    notes: "Product Manager looking for AI transformation and LLM orchestration mastery.",
  },
  {
    id: "apt-6",
    clientName: "Follow-up Calls",
    clientInitials: "FC",
    clientPhone: "+91 98000 00000",
    clientEmail: "admissions@mayabusiness.ai",
    category: "Other",
    categoryDetail: "Batch Outreach",
    staffId: "neha",
    staffName: "Neha Sharma",
    startTime: "17:00",
    endTime: "18:00",
    timeDisplay: "5:00 - 6:00",
    startHour: 17,
    startMinutes: 0,
    durationMinutes: 60,
    status: "Confirmed",
    isVideoCall: false,
    notes: "Daily outbound sync with pending inquiries from weekend marketing campaign.",
  },

  // Column 3: Amit Kumar (AK)
  {
    id: "apt-7",
    clientName: "Arjun Patel",
    clientInitials: "AP",
    clientPhone: "+91 91234 56789",
    clientEmail: "arjun.patel@example.com",
    category: "Counselling",
    categoryDetail: "Career Counselling",
    staffId: "amit",
    staffName: "Amit Kumar",
    startTime: "10:00",
    endTime: "11:00",
    timeDisplay: "10:00 - 11:00",
    startHour: 10,
    startMinutes: 0,
    durationMinutes: 60,
    status: "Confirmed",
    isVideoCall: false,
    notes: "1-on-1 intensive career roadmapping. Transitioning from QA automation to Full Stack AI.",
  },
  {
    id: "apt-8",
    clientName: "Aditya Nair",
    clientInitials: "AN",
    clientPhone: "+91 88774 22110",
    clientEmail: "aditya.nair@example.com",
    category: "Counselling",
    categoryDetail: "Career Counselling",
    staffId: "amit",
    staffName: "Amit Kumar",
    startTime: "12:00",
    endTime: "13:00",
    timeDisplay: "12:00 - 1:00",
    startHour: 12,
    startMinutes: 0,
    durationMinutes: 60,
    status: "Confirmed",
    isVideoCall: false,
    notes: "Python enterprise engineering review. Semester credit transfer inquiry.",
  },
  {
    id: "apt-9",
    clientName: "Vikram Rao",
    clientInitials: "VR",
    clientPhone: "+91 98112 33445",
    clientEmail: "vikram.rao@example.com",
    category: "Admission",
    categoryDetail: "Admission",
    staffId: "amit",
    staffName: "Amit Kumar",
    startTime: "15:00",
    endTime: "16:00",
    timeDisplay: "3:00 - 4:00",
    startHour: 15,
    startMinutes: 0,
    durationMinutes: 60,
    status: "Pending",
    isVideoCall: false,
    notes: "Corporate sponsorship seat booking. Company approval letter provided.",
  },
  {
    id: "apt-10",
    clientName: "Ananya Gupta",
    clientInitials: "AG",
    clientPhone: "+91 99223 34455",
    clientEmail: "ananya.gupta@example.com",
    category: "Admission",
    categoryDetail: "Scholarship Discussion",
    staffId: "amit",
    staffName: "Amit Kumar",
    startTime: "16:00",
    endTime: "17:00",
    timeDisplay: "4:00 - 5:00",
    startHour: 16,
    startMinutes: 0,
    durationMinutes: 60,
    status: "Confirmed",
    isVideoCall: true,
    videoLink: "https://meet.google.com/may-scholarship-ag",
    notes: "Merit-based women in tech scholarship interview. Academic transcripts reviewed.",
  },

  // Column 4: Rohan Verma (RV)
  {
    id: "apt-11",
    clientName: "Karan Verma",
    clientInitials: "KV",
    clientPhone: "+91 88776 55443",
    clientEmail: "karan.verma@example.com",
    category: "Course Enquiry",
    categoryDetail: "Course Enquiry",
    staffId: "rohan",
    staffName: "Rohan Verma",
    startTime: "11:00",
    endTime: "12:00",
    timeDisplay: "11:00 - 12:00",
    startHour: 11,
    startMinutes: 0,
    durationMinutes: 60,
    status: "Confirmed",
    isVideoCall: false,
    notes: "Cloud DevOps certification curriculum inquiry. AWS and Docker lab access.",
  },
];

// 4 High-Signal Executive KPI Cards
interface ExecutiveKPI {
  id: string;
  label: string;
  value: number;
  changePct: number;
  isPositive: boolean;
  timeframe: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const EXECUTIVE_KPIS: ExecutiveKPI[] = [
  {
    id: "today",
    label: "TODAY'S SCHEDULE",
    value: 8,
    changePct: 33,
    isPositive: true,
    timeframe: "vs yesterday",
    icon: CalendarDays,
    accentColor: "text-sky-400",
  },
  {
    id: "confirmed",
    label: "CONFIRMED SESSIONS",
    value: 18,
    changePct: 20,
    isPositive: true,
    timeframe: "vs last week",
    icon: ShieldCheck,
    accentColor: "text-emerald-400",
  },
  {
    id: "pending",
    label: "PENDING CONFIRMATION",
    value: 6,
    changePct: 25,
    isPositive: false,
    timeframe: "awaiting action",
    icon: Clock,
    accentColor: "text-amber-400",
  },
  {
    id: "weekly-total",
    label: "THIS WEEK TOTAL",
    value: 42,
    changePct: 18,
    isPositive: true,
    timeframe: "vs last week",
    icon: TrendingUp,
    accentColor: "text-violet-400",
  },
];

// Hours on the grid: 9:00 AM to 6:00 PM
const HOURS_SERIES = [
  { hour: 9, label: "09:00" },
  { hour: 10, label: "10:00" },
  { hour: 11, label: "11:00" },
  { hour: 12, label: "12:00" },
  { hour: 13, label: "13:00" },
  { hour: 14, label: "14:00" },
  { hour: 15, label: "15:00" },
  { hour: 16, label: "16:00" },
  { hour: 17, label: "17:00" },
  { hour: 18, label: "18:00" },
];

const HOUR_ROW_HEIGHT = 80; // 80px per hour -> 40px per 30-min slot for pristine spacing

// Smooth Quartic-out Animated Counter
function AnimatedCounter({
  value,
  duration = 0.7,
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

    const timeoutId = setTimeout(() => {
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

// Minimalist, Non-Breaking Staff Avatar Component
export function StaffAvatar({
  staff,
  size = "md",
  showStatusDot = true,
}: {
  staff: StaffMember;
  size?: "xs" | "sm" | "md" | "lg";
  showStatusDot?: boolean;
}) {
  const sizeMap = {
    xs: "w-5 h-5 text-[8.5px]",
    sm: "w-6 h-6 text-[9.5px]",
    md: "w-7.5 h-7.5 text-[11px]",
    lg: "w-9 h-9 text-[12.5px]",
  };

  return (
    <div className="relative shrink-0 select-none">
      <div
        className={`${sizeMap[size]} rounded-full bg-gradient-to-tr ${staff.gradient} text-white font-semibold flex items-center justify-center shadow-xs border border-white/20`}
      >
        {staff.initials}
      </div>
      {showStatusDot && (
        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1.5 ring-[#090D16]" />
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT: DISCIPLINED, CLEAN & STRUCTURED UNICORN UX
// ============================================================================

export default function WorkspaceAppointmentsView() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // State Management
  const [appointments, setAppointments] = useState<AppointmentSlotItem[]>(INITIAL_APPOINTMENTS);
  const [viewMode, setViewMode] = useState<"Day" | "Week" | "Agenda">("Day");
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateIndex, setDateIndex] = useState(0); // 0 = 22 Sep 2025

  // Status Dropdown Popover State
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Right Rail Executive Managed Tab State
  const [railTab, setRailTab] = useState<"ALL" | "UPCOMING" | "COPILOT" | "CONSULTANTS">("ALL");

  // Inspector & Modal State
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formClientName, setFormClientName] = useState("");
  const [formClientPhone, setFormClientPhone] = useState("");
  const [formClientEmail, setFormClientEmail] = useState("");
  const [formCategory, setFormCategory] = useState<AppointmentCategory>("Course Enquiry");
  const [formStaffId, setFormStaffId] = useState<"siddharth" | "neha" | "amit" | "rohan">("siddharth");
  const [formTimeSlot, setFormTimeSlot] = useState("10:00");
  const [formDuration, setFormDuration] = useState(60);
  const [formIsVideo, setFormIsVideo] = useState(false);
  const [formNotes, setFormNotes] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2600);
  };

  // Selected appointment item for drawer
  const activeAppointment = useMemo(() => {
    return appointments.find((a) => a.id === selectedAppointmentId) || null;
  }, [appointments, selectedAppointmentId]);

  // Current Date display with smooth cycle
  const dateDates = [
    { day: "Monday", date: "22 Sep 2025" },
    { day: "Tuesday", date: "23 Sep 2025" },
    { day: "Wednesday", date: "24 Sep 2025" },
    { day: "Thursday", date: "25 Sep 2025" },
    { day: "Friday", date: "26 Sep 2025" },
  ];
  const currentDate = dateDates[(dateIndex % dateDates.length + dateDates.length) % dateDates.length];

  // Active counselors to display in grid (filtered if single staff selected)
  const displayedStaff = useMemo(() => {
    if (selectedStaffFilter === "ALL") return STAFF_MEMBERS;
    return STAFF_MEMBERS.filter((s) => s.id === selectedStaffFilter);
  }, [selectedStaffFilter]);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        apt.clientName.toLowerCase().includes(q) ||
        apt.staffName.toLowerCase().includes(q) ||
        apt.categoryDetail.toLowerCase().includes(q);

      const matchesStaff = selectedStaffFilter === "ALL" || apt.staffId === selectedStaffFilter;
      const matchesStatus = selectedStatusFilter === "ALL" || apt.status === selectedStatusFilter;
      const matchesCategory = selectedCategoryFilter === "ALL" || apt.category === selectedCategoryFilter;

      return matchesSearch && matchesStaff && matchesStatus && matchesCategory;
    });
  }, [appointments, searchQuery, selectedStaffFilter, selectedStatusFilter, selectedCategoryFilter]);

  // Live status counts for popover
  const confirmedCount = useMemo(() => appointments.filter((a) => a.status === "Confirmed").length, [appointments]);
  const pendingCount = useMemo(() => appointments.filter((a) => a.status === "Pending").length, [appointments]);

  // Open slots check for MAYA Copilot (Full hour blocks)
  const slot1Open = !appointments.some((a) => a.startTime === "15:00" && a.staffId === "neha");
  const slot2Open = !appointments.some((a) => a.startTime === "14:00" && a.staffId === "rohan");
  const openSlotsCount = (slot1Open ? 1 : 0) + (slot2Open ? 1 : 0);

  // Consultant workload capacity calculation
  const staffWorkload = useMemo(() => {
    return STAFF_MEMBERS.map((staff) => {
      const staffApts = appointments.filter((a) => a.staffId === staff.id);
      const capacity = 5;
      const pct = Math.min(Math.round((staffApts.length / capacity) * 100), 100);
      return {
        staff,
        count: staffApts.length,
        capacity,
        pct,
      };
    });
  }, [appointments]);

  // Luxury Obsidian Event Card Theming (Structured, Consistent, Unified Base)
  const getEventCardDesign = (category: AppointmentCategory, categoryDetail: string) => {
    if (categoryDetail.includes("Fee") || categoryDetail.includes("Scholarship") || category === "Admission") {
      return {
        accentBorder: "border-l-sky-400",
        bg: isDark ? "bg-[#0d1422] hover:bg-[#121c2e] border-white/[0.08] hover:border-white/20" : "bg-sky-50/90 hover:bg-sky-100/90 border-sky-200",
        textPrimary: isDark ? "text-white" : "text-sky-950",
        textSecondary: isDark ? "text-neutral-400" : "text-sky-700",
        timeColor: isDark ? "text-sky-400" : "text-sky-700",
        iconColor: isDark ? "text-sky-400" : "text-sky-600",
      };
    }
    if (category === "Course Enquiry") {
      return {
        accentBorder: "border-l-emerald-400",
        bg: isDark ? "bg-[#0d1422] hover:bg-[#121c2e] border-white/[0.08] hover:border-white/20" : "bg-emerald-50/90 hover:bg-emerald-100/90 border-emerald-200",
        textPrimary: isDark ? "text-white" : "text-emerald-950",
        textSecondary: isDark ? "text-neutral-400" : "text-emerald-700",
        timeColor: isDark ? "text-emerald-400" : "text-emerald-700",
        iconColor: isDark ? "text-emerald-400" : "text-emerald-600",
      };
    }
    if (category === "Follow-up") {
      return {
        accentBorder: "border-l-amber-400",
        bg: isDark ? "bg-[#0d1422] hover:bg-[#121c2e] border-white/[0.08] hover:border-white/20" : "bg-amber-50/90 hover:bg-amber-100/90 border-amber-200",
        textPrimary: isDark ? "text-white" : "text-amber-950",
        textSecondary: isDark ? "text-neutral-400" : "text-amber-700",
        timeColor: isDark ? "text-amber-400" : "text-amber-700",
        iconColor: isDark ? "text-amber-400" : "text-amber-600",
      };
    }
    if (category === "Counselling") {
      return {
        accentBorder: "border-l-violet-400",
        bg: isDark ? "bg-[#0d1422] hover:bg-[#121c2e] border-white/[0.08] hover:border-white/20" : "bg-violet-50/90 hover:bg-violet-100/90 border-violet-200",
        textPrimary: isDark ? "text-white" : "text-violet-950",
        textSecondary: isDark ? "text-neutral-400" : "text-violet-700",
        timeColor: isDark ? "text-violet-400" : "text-violet-700",
        iconColor: isDark ? "text-violet-400" : "text-violet-600",
      };
    }
    return {
      accentBorder: "border-l-slate-400",
      bg: isDark ? "bg-[#0d1422] hover:bg-[#121c2e] border-white/[0.08] hover:border-white/20" : "bg-slate-50 hover:bg-slate-100 border-slate-200",
      textPrimary: isDark ? "text-white" : "text-slate-900",
      textSecondary: isDark ? "text-neutral-400" : "text-slate-600",
      timeColor: isDark ? "text-slate-300" : "text-slate-700",
      iconColor: isDark ? "text-slate-400" : "text-slate-600",
    };
  };

  // Status Pill component
  const renderStatusPill = (status: AppointmentStatusType) => {
    switch (status) {
      case "Confirmed":
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-medium tracking-wide uppercase border select-none ${
              isDark
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-400/25 shadow-[0_0_8px_-2px_rgba(52,211,153,0.3)]"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span>Confirmed</span>
          </span>
        );
      case "Pending":
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-medium tracking-wide uppercase border select-none ${
              isDark
                ? "bg-amber-500/10 text-amber-300 border-amber-400/25 shadow-[0_0_8px_-2px_rgba(251,191,36,0.3)]"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            <span>Pending</span>
          </span>
        );
      case "Cancelled":
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-medium tracking-wide uppercase border select-none ${
              isDark
                ? "bg-rose-500/10 text-rose-300 border-rose-500/25"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
            <span>Cancelled</span>
          </span>
        );
    }
  };

  // Handle New Appointment submit
  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientName.trim()) return;

    const initials = formClientName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const [h, m] = formTimeSlot.split(":").map(Number);
    const endMinutesTotal = h * 60 + m + formDuration;
    const endH = Math.floor(endMinutesTotal / 60);
    const endM = endMinutesTotal % 60;
    const endStr = `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
    const staffObj = STAFF_MEMBERS.find((s) => s.id === formStaffId);

    const newApt: AppointmentSlotItem = {
      id: `apt-${Date.now()}`,
      clientName: formClientName.trim(),
      clientInitials: initials || "AP",
      clientPhone: formClientPhone.trim() || "+91 98765 00000",
      clientEmail: formClientEmail.trim() || `${formClientName.toLowerCase().replace(/\s+/g, "")}@example.com`,
      category: formCategory,
      categoryDetail: formCategory === "Admission" ? "Admission Discussion" : formCategory,
      staffId: formStaffId,
      staffName: staffObj ? staffObj.name : "Siddharth Malhotra",
      startTime: formTimeSlot,
      endTime: endStr,
      timeDisplay: `${formTimeSlot} - ${endStr}`,
      startHour: h,
      startMinutes: m,
      durationMinutes: formDuration,
      status: "Confirmed",
      isVideoCall: formIsVideo,
      videoLink: formIsVideo ? `https://meet.google.com/may-${Date.now().toString().slice(-6)}` : undefined,
      notes: formNotes.trim() || "Scheduled via front-desk calendar.",
    };

    setAppointments((prev) => [newApt, ...prev]);
    setIsAddModalOpen(false);
    setSelectedAppointmentId(newApt.id);
    showToast(`Appointment scheduled for ${newApt.clientName}`);

    // Reset Form
    setFormClientName("");
    setFormClientPhone("");
    setFormClientEmail("");
    setFormNotes("");
  };

  // Quick Open Modal with prefilled slot from grid
  const handleEmptyCellClick = (staffId: "siddharth" | "neha" | "amit" | "rohan", hour: number) => {
    setFormStaffId(staffId);
    setFormTimeSlot(`${hour.toString().padStart(2, "0")}:00`);
    setIsAddModalOpen(true);
  };

  // Next up queue for sidebar (disciplined queue of priority consultations)
  const nextUpConsultations = useMemo(() => {
    return filteredAppointments.slice(0, 4);
  }, [filteredAppointments]);

  // MAYA Copilot Smart Auto-Dispatch Handler (Standard 1-Hour Consultation Blocks)
  const handleAutoFillSlots = () => {
    const slot1Exists = appointments.some((a) => a.startTime === "15:00" && a.staffId === "neha");
    const slot2Exists = appointments.some((a) => a.startTime === "14:00" && a.staffId === "rohan");

    if (slot1Exists && slot2Exists) {
      showToast("MAYA Copilot: All open afternoon slots are fully optimized.");
      return;
    }

    const newSlots: AppointmentSlotItem[] = [];

    if (!slot1Exists) {
      newSlots.push({
        id: `apt-copilot-1`,
        clientName: "Kavita Sen",
        clientInitials: "KS",
        clientPhone: "+91 99112 44332",
        clientEmail: "kavita.sen@example.com",
        category: "Admission",
        categoryDetail: "Admission Discussion",
        staffId: "neha",
        staffName: "Neha Sharma",
        startTime: "15:00",
        endTime: "16:00",
        timeDisplay: "3:00 - 4:00",
        startHour: 15,
        startMinutes: 0,
        durationMinutes: 60,
        status: "Confirmed",
        isVideoCall: true,
        videoLink: "https://meet.google.com/may-ks-admission",
        notes: "Auto-dispatched by MAYA Copilot from priority waitlist. Full fee verification approved.",
      });
    }

    if (!slot2Exists) {
      newSlots.push({
        id: `apt-copilot-2`,
        clientName: "Dev Sharma",
        clientInitials: "DS",
        clientPhone: "+91 98223 55667",
        clientEmail: "dev.sharma@example.com",
        category: "Course Enquiry",
        categoryDetail: "Course Enquiry",
        staffId: "rohan",
        staffName: "Rohan Verma",
        startTime: "14:00",
        endTime: "15:00",
        timeDisplay: "2:00 - 3:00",
        startHour: 14,
        startMinutes: 0,
        durationMinutes: 60,
        status: "Confirmed",
        isVideoCall: false,
        notes: "Auto-dispatched by MAYA Copilot. Enterprise AI certification track inquiry.",
      });
    }

    setAppointments((prev) => [...newSlots, ...prev]);
    showToast("MAYA: 2 open consultation slots auto-assigned to waiting prospects.");
  };

  return (
    <div className="flex-1 min-w-0 h-full flex flex-col justify-between gap-3 overflow-hidden select-none">
      {/* ==================================================================== */}
      {/* 1. ARCHITECTURAL UNICORN HEADER */}
      {/* ==================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <h1
              className={`text-[23px] sm:text-[25px] font-light tracking-[-0.03em] leading-tight ${
                isDark ? "text-white" : "text-[#0B0F17]"
              }`}
            >
              Appointments
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                isDark
                  ? "bg-sky-500/10 text-sky-400 border-sky-400/25"
                  : "bg-sky-50 text-sky-700 border-sky-200"
              }`}
            >
              8 Scheduled Today
            </span>
          </div>
          <p
            className={`text-[12.5px] sm:text-[13px] font-normal leading-normal mt-1 ${
              isDark ? "text-[#9ca3af]" : "text-[#64748B]"
            }`}
          >
            Multi-counsellor dispatch, room timetable & automated scheduling copilot.
          </p>
        </div>

        {/* Unified Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Calendar Day Cycler */}
          <div
            className={`flex items-center h-8.5 px-3 rounded-full border text-[11.5px] font-medium transition-all ${
              isDark
                ? "bg-[#0c101a] border-white/10 text-white"
                : "bg-white border-slate-200 text-slate-800 shadow-2xs"
            }`}
          >
            <button
              type="button"
              onClick={() => setDateIndex((i) => i - 1)}
              className="p-1 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
              aria-label="Previous Day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] font-semibold whitespace-nowrap">
              {currentDate.day}, {currentDate.date}
            </span>
            <button
              type="button"
              onClick={() => setDateIndex((i) => i + 1)}
              className="p-1 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
              aria-label="Next Day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Search */}
          <div
            className={`flex items-center h-8.5 px-3 rounded-full border text-[11.5px] transition-all max-w-[200px] ${
              isDark
                ? "bg-[#0c101a] border-white/10 text-white focus-within:border-white/25 focus-within:bg-[#111724]"
                : "bg-white border-slate-200 text-slate-800 focus-within:border-slate-800 shadow-2xs"
            }`}
          >
            <Search className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-neutral-400" : "text-slate-400"}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search schedule..."
              className="w-full ml-2 bg-transparent outline-none text-[11.5px] placeholder:text-neutral-500 font-normal"
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

          {/* "+ New" Action Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsAddModalOpen(true)}
            className={`h-8.5 px-3.5 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              isDark
                ? "bg-white text-black hover:bg-neutral-100 shadow-[0_0_14px_rgba(255,255,255,0.12)]"
                : "bg-[#0B0F17] text-white hover:bg-slate-800"
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>New Appointment</span>
          </motion.button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. STREAMLINED 4-CARD EXECUTIVE KPI STRIP */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 shrink-0 select-none">
        {EXECUTIVE_KPIS.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -2, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
              className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-default select-none ${
                isDark
                  ? "bg-gradient-to-b from-[#111724]/95 via-[#0c101a]/95 to-[#080b12]/98 border-white/[0.09] hover:border-white/[0.2] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_24px_-6px_rgba(0,0,0,0.55)]"
                  : "bg-gradient-to-b from-white via-white to-[#F8FAFC] border-slate-200/90 hover:border-slate-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_4px_16px_rgba(15,23,42,0.05)]"
              }`}
            >
              {/* Eyebrow Label + Delicate Icon */}
              <div className="flex items-center justify-between gap-2 relative z-10">
                <span
                  className={`text-[9px] sm:text-[9.5px] font-medium uppercase tracking-[0.16em] truncate transition-colors duration-200 ${
                    isDark ? "text-[#8e95a5] group-hover:text-white" : "text-slate-500 group-hover:text-slate-900"
                  }`}
                >
                  {kpi.label}
                </span>
                <Icon className={`w-3.5 h-3.5 shrink-0 stroke-[1.4] transition-colors duration-200 ${isDark ? "text-[#717682] group-hover:text-white" : "text-slate-400 group-hover:text-slate-700"}`} />
              </div>

              {/* Big Clean Numeral */}
              <div className="my-2 sm:my-2.5 flex items-baseline justify-between gap-2 relative z-10">
                <span
                  className={`text-[28px] sm:text-[32px] font-light tracking-[-0.03em] leading-none tabular-nums shrink-0 ${
                    isDark ? "text-white" : "text-[#0B0F17]"
                  }`}
                >
                  <AnimatedCounter value={kpi.value} delay={idx * 0.05} />
                </span>
              </div>

              {/* Bottom Row: Minimalist Editorial Trend Context with Luxury Gold */}
              <div className="flex items-center gap-1.5 text-[10.5px] sm:text-[11.5px] tracking-tight relative z-10 truncate">
                <span
                  className={`font-medium shrink-0 ${
                    kpi.isPositive
                      ? isDark
                        ? "text-[#fbbf24]"
                        : "text-[#d97706]"
                      : isDark
                      ? "text-rose-400"
                      : "text-rose-600"
                  }`}
                >
                  {kpi.isPositive ? "↑" : "↓"} {kpi.changePct}%
                </span>

                <span className={`shrink-0 ${isDark ? "text-white/20" : "text-slate-300"}`}>·</span>

                <span
                  className={`truncate ${
                    isDark ? "text-[#717682]" : "text-slate-500"
                  }`}
                >
                  {kpi.timeframe}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* 3. SIMPLIFIED & STRUCTURED STAFF CONTROL DOCK */}
      {/* ==================================================================== */}
      <div
        className={`p-1.5 px-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shrink-0 ${
          isDark
            ? "bg-[#0b0f19] border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            : "bg-white border-slate-200/90 shadow-2xs"
        }`}
      >
        {/* Left: Staff Segmented Switcher */}
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] uppercase font-semibold tracking-wider mr-1 select-none ${isDark ? "text-neutral-500" : "text-slate-400"}`}>
            View:
          </span>
          {/* All Staff Master Switch */}
          <button
            type="button"
            onClick={() => setSelectedStaffFilter("ALL")}
            className={`h-7.5 px-3.5 rounded-full text-[11.5px] font-medium transition-all cursor-pointer flex items-center gap-2 ${
              selectedStaffFilter === "ALL"
                ? isDark
                  ? "bg-white text-black font-semibold shadow-xs"
                  : "bg-[#0B0F17] text-white font-semibold"
                : isDark
                ? "bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>All Staff</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                selectedStaffFilter === "ALL"
                  ? isDark
                    ? "bg-black/15 text-black"
                    : "bg-white/20 text-white"
                  : isDark
                  ? "bg-white/10 text-neutral-300"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              4
            </span>
          </button>

          {/* Individual Counselor Focus Pills */}
          {STAFF_MEMBERS.map((staff) => {
            const isSelected = selectedStaffFilter === staff.id;
            return (
              <button
                key={staff.id}
                type="button"
                onClick={() => setSelectedStaffFilter(staff.id)}
                className={`h-7.5 px-3 rounded-full text-[11.5px] font-medium flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? isDark
                      ? "bg-white text-black font-semibold shadow-xs"
                      : "bg-[#0B0F17] text-white font-semibold"
                    : isDark
                    ? "bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSelected ? "bg-black" : staff.dotColor
                  }`}
                />
                <span>{staff.shortName}</span>
                <span
                  className={`text-[10px] font-mono ${
                    isSelected
                      ? isDark
                        ? "text-black/70"
                        : "text-white/70"
                      : isDark
                      ? "text-neutral-500"
                      : "text-slate-400"
                  }`}
                >
                  {staff.sessionsCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: View Mode Toggle, Status Filter & Quick Consultancy Button */}
        <div className="flex items-center gap-2">
          {/* Prominent Consultancy Filter Button */}
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter((prev) => (prev === "Counselling" ? "ALL" : "Counselling"))}
            className={`h-7.5 px-3 rounded-full text-[11px] font-medium border flex items-center gap-1.5 cursor-pointer transition-all duration-200 outline-none select-none ${
              selectedCategoryFilter === "Counselling"
                ? isDark
                  ? "bg-violet-500/25 border-violet-400/50 text-white shadow-[0_0_12px_rgba(167,139,250,0.35)] font-semibold"
                  : "bg-violet-600 border-violet-600 text-white font-semibold shadow-xs"
                : isDark
                ? "bg-[#090d16] border-white/10 hover:border-violet-400/40 text-neutral-300 hover:text-white"
                : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                selectedCategoryFilter === "Counselling"
                  ? isDark ? "bg-violet-300 shadow-[0_0_6px_rgba(167,139,250,0.8)]" : "bg-white"
                  : "bg-violet-400"
              }`}
            />
            <span>Consultancy</span>
            <span
              className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded-full leading-none shrink-0 ${
                selectedCategoryFilter === "Counselling"
                  ? isDark
                    ? "bg-violet-400/30 text-violet-200 font-bold"
                    : "bg-white/25 text-white font-bold"
                  : isDark
                  ? "bg-white/[0.06] text-neutral-400"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {appointments.filter((a) => a.category === "Counselling").length}
            </span>
          </button>

          {/* Luxury Custom Status Filter Popover */}
          <div className="relative" ref={statusDropdownRef}>
            <button
              type="button"
              onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
              className={`h-7.5 px-3 rounded-full text-[11px] font-medium border flex items-center gap-2 cursor-pointer transition-all duration-200 outline-none select-none ${
                isStatusDropdownOpen
                  ? isDark
                    ? "bg-white/[0.08] border-white/30 text-white shadow-xs"
                    : "bg-slate-100 border-slate-300 text-slate-900 shadow-xs"
                  : isDark
                  ? "bg-[#090d16] border-white/10 hover:border-white/25 text-neutral-300 hover:text-white"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  selectedStatusFilter === "Confirmed"
                    ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"
                    : selectedStatusFilter === "Pending"
                    ? "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                    : "bg-neutral-400"
                }`}
              />
              <span>{selectedStatusFilter === "ALL" ? "All Status" : selectedStatusFilter}</span>
              <ChevronDown
                className={`w-3 h-3 text-neutral-400 transition-transform duration-200 ${
                  isStatusDropdownOpen ? "rotate-180 text-white" : ""
                }`}
              />
            </button>

            {/* Floating Glassmorphic Menu */}
            <AnimatePresence>
              {isStatusDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className={`absolute right-0 top-full mt-1.5 w-44 rounded-2xl border p-1.5 z-50 shadow-2xl backdrop-blur-xl ${
                    isDark
                      ? "bg-[#0b101c]/95 border-white/[0.12] text-white shadow-[0_12px_32px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.1)]"
                      : "bg-white/95 border-slate-200 text-slate-900 shadow-xl"
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    {[
                      { id: "ALL", label: "All Status", dot: "bg-neutral-400", count: appointments.length },
                      { id: "Confirmed", label: "Confirmed", dot: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]", count: confirmedCount },
                      { id: "Pending", label: "Pending", dot: "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]", count: pendingCount },
                    ].map((opt) => {
                      const isSelected = selectedStatusFilter === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSelectedStatusFilter(opt.id);
                            setIsStatusDropdownOpen(false);
                          }}
                          className={`w-full px-2.5 py-1.5 rounded-xl flex items-center justify-between text-[11px] font-medium transition-colors cursor-pointer text-left ${
                            isSelected
                              ? isDark
                                ? "bg-white/10 text-white"
                                : "bg-slate-100 text-slate-900"
                              : isDark
                              ? "text-neutral-300 hover:bg-white/[0.04] hover:text-white"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${opt.dot} shrink-0`} />
                            <span>{opt.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-mono ${isDark ? "text-neutral-400" : "text-slate-400"}`}>
                              {opt.count}
                            </span>
                            {isSelected && <Check className="w-3 h-3 text-sky-400" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View Mode Toggle */}
          <div
            className={`h-7.5 flex items-center p-0.5 rounded-full border ${
              isDark ? "bg-[#070a10] border-white/10" : "bg-slate-100 border-slate-200"
            }`}
          >
            {(["Day", "Week", "Agenda"] as const).map((mode) => {
              const isActive = viewMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`relative h-full px-3 rounded-full text-[11px] font-medium transition-colors cursor-pointer outline-none flex items-center justify-center ${
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
                      layoutId="cal-view-tab"
                      className={`absolute inset-0 rounded-full ${isDark ? "bg-white" : "bg-[#0B0F17]"}`}
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{mode}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. MAIN WORKSPACE: SPACIOUS SCHEDULE CANVAS + DISCIPLINED RAIL */}
      {/* ==================================================================== */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3 overflow-hidden relative">
        {/* ================================================================== */}
        {/* 4A. PRIMARY CALENDAR STAGE */}
        {/* ================================================================== */}
        <div
          className={`flex-1 min-w-0 h-full rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden relative ${
            isDark
              ? "bg-[#080c14] border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_30px_rgba(0,0,0,0.6)]"
              : "bg-white border-slate-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_4px_20px_rgba(15,23,42,0.06)]"
          }`}
        >
          {viewMode === "Day" ? (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {/* Structured Staff Column Header Bar (Clean, Unified, Uniform) */}
              <div
                style={{
                  gridTemplateColumns: `56px repeat(${displayedStaff.length}, minmax(0, 1fr))`,
                }}
                className={`grid border-b shrink-0 z-20 select-none ${
                  isDark ? "border-white/[0.08] bg-[#0c101a]" : "border-slate-200/80 bg-slate-50"
                }`}
              >
                {/* Time label corner placeholder */}
                <div className="h-14 border-r border-transparent flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-neutral-500 opacity-60" />
                </div>

                {/* Clean, Uniform Staff Header Boxes */}
                {displayedStaff.map((staff) => (
                  <div
                    key={staff.id}
                    className={`h-14 px-3 flex items-center gap-2.5 border-l min-w-0 transition-colors ${
                      isDark ? "border-white/[0.06] hover:bg-white/[0.02]" : "border-slate-200/70 hover:bg-slate-100/50"
                    }`}
                  >
                    <StaffAvatar staff={staff} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className={`text-[12px] font-semibold truncate leading-tight ${isDark ? "text-white" : "text-[#0B0F17]"}`}>
                        {staff.name}
                      </div>
                      <div className={`text-[10.5px] truncate leading-tight mt-0.5 ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
                        {staff.role} <span className="opacity-40">•</span> <span className="font-mono text-neutral-300">{staff.sessionsCount} today</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scrollable Hours & Multi-Staff Slots Grid */}
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative">
                <div className="relative" style={{ height: `${HOURS_SERIES.length * HOUR_ROW_HEIGHT}px` }}>
                  {HOURS_SERIES.map((hObj) => (
                    <div
                      key={hObj.hour}
                      style={{
                        height: `${HOUR_ROW_HEIGHT}px`,
                        gridTemplateColumns: `56px repeat(${displayedStaff.length}, minmax(0, 1fr))`,
                      }}
                      className={`grid border-b relative ${
                        isDark ? "border-white/[0.04]" : "border-slate-200/60"
                      }`}
                    >
                      {/* Left Time Label (Positioned cleanly under the line, NEVER clipped!) */}
                      <div
                        className={`text-[10.5px] font-mono select-none px-2.5 pt-1.5 text-right font-medium ${
                          isDark ? "text-neutral-500" : "text-slate-400"
                        }`}
                      >
                        {hObj.label}
                      </div>

                      {/* Staff Empty Cells with Silent Soft Hover */}
                      {displayedStaff.map((staff) => (
                        <div
                          key={staff.id}
                          onClick={() => handleEmptyCellClick(staff.id, hObj.hour)}
                          className={`border-l transition-colors cursor-pointer group relative ${
                            isDark
                              ? "border-white/[0.04] hover:bg-white/[0.02]"
                              : "border-slate-200/60 hover:bg-slate-50/70"
                          }`}
                        >
                          {/* Minimal hover trigger badge */}
                          <div className="absolute inset-1.5 rounded-xl border border-transparent group-hover:border-dashed group-hover:border-white/10 group-hover:bg-white/[0.02] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                              + Schedule
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}


                  {/* Disciplined Whole-Box Event Cards (Uniform Apple-Level Layout) */}
                  {filteredAppointments.map((apt) => {
                    const colIndex = displayedStaff.findIndex((s) => s.id === apt.staffId);
                    if (colIndex === -1) return null;

                    // Each slot belongs to startHour, occupying the full hour box
                    const topPx = (apt.startHour - 9) * HOUR_ROW_HEIGHT + 3;
                    const spanHours = Math.max(1, Math.round((apt.durationMinutes || 60) / 60));
                    const heightPx = spanHours * HOUR_ROW_HEIGHT - 6;

                    const colWidthPct = 100 / displayedStaff.length;
                    const leftPct = colIndex * colWidthPct;

                    const design = getEventCardDesign(apt.category, apt.categoryDetail);

                    return (
                      <motion.div
                        key={apt.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -1, zIndex: 30 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppointmentId(apt.id);
                        }}
                        style={{
                          top: `${topPx}px`,
                          height: `${heightPx}px`,
                          left: `calc(56px + ${leftPct}% + 4px)`,
                          width: `calc(${colWidthPct}% - 8px)`,
                        }}
                        className={`absolute rounded-xl border border-l-[3.5px] overflow-hidden cursor-pointer transition-all duration-150 select-none z-20 shadow-md ${design.bg} ${design.accentBorder}`}
                      >
                        {/* Whole Box Layout: Structured, Balanced, No Small Slivers */}
                        <div className="h-full flex flex-col justify-between p-2.5">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className={`text-[10.5px] font-mono font-medium tracking-tight ${design.timeColor}`}>
                              {apt.timeDisplay}
                            </span>
                            <div className="shrink-0 flex items-center gap-1">
                              {apt.isVideoCall ? (
                                <Video className={`w-3.5 h-3.5 ${design.iconColor}`} />
                              ) : apt.status === "Confirmed" ? (
                                <Check className={`w-3.5 h-3.5 ${design.iconColor}`} />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              )}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <h4 className={`text-[12px] font-semibold leading-tight truncate ${design.textPrimary}`}>
                              {apt.clientName}
                            </h4>
                            <span className={`text-[10.5px] block truncate mt-0.5 font-normal ${design.textSecondary}`}>
                              {apt.categoryDetail}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : viewMode === "Agenda" ? (
            /* Clean Linear-Style Agenda Table */
            <div className="flex-1 min-h-0 overflow-y-auto p-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-[9.5px] uppercase tracking-[0.16em] font-medium ${isDark ? "border-white/10 text-neutral-400" : "border-slate-200 text-slate-500"}`}>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Client</th>
                    <th className="py-2.5 px-3">Counsellor</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredAppointments.map((apt) => (
                    <tr
                      key={apt.id}
                      onClick={() => setSelectedAppointmentId(apt.id)}
                      className={`cursor-pointer transition-colors ${isDark ? "hover:bg-white/[0.03]" : "hover:bg-slate-50"}`}
                    >
                      <td className="py-3 px-3 text-[11.5px] font-mono font-medium text-sky-400">
                        {apt.timeDisplay}
                      </td>
                      <td className="py-3 px-3 text-[12.5px] font-medium">
                        {apt.clientName}
                      </td>
                      <td className="py-3 px-3 text-[12px] text-neutral-400">
                        {apt.staffName}
                      </td>
                      <td className="py-3 px-3 text-[11.5px]">
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px]">
                          {apt.categoryDetail}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {renderStatusPill(apt.status)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Multi-Day Week Overview */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
              <CalendarDays className="w-9 h-9 text-sky-400 mb-2 opacity-80" />
              <h3 className={`text-[15px] font-medium ${isDark ? "text-white" : "text-[#0B0F17]"}`}>
                Week View Active
              </h3>
              <p className={`text-[12px] max-w-sm mt-1 ${isDark ? "text-[#8e95a5]" : "text-slate-500"}`}>
                All team members synchronized for week of 22 Sep - 26 Sep.
              </p>
              <button
                type="button"
                onClick={() => setViewMode("Day")}
                className="mt-3 px-4 py-1.5 rounded-full text-[11.5px] font-medium bg-sky-500 text-white cursor-pointer hover:bg-sky-400 transition-colors"
              >
                Back to Day Schedule
              </button>
            </div>
          )}

          {/* Table / Grid Footer */}
          <div
            className={`p-2 px-4 border-t flex items-center justify-between text-[11px] shrink-0 select-none ${
              isDark ? "border-white/[0.06] text-[#8e95a5]" : "border-slate-100 text-slate-500"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{filteredAppointments.length} active consultations today</span>
            </div>
            <span className="text-[10px] text-neutral-500">Click any slot to inspect or reschedule</span>
          </div>
        </div>

        {/* ================================================================== */}
        {/* ================================================================== */}
        {/* 4B. RIGHT RAIL: APPLE-LEVEL MANAGED AGENDA & AI COPILOT */}
        {/* ================================================================== */}
        <div className="w-full lg:w-[360px] shrink-0 h-full flex flex-col gap-2.5 overflow-hidden select-none">
          {/* Apple-Grade Segmented Control Switcher */}
          <div
            className={`p-1 rounded-xl border grid grid-cols-4 gap-1 shrink-0 ${
              isDark ? "bg-[#090d16] border-white/[0.08]" : "bg-slate-100/80 border-slate-200"
            }`}
          >
            {[
              { id: "ALL", label: "Overview", icon: LayoutGrid },
              { id: "UPCOMING", label: "Next Up", icon: Clock, badge: nextUpConsultations.length },
              { id: "COPILOT", label: "Copilot", icon: Sparkles, badge: openSlotsCount > 0 ? openSlotsCount : undefined },
              { id: "CONSULTANTS", label: "Consultancy", icon: Users },
            ].map((tab) => {
              const isActive = railTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRailTab(tab.id as any)}
                  className={`relative w-full py-1.5 px-1 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer outline-none select-none ${
                    isActive
                      ? isDark
                        ? "text-black font-semibold"
                        : "text-white font-semibold"
                      : isDark
                      ? "text-neutral-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-right-rail-tab"
                      className={`absolute inset-0 rounded-lg ${
                        isDark
                          ? "bg-white shadow-xs"
                          : "bg-[#0B0F17] shadow-xs"
                      }`}
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  <tab.icon className="w-3 h-3 relative z-10 shrink-0" />
                  <span className="relative z-10 whitespace-nowrap tracking-tight">{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`relative z-10 text-[8.5px] font-mono px-1 py-0 rounded-full leading-none shrink-0 ${
                        isActive
                          ? isDark
                            ? "bg-black/15 text-black font-semibold"
                            : "bg-white/20 text-white font-semibold"
                          : isDark
                          ? "bg-white/[0.06] text-neutral-400"
                          : "bg-slate-200/70 text-slate-600"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Scrollable / Scaled Tab Content Enclosure */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-0.5 flex flex-col gap-2.5">
            {/* ------------------------------------------------------------- */}
            {/* TAB 1: OVERVIEW (All 3 in Apple-level Minimalist Harmony)     */}
            {/* ------------------------------------------------------------- */}
            {railTab === "ALL" && (
              <div className="flex flex-col gap-2.5">
                {/* 1. UPCOMING NEXT (Clean Apple List Row Style) */}
                <div
                  className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 shrink-0 ${
                    isDark
                      ? "bg-[#090d16] border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_4px_16px_rgba(0,0,0,0.4)]"
                      : "bg-white border-slate-200/90 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-inherit">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span className={`text-[13.5px] font-medium tracking-tight ${isDark ? "text-white" : "text-[#0B0F17]"}`}>
                        Upcoming Next
                      </span>
                      <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded-full border ${
                        isDark ? "bg-white/[0.04] border-white/[0.08] text-neutral-400" : "bg-slate-100 border-slate-200 text-slate-600"
                      }`}>
                        {nextUpConsultations.length}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRailTab("UPCOMING")}
                      className="text-[10.5px] text-sky-400 hover:text-sky-300 font-medium cursor-pointer flex items-center gap-0.5 group"
                    >
                      <span>Agenda</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                  <div className={`divide-y ${isDark ? "divide-white/[0.04]" : "divide-slate-100"}`}>
                    {nextUpConsultations.slice(0, 3).map((item) => {
                      const staffObj = STAFF_MEMBERS.find((s) => s.id === item.staffId);
                      const isSelected = selectedAppointmentId === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedAppointmentId(item.id)}
                          className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 group ${
                            isSelected
                              ? isDark ? "bg-white/[0.06]" : "bg-slate-100"
                              : isDark ? "hover:bg-white/[0.03]" : "hover:bg-slate-50"
                          }`}
                        >
                          {/* Apple-style Vertical Status Indicator */}
                          <span
                            className={`w-1 h-7 rounded-full shrink-0 ${
                              item.status === "Confirmed"
                                ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"
                                : "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className={`text-[12px] font-medium truncate ${
                                isDark ? "text-white group-hover:text-sky-300" : "text-slate-900 group-hover:text-sky-700"
                              }`}>
                                {item.clientName}
                              </span>
                              <span className={`text-[10px] font-mono shrink-0 ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
                                {item.startTime}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] mt-0.5">
                              <span className={`truncate ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
                                {item.categoryDetail}
                              </span>
                              {staffObj && (
                                <span className={`shrink-0 ml-1 font-medium ${isDark ? "text-neutral-400" : "text-slate-600"}`}>
                                  {staffObj.shortName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. MAYA COPILOT (Apple-Grade Minimalist Widget) */}
                <div
                  className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 shrink-0 ${
                    isDark
                      ? "bg-[#090d16] border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_4px_16px_rgba(0,0,0,0.4)]"
                      : "bg-white border-slate-200/90 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-inherit">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                        isDark ? "bg-white/[0.06] text-white" : "bg-slate-100 text-slate-900"
                      }`}>
                        <Sparkles className="w-3 h-3" />
                      </div>
                      <span className={`text-[13.5px] font-medium tracking-tight ${isDark ? "text-white" : "text-[#0B0F17]"}`}>
                        MAYA Copilot
                      </span>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-medium border ${
                      openSlotsCount > 0
                        ? isDark
                          ? "bg-white/[0.06] text-white border-white/10"
                          : "bg-slate-100 text-slate-900 border-slate-200"
                        : isDark
                        ? "bg-white/[0.03] text-neutral-400 border-white/[0.06]"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${openSlotsCount > 0 ? "bg-emerald-400" : "bg-neutral-500"}`} />
                      <span>{openSlotsCount > 0 ? `${openSlotsCount} Open Slots` : "Optimized"}</span>
                    </span>
                  </div>

                  {/* Inline Compact Slot Chips */}
                  {openSlotsCount > 0 ? (
                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      {slot1Open && (
                        <div className={`p-1.5 px-2 rounded-lg border flex items-center justify-between ${
                          isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-slate-200"
                        }`}>
                          <span className={`truncate font-medium ${isDark ? "text-neutral-300" : "text-slate-700"}`}>Neha S.</span>
                          <span className={`font-mono shrink-0 ml-1 ${isDark ? "text-neutral-400" : "text-slate-500"}`}>3:00 PM</span>
                        </div>
                      )}
                      {slot2Open && (
                        <div className={`p-1.5 px-2 rounded-lg border flex items-center justify-between ${
                          isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-slate-200"
                        }`}>
                          <span className={`truncate font-medium ${isDark ? "text-neutral-300" : "text-slate-700"}`}>Rohan V.</span>
                          <span className={`font-mono shrink-0 ml-1 ${isDark ? "text-neutral-400" : "text-slate-500"}`}>2:00 PM</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`py-1.5 px-2 rounded-lg text-[10px] text-center ${
                      isDark ? "bg-white/[0.02] text-neutral-400" : "bg-slate-50 text-slate-500"
                    }`}>
                      All afternoon consultation slots optimized.
                    </div>
                  )}

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAutoFillSlots}
                    disabled={openSlotsCount === 0}
                    className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                      openSlotsCount > 0
                        ? isDark
                          ? "bg-white text-black hover:bg-neutral-100 font-semibold"
                          : "bg-[#0B0F17] text-white hover:bg-slate-800 font-semibold"
                        : isDark
                        ? "bg-white/[0.04] text-neutral-500 border border-white/[0.06] cursor-not-allowed"
                        : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                    }`}
                  >
                    <Zap className={`w-3 h-3 ${openSlotsCount > 0 ? (isDark ? "text-black fill-black" : "text-white fill-white") : "text-neutral-500"}`} />
                    <span>{openSlotsCount > 0 ? `Auto-Dispatch ${openSlotsCount} Slots` : "Slots Fully Allocated"}</span>
                  </motion.button>
                </div>

                {/* 3. CONSULTANCY MIX (Refined Disciplined Analytics) */}
                <div
                  className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 shrink-0 ${
                    isDark
                      ? "bg-[#090d16] border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_4px_16px_rgba(0,0,0,0.4)]"
                      : "bg-white border-slate-200/90 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-inherit">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-neutral-400" />
                      <span className={`text-[13.5px] font-medium tracking-tight ${isDark ? "text-white" : "text-[#0B0F17]"}`}>
                        Consultancy Mix
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedCategoryFilter !== "ALL" ? (
                        <button
                          type="button"
                          onClick={() => setSelectedCategoryFilter("ALL")}
                          className="text-[9.5px] text-sky-400 hover:text-white font-mono cursor-pointer"
                        >
                          Reset ✕
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setRailTab("CONSULTANTS")}
                        className="text-[10.5px] text-sky-400 hover:text-sky-300 font-medium cursor-pointer flex items-center gap-0.5 group"
                      >
                        <span>Consultancy</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>

                  {/* Unified Disciplined Spectrum Bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/[0.05] flex gap-0.5 overflow-hidden">
                    <div className="h-full rounded-full bg-[#818cf8]" style={{ width: "42%" }} title="Career Counselling (42%)" />
                    <div className="h-full rounded-full bg-[#38bdf8]" style={{ width: "24%" }} title="Admission Discussion (24%)" />
                    <div className="h-full rounded-full bg-[#fbbf24]" style={{ width: "16%" }} title="Follow-up Brief (16%)" />
                    <div className="h-full rounded-full bg-[#34d399]" style={{ width: "12%" }} title="Course Enquiry (12%)" />
                    <div className="h-full rounded-full bg-slate-500" style={{ width: "6%" }} title="Other (6%)" />
                  </div>

                  {/* Compact 2x2 Clean Grid */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: "Consultancy", count: "10", pct: "42%", dot: "bg-[#818cf8]", cat: "Counselling" },
                      { label: "Admission", count: "6", pct: "24%", dot: "bg-[#38bdf8]", cat: "Admission" },
                      { label: "Follow-up", count: "4", pct: "16%", dot: "bg-[#fbbf24]", cat: "Follow-up" },
                      { label: "Course Enquiry", count: "3", pct: "12%", dot: "bg-[#34d399]", cat: "Course Enquiry" },
                    ].map((cat) => {
                      const isActive = selectedCategoryFilter === cat.cat;
                      return (
                        <button
                          key={cat.label}
                          type="button"
                          onClick={() => setSelectedCategoryFilter((prev) => (prev === cat.cat ? "ALL" : cat.cat))}
                          className={`p-1.5 px-2 rounded-lg flex items-center justify-between text-[10.5px] transition-all cursor-pointer border text-left ${
                            isActive
                              ? isDark
                                ? "bg-white text-black font-semibold border-white shadow-xs"
                                : "bg-[#0B0F17] text-white font-semibold border-[#0B0F17] shadow-xs"
                              : isDark
                              ? "bg-white/[0.03] border-white/[0.08] hover:border-violet-400/40 text-neutral-300 hover:text-white"
                              : "bg-slate-50 border-slate-200 hover:border-violet-300 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? (isDark ? "bg-black" : "bg-white") : cat.dot} shrink-0`} />
                            <span className="truncate">{cat.label}</span>
                          </div>
                          <span className={`font-mono text-[9.5px] shrink-0 ml-1 ${
                            isActive
                              ? isDark
                                ? "text-black/70 font-semibold"
                                : "text-white/70 font-semibold"
                              : isDark
                              ? "text-neutral-400"
                              : "text-slate-500"
                          }`}>
                            {cat.pct}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 2: NEXT UP (Full-Featured Apple Agenda Queue)             */}
            {/* ------------------------------------------------------------- */}
            {railTab === "UPCOMING" && (
              <div
                className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-3 ${
                  isDark
                    ? "bg-[#090d16] border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_8px_24px_rgba(0,0,0,0.5)]"
                    : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-inherit">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span className={`text-[13px] font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      All Today Agenda
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isDark ? "bg-white/5 border-white/10 text-neutral-300" : "bg-slate-100 border-slate-200 text-slate-700"
                  }`}>
                    {filteredAppointments.length} Total
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {filteredAppointments.map((item) => {
                    const staffObj = STAFF_MEMBERS.find((s) => s.id === item.staffId);
                    const isSelected = selectedAppointmentId === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedAppointmentId(item.id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 group ${
                          isSelected
                            ? isDark
                              ? "bg-white/[0.08] border-white/25 shadow-sm"
                              : "bg-slate-100 border-slate-300 shadow-sm"
                            : isDark
                            ? "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10.5px] font-mono font-medium px-2 py-0.5 rounded border ${
                            isDark ? "bg-white/[0.04] border-white/[0.08] text-neutral-300" : "bg-white border-slate-200 text-slate-800"
                          }`}>
                            {item.startTime} - {item.endTime}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {item.isVideoCall && <Video className="w-3 h-3 text-sky-400" />}
                            {renderStatusPill(item.status)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 min-w-0">
                          <div className="min-w-0 flex-1">
                            <h4 className={`text-[12.5px] font-medium truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                              {item.clientName}
                            </h4>
                            <span className={`text-[10.5px] block truncate ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
                              {item.categoryDetail}
                            </span>
                          </div>
                          {staffObj && (
                            <div className="flex items-center gap-1.5 shrink-0 pl-2">
                              <StaffAvatar staff={staffObj} size="xs" showStatusDot={false} />
                              <span className={`text-[10.5px] font-medium ${isDark ? "text-neutral-300" : "text-slate-700"}`}>
                                {staffObj.shortName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 3: MAYA COPILOT (Autonomous Dispatch Studio)              */}
            {/* ------------------------------------------------------------- */}
            {railTab === "COPILOT" && (
              <div
                className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-3 ${
                  isDark
                    ? "bg-[#090d16] border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_8px_24px_rgba(0,0,0,0.5)]"
                    : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-inherit">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      isDark ? "bg-white/[0.06] text-white" : "bg-slate-100 text-slate-900"
                    }`}>
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className={`text-[12.5px] font-semibold leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                        MAYA Dispatch Copilot
                      </h4>
                      <span className={`text-[10px] font-mono ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
                        Autonomous Allocation Engine
                      </span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-medium border ${
                    openSlotsCount > 0
                      ? isDark
                        ? "bg-white/[0.06] text-white border-white/10"
                        : "bg-slate-100 text-slate-900 border-slate-200"
                      : isDark
                      ? "bg-white/[0.03] text-neutral-400 border-white/[0.06]"
                      : "bg-slate-50 text-slate-500 border-slate-200"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${openSlotsCount > 0 ? "bg-emerald-400" : "bg-neutral-500"}`} />
                    <span>{openSlotsCount} Slots</span>
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                    Live Recommendations
                  </span>

                  {slot1Open && (
                    <div className={`p-2.5 rounded-xl border flex flex-col gap-1.5 ${
                      isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-slate-200"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[11.5px] font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                          Kavita Sen (Lead #804)
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-medium">98% Match</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span>Admission Discussion</span>
                        <span className={`font-mono ${isDark ? "text-neutral-300" : "text-slate-600"}`}>Neha S. · 3:00 PM</span>
                      </div>
                    </div>
                  )}

                  {slot2Open && (
                    <div className={`p-2.5 rounded-xl border flex flex-col gap-1.5 ${
                      isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-slate-200"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[11.5px] font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                          Dev Sharma (Walk-in)
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-medium">94% Match</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span>Course Enquiry</span>
                        <span className={`font-mono ${isDark ? "text-neutral-300" : "text-slate-600"}`}>Rohan V. · 2:00 PM</span>
                      </div>
                    </div>
                  )}

                  {!slot1Open && !slot2Open && (
                    <div className={`py-6 text-center rounded-xl border ${
                      isDark ? "bg-white/[0.02] border-white/[0.06] text-neutral-400" : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
                      <p className={`text-[12px] font-medium ${isDark ? "text-white" : "text-slate-900"}`}>Full Capacity Reached</p>
                      <p className="text-[10.5px] text-neutral-400 mt-0.5">All afternoon slots are successfully matched.</p>
                    </div>
                  )}
                </div>

                <div className={`p-2.5 rounded-xl border text-[11px] flex flex-col gap-1.5 ${
                  isDark ? "bg-white/[0.02] border-white/[0.05]" : "bg-slate-50 border-slate-200"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Staff Load Balancing</span>
                    <span className="text-emerald-400 font-medium">Optimal</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Schedule Conflicts</span>
                    <span className="text-sky-400 font-medium">0 Detected</span>
                  </div>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAutoFillSlots}
                  disabled={openSlotsCount === 0}
                  className={`w-full py-2.5 px-3 rounded-xl text-[12px] font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                    openSlotsCount > 0
                      ? isDark
                        ? "bg-white text-black hover:bg-neutral-100 font-semibold"
                        : "bg-[#0B0F17] text-white hover:bg-slate-800 font-semibold"
                      : isDark
                      ? "bg-white/[0.04] text-neutral-500 border border-white/[0.06] cursor-not-allowed"
                      : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  }`}
                >
                  <Zap className={`w-3.5 h-3.5 ${openSlotsCount > 0 ? (isDark ? "text-black fill-black" : "text-white fill-white") : "text-neutral-500"}`} />
                  <span>{openSlotsCount > 0 ? `Auto-Dispatch ${openSlotsCount} Priority Slots` : "All Slots Optimized"}</span>
                </motion.button>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 4: CONSULTANTS (Workload Capacity & Category Mix)         */}
            {/* ------------------------------------------------------------- */}
            {railTab === "CONSULTANTS" && (
              <div
                className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-3 ${
                  isDark
                    ? "bg-[#090d16] border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_8px_24px_rgba(0,0,0,0.5)]"
                    : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-inherit">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    <span className={`text-[13px] font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      Consultancy & Capacity
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isDark ? "bg-white/5 border-white/10 text-neutral-300" : "bg-slate-100 border-slate-200 text-slate-700"
                  }`}>
                    4 Active
                  </span>
                </div>

                {/* Staff Capacity Meters */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                    Daily Slot Utilization
                  </span>

                  {staffWorkload.map(({ staff, count, capacity, pct }) => {
                    const isSelected = selectedStaffFilter === staff.id;
                    return (
                      <div
                        key={staff.id}
                        onClick={() => setSelectedStaffFilter((prev) => (prev === staff.id ? "ALL" : staff.id))}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                          isSelected
                            ? isDark
                              ? "bg-white/[0.08] border-white/25 shadow-2xs"
                              : "bg-slate-100 border-slate-300 shadow-2xs"
                            : isDark
                            ? "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05]"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <StaffAvatar staff={staff} size="xs" showStatusDot />
                            <span className={`text-[11.5px] font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                              {staff.name}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-neutral-400">
                            {count} / {capacity} slots ({pct}%)
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              pct >= 80 ? "bg-emerald-400" : pct >= 50 ? "bg-sky-400" : "bg-amber-400"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Category Mix Breakdown */}
                <div className="pt-2 border-t border-inherit flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                      Category Breakdown
                    </span>
                    {selectedCategoryFilter !== "ALL" && (
                      <button
                        type="button"
                        onClick={() => setSelectedCategoryFilter("ALL")}
                        className="text-[9.5px] text-sky-400 hover:text-white font-mono cursor-pointer"
                      >
                        Clear filter ✕
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    {[
                      { label: "Consultancy", count: "10", pct: "42%", dot: "bg-[#818cf8]", cat: "Counselling" },
                      { label: "Admission Discussion", count: "6", pct: "24%", dot: "bg-[#38bdf8]", cat: "Admission" },
                      { label: "Follow-up Brief", count: "4", pct: "16%", dot: "bg-[#fbbf24]", cat: "Follow-up" },
                      { label: "Course Enquiry", count: "3", pct: "12%", dot: "bg-[#34d399]", cat: "Course Enquiry" },
                    ].map((cat) => {
                      const isActive = selectedCategoryFilter === cat.cat;
                      return (
                        <div
                          key={cat.label}
                          onClick={() => setSelectedCategoryFilter((prev) => (prev === cat.cat ? "ALL" : cat.cat))}
                          className={`px-2.5 py-1.5 rounded-xl flex items-center justify-between text-[11px] transition-all cursor-pointer ${
                            isActive
                              ? isDark
                                ? "bg-white/10 text-white font-medium border border-white/15"
                                : "bg-slate-100 text-slate-900 font-medium border border-slate-300"
                              : isDark
                              ? "hover:bg-white/[0.03] text-neutral-300"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${cat.dot} shrink-0`} />
                            <span>{cat.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-400">
                            <span>{cat.count}</span>
                            <span className="opacity-40">•</span>
                            <span className={isDark ? "text-white/80" : "text-slate-800"}>{cat.pct}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. SLIDE-OVER APPOINTMENT INSPECTOR DRAWER */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {activeAppointment && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAppointmentId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: 420, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 420, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className={`relative w-full max-w-md h-full rounded-l-3xl border-l flex flex-col justify-between overflow-hidden z-10 shadow-2xl ${
                isDark
                  ? "bg-gradient-to-b from-[#111724]/98 via-[#0c101a]/98 to-[#080b12]/99 border-white/[0.1] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
                  : "bg-white border-slate-200 text-[#0F172A]"
              }`}
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-white/[0.08] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center font-bold text-sky-400 text-[14px]">
                    {activeAppointment.clientInitials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] font-semibold leading-tight">
                        {activeAppointment.clientName}
                      </h3>
                      {renderStatusPill(activeAppointment.status)}
                    </div>
                    <span className="text-[11px] text-neutral-400 block mt-0.5">
                      {activeAppointment.categoryDetail} • {activeAppointment.timeDisplay}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAppointmentId(null)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body Content */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-4 text-[12px]">
                {/* Fast Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {activeAppointment.isVideoCall ? (
                    <motion.a
                      href={activeAppointment.videoLink || "#"}
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      className="py-2.5 px-3 rounded-xl font-medium text-[12px] flex items-center justify-center gap-2 bg-sky-500 text-white hover:bg-sky-400 transition-all cursor-pointer shadow-sm"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Video Call</span>
                    </motion.a>
                  ) : (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => showToast(`Calling ${activeAppointment.clientName}...`)}
                      className="py-2.5 px-3 rounded-xl font-medium text-[12px] flex items-center justify-center gap-2 bg-sky-500 text-white hover:bg-sky-400 transition-all cursor-pointer shadow-sm"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call Client</span>
                    </motion.button>
                  )}

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => showToast(`WhatsApp briefing sent to ${activeAppointment.clientPhone}`)}
                    className="py-2.5 px-3 rounded-xl font-medium text-[12px] flex items-center justify-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp Alert</span>
                  </motion.button>
                </div>

                {/* Assigned Counselor Info */}
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-4 h-4 text-sky-400" />
                    <div>
                      <span className="text-[10px] text-neutral-400 block uppercase tracking-wider">
                        Assigned Counsellor
                      </span>
                      <span className="text-[12.5px] font-medium text-white">
                        {activeAppointment.staffName}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-300">
                    Front-Desk Lead
                  </span>
                </div>

                {/* Client Contact Details */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2.5">
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Contact Information
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Phone</span>
                    <span className="font-mono text-white">{activeAppointment.clientPhone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Email</span>
                    <span className="text-white">{activeAppointment.clientEmail}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Duration</span>
                    <span className="text-white">{activeAppointment.durationMinutes} Minutes</span>
                  </div>
                </div>

                {/* Consultation Notes */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                    Consultation Brief & Objectives
                  </span>
                  <p className="text-[12px] text-neutral-300 leading-relaxed">
                    {activeAppointment.notes}
                  </p>
                </div>

                {/* Status Toggle Switcher */}
                <div>
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                    Update Appointment State
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Confirmed", "Pending", "Cancelled"] as AppointmentStatusType[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setAppointments((prev) =>
                            prev.map((a) => (a.id === activeAppointment.id ? { ...a, status: st } : a))
                          );
                          showToast(`Appointment status updated to ${st}`);
                        }}
                        className={`py-2 px-2 rounded-xl text-[10.5px] font-medium border text-center transition-all cursor-pointer ${
                          activeAppointment.status === st
                            ? "bg-white text-black border-white font-semibold"
                            : "bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-3.5 border-t border-white/[0.08] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAppointments((prev) => prev.filter((a) => a.id !== activeAppointment.id));
                    setSelectedAppointmentId(null);
                    showToast("Appointment slot released.");
                  }}
                  className="px-3 py-2 rounded-xl text-[11.5px] font-medium text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
                >
                  Delete Slot
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedAppointmentId(null);
                    showToast("Changes synced with calendar engine.");
                  }}
                  className="px-5 py-2 rounded-xl text-[12px] font-medium bg-white text-black hover:bg-neutral-100 cursor-pointer transition-colors shadow-sm"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================================== */}
      {/* 6. APPLE-GRADE "NEW APPOINTMENT" BOOKING MODAL */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`relative w-full max-w-lg rounded-3xl border p-6 z-10 shadow-2xl ${
                isDark
                  ? "bg-gradient-to-b from-[#111724]/98 via-[#0c101a]/98 to-[#080b12]/99 border-white/[0.1] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),0_20px_50px_rgba(0,0,0,0.8)]"
                  : "bg-white border-slate-200 text-[#0F172A] shadow-xl"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[17px] font-semibold">Book New Appointment</h3>
                  <p className="text-[11.5px] text-neutral-400 mt-0.5">
                    Schedule client consultation with auto-conflict detection.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateAppointment} className="flex flex-col gap-3.5">
                <div>
                  <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                    Client Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    placeholder="e.g. Rohit Deshmukh"
                    autoFocus
                    className="w-full h-10 px-3.5 rounded-xl border bg-white/[0.04] border-white/10 text-white text-[12.5px] outline-none focus:border-sky-400 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formClientPhone}
                      onChange={(e) => setFormClientPhone(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="w-full h-10 px-3.5 rounded-xl border bg-white/[0.04] border-white/10 text-white text-[12.5px] outline-none focus:border-sky-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formClientEmail}
                      onChange={(e) => setFormClientEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="w-full h-10 px-3.5 rounded-xl border bg-white/[0.04] border-white/10 text-white text-[12.5px] outline-none focus:border-sky-400 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                      Counsellor / Staff
                    </label>
                    <select
                      value={formStaffId}
                      onChange={(e) => setFormStaffId(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl border bg-[#0c101a] border-white/10 text-white text-[12px] outline-none focus:border-sky-400"
                    >
                      {STAFF_MEMBERS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                      Appointment Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl border bg-[#0c101a] border-white/10 text-white text-[12px] outline-none focus:border-sky-400"
                    >
                      <option value="Course Enquiry">Course Enquiry</option>
                      <option value="Counselling">Career Counselling</option>
                      <option value="Admission">Admission Discussion</option>
                      <option value="Follow-up">Follow-up Call</option>
                      <option value="Other">Other Session</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                      Start Time (24h)
                    </label>
                    <select
                      value={formTimeSlot}
                      onChange={(e) => setFormTimeSlot(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border bg-[#0c101a] border-white/10 text-white text-[12px] outline-none focus:border-sky-400 font-mono"
                    >
                      <option value="09:00">09:00 AM</option>
                      <option value="09:30">09:30 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="10:30">10:30 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="11:30">11:30 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="12:30">12:30 PM</option>
                      <option value="13:00">01:00 PM</option>
                      <option value="13:30">01:30 PM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="14:30">02:30 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="15:30">03:30 PM</option>
                      <option value="16:00">04:00 PM</option>
                      <option value="16:30">04:30 PM</option>
                      <option value="17:00">05:00 PM</option>
                      <option value="17:30">05:30 PM</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                      Duration
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormDuration(30)}
                        className={`h-10 rounded-xl border text-[11.5px] font-medium transition-all cursor-pointer ${
                          formDuration === 30
                            ? "bg-white text-black border-white font-semibold"
                            : "bg-white/5 border-white/10 text-neutral-300"
                        }`}
                      >
                        30 Mins
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormDuration(60)}
                        className={`h-10 rounded-xl border text-[11.5px] font-medium transition-all cursor-pointer ${
                          formDuration === 60
                            ? "bg-white text-black border-white font-semibold"
                            : "bg-white/5 border-white/10 text-neutral-300"
                        }`}
                      >
                        60 Mins
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isVideo"
                    checked={formIsVideo}
                    onChange={(e) => setFormIsVideo(e.target.checked)}
                    className="w-4 h-4 rounded accent-sky-500 cursor-pointer"
                  />
                  <label htmlFor="isVideo" className="text-[12px] text-neutral-300 cursor-pointer flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-sky-400" />
                    <span>Generate Virtual Video Meeting Link (Google Meet)</span>
                  </label>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                    Consultation Brief & Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Candidate background, course preferences, payment terms..."
                    className="w-full p-2.5 rounded-xl border bg-white/[0.04] border-white/10 text-white text-[12px] outline-none focus:border-sky-400 transition-all resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-[12px] font-medium text-neutral-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-[12px] font-medium bg-white text-black hover:bg-neutral-100 cursor-pointer transition-all shadow-md font-semibold"
                  >
                    Confirm Appointment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================================== */}
      {/* 7. HAPTIC TOAST NOTIFICATION */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0B0F17] text-white border border-white/15 shadow-2xl text-[12px] select-none"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
