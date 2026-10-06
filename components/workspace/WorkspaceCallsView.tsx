"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  PhoneForwarded,
  Play,
  Pause,
  Download,
  Search,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  FileText,
  MoreHorizontal,
  X,
  ArrowRight,
  MessageCircle,
  UserPlus,
  Copy,
  ShieldCheck,
  User,
  SlidersHorizontal,
  Plus,
  Check,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

// ============================================================================
// TYPES & DATA CONTRACTS
// ============================================================================

export type CallDirection = "Incoming" | "Outgoing" | "Missed" | "Transferred";
export type CallStatus = "Completed" | "Missed" | "Transferred";
export type CallOutcome =
  | "Interested"
  | "Follow-up"
  | "Visited"
  | "Not Interested"
  | "Transferred"
  | "—";

export interface CallTranscriptTurn {
  speaker: "AI Receptionist" | "Caller";
  text: string;
  time: string;
}

export interface CallItem {
  id: string;
  callerName: string;
  avatarUrl?: string;
  direction: CallDirection;
  phone: string;
  timestamp: string;
  duration: string;
  durationSeconds: number;
  intent: string;
  outcome: CallOutcome;
  isLead: boolean;
  status: CallStatus;
  aiSummary: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  transferTarget?: string;
  transcript: CallTranscriptTurn[];
  notes?: string;
}

interface MetricCardItem {
  id: string;
  label: string;
  value: string | number;
  changePct: string;
  isPositive: boolean;
  timeframe: string;
  icon: React.ComponentType<{ className?: string }>;
  strokeColorDark: string;
  strokeColorLight: string;
  sparklineD: string;
}

// ============================================================================
// 5 KPI METRICS MATCHING WORKSPACE DESIGN DISCIPLINE
// ============================================================================

const CALLS_METRICS_DATA: MetricCardItem[] = [
  {
    id: "total-calls",
    label: "TOTAL CALLS",
    value: 186,
    changePct: "↑ +22%",
    isPositive: true,
    timeframe: "vs last week",
    icon: Phone,
    strokeColorDark: "#38bdf8",
    strokeColorLight: "#0284c7",
    sparklineD: "M 0 24 C 20 25, 40 18, 65 15 C 90 12, 105 7, 120 4",
  },
  {
    id: "completed",
    label: "COMPLETED",
    value: 142,
    changePct: "↑ +28%",
    isPositive: true,
    timeframe: "vs last week",
    icon: CheckCircle2,
    strokeColorDark: "#34d399",
    strokeColorLight: "#059669",
    sparklineD: "M 0 26 C 25 24, 45 16, 70 12 C 95 9, 105 6, 120 3",
  },
  {
    id: "missed",
    label: "MISSED",
    value: 18,
    changePct: "↓ -10%",
    isPositive: false,
    timeframe: "vs last week",
    icon: XCircle,
    strokeColorDark: "#f43f5e",
    strokeColorLight: "#e11d48",
    sparklineD: "M 0 6 C 25 8, 45 15, 70 18 C 95 22, 105 24, 120 26",
  },
  {
    id: "transferred",
    label: "TRANSFERRED",
    value: 12,
    changePct: "↑ +33%",
    isPositive: true,
    timeframe: "vs last week",
    icon: PhoneForwarded,
    strokeColorDark: "#c084fc",
    strokeColorLight: "#7c3aed",
    sparklineD: "M 0 25 C 20 26, 45 19, 70 17 C 95 13, 105 8, 120 5",
  },
  {
    id: "avg-duration",
    label: "AVG. DURATION",
    value: "04:21",
    changePct: "↑ +12%",
    isPositive: true,
    timeframe: "vs last week",
    icon: Clock,
    strokeColorDark: "#fbbf24",
    strokeColorLight: "#d97706",
    sparklineD: "M 0 22 C 20 20, 45 18, 70 14 C 95 10, 105 7, 120 4",
  },
];

// ============================================================================
// SEED CALL RECORDS (EXACT FIDELITY TO REFERENCE)
// ============================================================================

const INITIAL_CALLS: CallItem[] = [
  {
    id: "call-1",
    callerName: "Rahul Sharma",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    direction: "Incoming",
    phone: "+91 98765 43210",
    timestamp: "Today, 10:32 AM",
    duration: "04:21",
    durationSeconds: 261,
    intent: "Course Enquiry",
    outcome: "Interested",
    isLead: true,
    status: "Completed",
    aiSummary:
      "Rahul called to inquire about the Data Science course. He is interested in the weekend batch and wants more details about fees and placement support. Follow-up scheduled.",
    sentiment: "Positive",
    transferTarget: "Not Transferred",
    notes: "Very polite. Specifically asked about Saturday/Sunday hands-on capstone projects.",
    transcript: [
      {
        speaker: "AI Receptionist",
        time: "00:03",
        text: "Good morning! Thank you for calling MAYA Academy. How may I assist you today?",
      },
      {
        speaker: "Caller",
        time: "00:09",
        text: "Hi, I wanted to understand your Data Science program details. Do you offer weekend batches?",
      },
      {
        speaker: "AI Receptionist",
        time: "00:18",
        text: "Yes, Rahul! We offer an executive weekend batch spanning 16 weeks with live capstone projects and mentor office hours.",
      },
      {
        speaker: "Caller",
        time: "00:29",
        text: "That sounds ideal. What are the fee structure and placement assistance options?",
      },
      {
        speaker: "AI Receptionist",
        time: "00:41",
        text: "I can email you the complete curriculum brochure and connect you with our senior academic counsellor for a 1-on-1 walkthrough.",
      },
      {
        speaker: "Caller",
        time: "00:52",
        text: "Yes please, that would be wonderful. Thanks!",
      },
    ],
  },
  {
    id: "call-2",
    callerName: "Priya Mehta",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    direction: "Incoming",
    phone: "+91 98765 12345",
    timestamp: "Today, 11:15 AM",
    duration: "02:18",
    durationSeconds: 138,
    intent: "Fee Details",
    outcome: "Follow-up",
    isLead: true,
    status: "Completed",
    aiSummary:
      "Priya requested an EMI breakdown and early-bird scholarship discounts for UI/UX Design course. Requested a WhatsApp summary.",
    sentiment: "Neutral",
    transferTarget: "Not Transferred",
    notes: "Requires flexible 6-month EMI plan.",
    transcript: [
      {
        speaker: "AI Receptionist",
        time: "00:02",
        text: "Hello! Welcome to MAYA Business front office. How can I assist you?",
      },
      {
        speaker: "Caller",
        time: "00:07",
        text: "Hi, could you explain the installment plans for the UI/UX design masterclass?",
      },
      {
        speaker: "AI Receptionist",
        time: "00:15",
        text: "Certainly, Priya. We offer 0% interest EMI options starting at 4,500 rupees per month across 6 to 12 months.",
      },
    ],
  },
  {
    id: "call-3",
    callerName: "Unknown",
    direction: "Missed",
    phone: "+91 91234 56789",
    timestamp: "Today, 12:04 PM",
    duration: "—",
    durationSeconds: 0,
    intent: "—",
    outcome: "—",
    isLead: false,
    status: "Missed",
    aiSummary:
      "Caller disconnected after 4 rings before speech intake initialized. Automated SMS callback invite was dispatched.",
    sentiment: "Neutral",
    transferTarget: "Not Transferred",
    notes: "Callback queued in priority front desk list.",
    transcript: [],
  },
  {
    id: "call-4",
    callerName: "Arjun Patel",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    direction: "Outgoing",
    phone: "+91 99887 66554",
    timestamp: "Today, 01:20 PM",
    duration: "06:12",
    durationSeconds: 372,
    intent: "Counselling",
    outcome: "Visited",
    isLead: true,
    status: "Completed",
    aiSummary:
      "Follow-up consultation call confirming on-campus counselling session for Thursday 4:00 PM. Parents will accompany him.",
    sentiment: "Positive",
    transferTarget: "Not Transferred",
    notes: "Campus visit confirmed for Thursday 4 PM.",
    transcript: [
      {
        speaker: "AI Receptionist",
        time: "00:03",
        text: "Hello Arjun, this is MAYA following up on your engineering counselling request.",
      },
      {
        speaker: "Caller",
        time: "00:10",
        text: "Yes, hello! We are planning to visit the campus this week.",
      },
    ],
  },
  {
    id: "call-5",
    callerName: "Sneha Iyer",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    direction: "Incoming",
    phone: "+91 77665 44332",
    timestamp: "Today, 02:11 PM",
    duration: "03:05",
    durationSeconds: 185,
    intent: "Admission",
    outcome: "Not Interested",
    isLead: true,
    status: "Completed",
    aiSummary:
      "Caller wanted offline-only classroom courses in South Mumbai. Since our current batch is Hybrid/Online, she declined registration.",
    sentiment: "Negative",
    transferTarget: "Not Transferred",
    notes: "Prefers 100% physical classroom in South Mumbai location.",
    transcript: [
      {
        speaker: "AI Receptionist",
        time: "00:02",
        text: "Hello Sneha, welcome to MAYA Business.",
      },
    ],
  },
  {
    id: "call-6",
    callerName: "Karan Verma",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    direction: "Transferred",
    phone: "+91 88776 55443",
    timestamp: "Today, 03:33 PM",
    duration: "01:48",
    durationSeconds: 108,
    intent: "Technical",
    outcome: "Transferred",
    isLead: true,
    status: "Transferred",
    aiSummary:
      "Caller experienced issues accessing the LMS dashboard after enrollment. Successfully warm-transferred to Senior IT Support.",
    sentiment: "Neutral",
    transferTarget: "IT Support (Ext. 204)",
    notes: "LMS password reset required.",
    transcript: [
      {
        speaker: "AI Receptionist",
        time: "00:02",
        text: "MAYA Business support desk, how may I assist your learning portal?",
      },
    ],
  },
  {
    id: "call-7",
    callerName: "Aditya Nair",
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    direction: "Incoming",
    phone: "+91 88774 22110",
    timestamp: "Today, 04:10 PM",
    duration: "05:27",
    durationSeconds: 327,
    intent: "Batch Timing",
    outcome: "Interested",
    isLead: true,
    status: "Completed",
    aiSummary:
      "Working professional seeking late evening 8 PM classes. Pre-registered for upcoming October cohort.",
    sentiment: "Positive",
    transferTarget: "Not Transferred",
    notes: "Seat reserved for 8 PM evening cohort.",
    transcript: [],
  },
  {
    id: "call-8",
    callerName: "Meera Joshi",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    direction: "Outgoing",
    phone: "+91 99881 22334",
    timestamp: "Today, 05:02 PM",
    duration: "02:11",
    durationSeconds: 131,
    intent: "Scholarship",
    outcome: "Follow-up",
    isLead: true,
    status: "Completed",
    aiSummary:
      "Discussed Women-in-Tech scholarship criteria. She scored 88% in diagnostic test; verification documents requested.",
    sentiment: "Positive",
    transferTarget: "Not Transferred",
    notes: "Merit test verification in progress.",
    transcript: [],
  },
  {
    id: "call-9",
    callerName: "Unknown",
    direction: "Missed",
    phone: "+91 91231 33445",
    timestamp: "Today, 05:44 PM",
    duration: "—",
    durationSeconds: 0,
    intent: "—",
    outcome: "—",
    isLead: false,
    status: "Missed",
    aiSummary:
      "Unanswered incoming call during peak shift changeover. Automatic retry schedule triggered.",
    sentiment: "Neutral",
    transferTarget: "Not Transferred",
    notes: "Retry scheduled for tomorrow 10 AM.",
    transcript: [],
  },
  {
    id: "call-10",
    callerName: "Vikram Rao",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    direction: "Incoming",
    phone: "+91 77665 99887",
    timestamp: "Today, 06:21 PM",
    duration: "03:49",
    durationSeconds: 229,
    intent: "Placement",
    outcome: "Interested",
    isLead: true,
    status: "Completed",
    aiSummary:
      "Inquired about hiring partner network and average starting packages for Full Stack graduates. Highly motivated to enroll.",
    sentiment: "Positive",
    transferTarget: "Not Transferred",
    notes: "High conversion intent. Sending brochure via WhatsApp.",
    transcript: [],
  },
];

// Audio Waveform Spectrum Bars (Apple-Grade Pro Audio Visualizer)
const WAVEFORM_BARS = [
  25, 45, 70, 30, 85, 60, 40, 95, 75, 50, 65, 90, 80, 35, 60, 75, 45, 90, 100,
  80, 55, 65, 40, 85, 90, 60, 45, 70, 50, 35, 80, 65, 45, 90, 75, 60, 40, 70,
  55, 30, 65, 80, 45, 30, 60, 75, 90, 40, 55, 70,
];

// Helper to extract caller initials (consistent with WorkspaceLeadsView)
function getInitials(name: string): string {
  if (!name || name.toLowerCase() === "unknown") return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Resilient caller avatar supporting image loading with elegant initials fallback and Apple-grade Unknown user icon
function CallerAvatar({
  name,
  avatarUrl,
  size = "md",
  isDark,
}: {
  name: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
  isDark: boolean;
}) {
  const [hasImgError, setHasImgError] = useState(false);
  const isUnknown = !name || name.toLowerCase() === "unknown";
  const initials = getInitials(name);

  const sizeClasses = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-8 h-8 text-[11px]",
    lg: "w-10 h-10 text-[13px]",
  }[size];

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-4.5 h-4.5",
  }[size];

  if (isUnknown) {
    return (
      <div
        className={`${sizeClasses} rounded-full flex items-center justify-center shrink-0 border transition-all duration-200 select-none ${
          isDark
            ? "bg-white/[0.04] border-white/10 text-neutral-400"
            : "bg-slate-100 border-slate-200 text-slate-500 shadow-2xs"
        }`}
        title="Unknown Caller"
      >
        <User className={`${iconSizes} stroke-[1.8]`} />
      </div>
    );
  }

  if (avatarUrl && !hasImgError) {
    return (
      <div
        className={`${sizeClasses} rounded-full relative shrink-0 overflow-hidden border shadow-2xs ${
          isDark ? "border-white/10" : "border-slate-200"
        }`}
      >
        <img
          src={avatarUrl}
          alt={name}
          onError={() => setHasImgError(true)}
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

export default function WorkspaceCallsView() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // State Management
  const [calls] = useState<CallItem[]>(INITIAL_CALLS);
  const [activeDirectionTab, setActiveDirectionTab] = useState<"All" | "Incoming" | "Outgoing" | "Missed">("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [selectedIntentFilter, setSelectedIntentFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("22 Sep 2025 – 28 Sep 2025");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Inspector Panel State
  const [selectedCallId, setSelectedCallId] = useState<string>("call-1");
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [inspectorTab, setInspectorTab] = useState<"Summary" | "Transcript" | "Analysis" | "Lead" | "Notes">("Summary");

  // Selection Checkbox State
  const [selectedCallIds, setSelectedCallIds] = useState<Set<string>>(new Set());

  // Audio Playback Simulation State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackSeconds, setPlaybackSeconds] = useState(20);
  const [playbackSpeed, setPlaybackSpeed] = useState<"1x" | "1.25x" | "1.5x" | "2x">("1x");
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);

  // Modals & Action States
  const [isMakeCallModalOpen, setIsMakeCallModalOpen] = useState(false);
  const [outboundNumber, setOutboundNumber] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search input keyboard shortcut handler
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsDatePickerOpen(false);
        setIsMakeCallModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Audio Playback Timer Simulation
  useEffect(() => {
    let interval: any;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setPlaybackSeconds((prev) => {
          if (prev >= 261) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // Currently Selected Call Details
  const selectedCall = useMemo(() => {
    return calls.find((c) => c.id === selectedCallId) || calls[0];
  }, [calls, selectedCallId]);

  // Tab Counts for Segmented Control
  const tabCounts = useMemo(() => ({
    all: 186,
    incoming: 120,
    outgoing: 66,
    missed: 18,
  }), []);

  // Filtered Calls Pipeline
  const filteredCalls = useMemo(() => {
    return calls.filter((c) => {
      if (activeDirectionTab === "Incoming" && c.direction !== "Incoming") return false;
      if (activeDirectionTab === "Outgoing" && c.direction !== "Outgoing") return false;
      if (activeDirectionTab === "Missed" && c.status !== "Missed") return false;
      if (selectedStatusFilter !== "ALL" && c.status !== selectedStatusFilter) return false;
      if (selectedIntentFilter !== "ALL" && c.intent !== selectedIntentFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.callerName.toLowerCase().includes(q);
        const matchesPhone = c.phone.includes(q);
        const matchesIntent = c.intent.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesIntent) return false;
      }
      return true;
    });
  }, [calls, activeDirectionTab, selectedStatusFilter, selectedIntentFilter, searchQuery]);

  // Checkbox selection toggle
  const toggleSelectAll = () => {
    if (selectedCallIds.size === filteredCalls.length) {
      setSelectedCallIds(new Set());
    } else {
      setSelectedCallIds(new Set(filteredCalls.map((c) => c.id)));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedCallIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCallIds(next);
  };

  // Time formatter mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Badge Style Resolvers
  const getOutcomeBadge = (outcome: CallOutcome) => {
    switch (outcome) {
      case "Interested":
        return isDark
          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25 shadow-[0_0_8px_-2px_rgba(52,211,153,0.25)]"
          : "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Follow-up":
        return isDark
          ? "bg-amber-500/10 text-amber-300 border-amber-500/25"
          : "bg-amber-50 text-amber-700 border-amber-200";
      case "Visited":
        return isDark
          ? "bg-sky-500/10 text-sky-300 border-sky-500/25"
          : "bg-sky-50 text-sky-700 border-sky-200";
      case "Not Interested":
        return isDark
          ? "bg-rose-500/10 text-rose-300 border-rose-500/25"
          : "bg-rose-50 text-rose-700 border-rose-200";
      case "Transferred":
        return isDark
          ? "bg-purple-500/10 text-purple-300 border-purple-500/25"
          : "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "text-neutral-500 border-transparent";
    }
  };

  const getStatusBadge = (status: CallStatus) => {
    switch (status) {
      case "Completed":
        return isDark
          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25"
          : "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Missed":
        return isDark
          ? "bg-rose-500/10 text-rose-300 border-rose-500/25"
          : "bg-rose-50 text-rose-700 border-rose-200";
      case "Transferred":
        return isDark
          ? "bg-purple-500/10 text-purple-300 border-purple-500/25"
          : "bg-purple-50 text-purple-700 border-purple-200";
    }
  };

  const getStatusDotColor = (status: CallStatus) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-400";
      case "Missed":
        return "bg-rose-400";
      case "Transferred":
        return "bg-purple-400";
    }
  };

  const getOutcomeDotColor = (outcome: CallOutcome) => {
    switch (outcome) {
      case "Interested":
        return "bg-emerald-400";
      case "Follow-up":
        return "bg-amber-400";
      case "Visited":
        return "bg-sky-400";
      case "Not Interested":
        return "bg-rose-400";
      case "Transferred":
        return "bg-purple-400";
      default:
        return "bg-neutral-400";
    }
  };

  const getDirectionDotColor = (direction: CallDirection) => {
    switch (direction) {
      case "Incoming":
        return "bg-emerald-400";
      case "Outgoing":
        return "bg-sky-400";
      case "Missed":
        return "bg-rose-400";
      case "Transferred":
        return "bg-amber-400";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 min-w-0 h-full flex flex-col justify-between gap-3.5 overflow-hidden min-h-0 select-none"
    >
      {/* Toast Feedback */}
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
      {/* 1. EDITORIAL HEADER & ACTION BAR (STRICT WORKSPACE TYPOGRAPHY)       */}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none shrink-0">
        <div>
          <span
            className={`text-[9px] sm:text-[9.5px] font-mono tracking-[0.2em] uppercase font-semibold block ${
              isDark ? "text-neutral-400" : "text-slate-500"
            }`}
          >
            CALLS & CONVERSATIONS
          </span>
          <h1
            className={`text-[23px] sm:text-[25px] font-light tracking-[-0.03em] leading-tight mt-0.5 ${
              isDark ? "text-white" : "text-[#0B0F17]"
            }`}
          >
            Every conversation counts.
          </h1>
          <p
            className={`text-[12.5px] sm:text-[13px] font-normal leading-normal mt-0.5 ${
              isDark ? "text-[#9ca3af]" : "text-[#64748B]"
            }`}
          >
            Track, analyse and act on every call with the power of AI.
          </p>
        </div>

        {/* Action Controls: Search, Make a Call, Date Picker */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* Search Pill */}
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
              placeholder="Search calls, phone number, or lead..."
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

          {/* Primary CTA: Make a Call (Apple-Grade Pill Button) */}
          <motion.button
            type="button"
            onClick={() => setIsMakeCallModalOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`inline-flex items-center gap-1.5 h-8.5 px-4 rounded-full text-[12px] font-medium transition-all duration-200 cursor-pointer shadow-sm select-none ${
              isDark
                ? "bg-white text-black hover:bg-neutral-100 font-semibold shadow-[0_2px_10px_rgba(255,255,255,0.08)]"
                : "bg-[#0B0F17] text-white hover:bg-slate-800 font-semibold shadow-xs"
            }`}
          >
            <Phone className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Make a Call</span>
          </motion.button>

          {/* Date Range Selector Pill */}
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
                  "Today",
                  "Yesterday",
                  "22 Sep 2025 – 28 Sep 2025",
                  "This Month (Sep 2025)",
                  "Last 30 Days",
                ].map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => {
                      setSelectedDateRange(range);
                      setIsDatePickerOpen(false);
                      showToast(`Date filter: ${range}`);
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
      {/* 2. SLEEK KPI METRICS STRIP (PREMIUM VELVET TEXTURE & LINEAR STROKES) */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 shrink-0 select-none">
        {CALLS_METRICS_DATA.map((card, idx) => {
          const Icon = card.icon;
          const strokeColor = isDark ? card.strokeColorDark : card.strokeColorLight;

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
                      ? "bg-white/[0.04] border-white/[0.08] text-neutral-300 group-hover:border-white/20 group-hover:text-white"
                      : "bg-slate-50 border-slate-200 text-slate-700 group-hover:border-slate-300"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 stroke-[1.8]" />
                </div>
              </div>

              {/* Middle Row: Large Value + Sparkline Backdrop */}
              <div className="flex items-baseline justify-between gap-2 my-2 relative z-10">
                <span
                  className={`text-[23px] sm:text-[25px] font-light tracking-[-0.03em] tabular-nums leading-none ${
                    isDark ? "text-white" : "text-[#0B0F17]"
                  }`}
                >
                  {card.value}
                </span>

                {/* Subtle Mini SVG Sparkline */}
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
      {/* 3. MAIN STAGE: DE-CLUTTERED DATA TABLE & SLIDE-IN INSPECTOR          */}
      {/* ==================================================================== */}
      <div className="flex-1 w-full flex gap-3.5 overflow-hidden min-h-0">
        {/* Main Table Surface */}
        <div
          className={`flex-1 min-w-0 h-full rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
            isDark
              ? "bg-gradient-to-b from-[#111724]/95 via-[#0c101a]/95 to-[#080b12]/98 border-white/[0.09] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_30px_rgba(0,0,0,0.55)]"
              : "bg-gradient-to-b from-white via-white to-[#F8FAFC] border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_4px_20px_rgba(15,23,42,0.06)]"
          }`}
        >
          {/* Toolbar: Segmented Controls + Filter Dropdowns */}
          <div
            className={`p-3 px-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
              isDark ? "border-white/[0.06]" : "border-slate-100"
            }`}
          >
            {/* Segmented Direction Filter Pills (Apple Spring Segmented Style) */}
            <div
              className={`inline-flex items-center p-0.75 rounded-full border ${
                isDark ? "bg-[#090C12]/90 border-white/[0.08]" : "bg-slate-100/80 border-slate-200/60"
              }`}
            >
              {[
                { key: "All", label: "All Calls", count: tabCounts.all },
                { key: "Incoming", label: "Incoming", count: tabCounts.incoming },
                { key: "Outgoing", label: "Outgoing", count: tabCounts.outgoing },
                { key: "Missed", label: "Missed", count: tabCounts.missed },
              ].map((tab) => {
                const isActive = activeDirectionTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveDirectionTab(tab.key as any)}
                    className={`relative inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11.5px] font-medium transition-colors duration-200 cursor-pointer select-none ${
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
                        layoutId="active-calls-filter-pill"
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
              {/* All Status Dropdown */}
              <div className="relative">
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className={`h-8 pl-3 pr-7 rounded-full text-[11.5px] font-medium border appearance-none cursor-pointer outline-none transition-all duration-200 ${
                    isDark
                      ? "bg-[#0b0e14] border-white/[0.08] text-neutral-200 hover:border-white/20"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <option value="ALL">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Missed">Missed</option>
                  <option value="Transferred">Transferred</option>
                </select>
                <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* All Intent Dropdown */}
              <div className="relative">
                <select
                  value={selectedIntentFilter}
                  onChange={(e) => setSelectedIntentFilter(e.target.value)}
                  className={`h-8 pl-3 pr-7 rounded-full text-[11.5px] font-medium border appearance-none cursor-pointer outline-none transition-all duration-200 ${
                    isDark
                      ? "bg-[#0b0e14] border-white/[0.08] text-neutral-200 hover:border-white/20"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <option value="ALL">All Intent</option>
                  <option value="Course Enquiry">Course Enquiry</option>
                  <option value="Fee Details">Fee Details</option>
                  <option value="Counselling">Counselling</option>
                  <option value="Admission">Admission</option>
                  <option value="Technical">Technical</option>
                  <option value="Batch Timing">Batch Timing</option>
                  <option value="Scholarship">Scholarship</option>
                  <option value="Placement">Placement</option>
                </select>
                <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Reset / Options Pill Button */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedStatusFilter("ALL");
                  setSelectedIntentFilter("ALL");
                  setSearchQuery("");
                  showToast("Filters reset to default.");
                }}
                className={`h-8 px-2.5 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isDark
                    ? "bg-[#0b0e14] border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20"
                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 shadow-2xs hover:border-slate-300"
                }`}
                title="Filter options & reset"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>

          {/* Table Container - no-scrollbar removes ugly Windows scrollbar while retaining smooth scrolling */}
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
                        filteredCalls.length > 0 &&
                        selectedCallIds.size === filteredCalls.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 accent-neutral-800 cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-3">Caller</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Date & Time ↓</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Intent</th>
                  <th className="py-2.5 px-3">Outcome</th>
                  <th className="py-2.5 px-3">Lead</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 pr-4 text-right"></th>
                </tr>
              </thead>

              <tbody className={`divide-y ${isDark ? "divide-white/[0.04]" : "divide-slate-100"}`}>
                {filteredCalls.map((call) => {
                  const isSelected = selectedCallId === call.id;
                  const isChecked = selectedCallIds.has(call.id);

                  return (
                    <tr
                      key={call.id}
                      onClick={() => {
                        setSelectedCallId(call.id);
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
                      <td className="py-2.5 pl-4 pr-2" onClick={(e) => toggleSelectRow(call.id, e)}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-slate-300 accent-neutral-800 cursor-pointer"
                        />
                      </td>

                      {/* Caller */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <CallerAvatar
                            name={call.callerName}
                            avatarUrl={call.avatarUrl}
                            size="sm"
                            isDark={isDark}
                          />

                          <div className="min-w-0">
                            <span
                              className={`font-medium block leading-tight truncate ${
                                isDark ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {call.callerName}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getDirectionDotColor(call.direction)}`} />
                              <span
                                className={`text-[10px] leading-none ${
                                  isDark ? "text-neutral-400" : "text-slate-500"
                                }`}
                              >
                                {call.direction}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-2.5 px-3 font-mono text-[11.5px] tabular-nums whitespace-nowrap text-neutral-400">
                        {call.phone}
                      </td>

                      {/* Date & Time */}
                      <td className={`py-2.5 px-3 whitespace-nowrap ${isDark ? "text-neutral-300" : "text-slate-700"}`}>
                        {call.timestamp}
                      </td>

                      {/* Duration */}
                      <td className="py-2.5 px-3 font-mono text-[11.5px] tabular-nums whitespace-nowrap text-neutral-400">
                        {call.duration}
                      </td>

                      {/* Intent */}
                      <td className={`py-2.5 px-3 whitespace-nowrap font-medium ${isDark ? "text-neutral-200" : "text-slate-800"}`}>
                        {call.intent}
                      </td>

                      {/* Outcome Badge */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {call.outcome !== "—" ? (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-medium tracking-wider border uppercase select-none transition-colors duration-150 ${getOutcomeBadge(
                              call.outcome
                            )}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getOutcomeDotColor(call.outcome)}`} />
                            <span>{call.outcome}</span>
                          </span>
                        ) : (
                          <span className="text-neutral-500 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* Lead */}
                      <td className={`py-2.5 px-3 whitespace-nowrap ${call.isLead ? (isDark ? "text-neutral-200" : "text-slate-800") : "text-neutral-500"}`}>
                        {call.isLead ? "Yes" : "No"}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-medium tracking-wider border uppercase select-none transition-colors duration-150 ${getStatusBadge(
                            call.status
                          )}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusDotColor(call.status)}`} />
                          <span>{call.status}</span>
                        </span>
                      </td>

                      {/* Actions: Audio Play Trigger + Menu */}
                      <td className="py-2.5 pr-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCallId(call.id);
                              setIsInspectorOpen(true);
                              setIsPlayingAudio((prev) => (selectedCallId === call.id ? !prev : true));
                            }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                              isPlayingAudio && selectedCallId === call.id
                                ? isDark
                                  ? "bg-white text-black shadow-xs"
                                  : "bg-slate-900 text-white shadow-xs"
                                : isDark
                                ? "text-neutral-400 hover:text-white hover:bg-white/10"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            }`}
                            title="Play Audio"
                          >
                            {isPlayingAudio && selectedCallId === call.id ? (
                              <Pause className="w-3 h-3 fill-current" />
                            ) : (
                              <Play className="w-3 h-3 fill-current ml-0.5" />
                            )}
                          </motion.button>

                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              showToast(`Call options for ${call.callerName}`);
                            }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                              isDark
                                ? "text-neutral-400 hover:text-white hover:bg-white/10"
                                : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                            }`}
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer: Sleek, Uncluttered Apple Status Bar */}
          <div
            className={`p-2.5 px-4 flex items-center justify-between border-t shrink-0 text-[11px] select-none ${
              isDark ? "border-white/[0.06] text-[#8e95a5]" : "border-slate-100 text-slate-500"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Showing 1–10 of 186 calls</span>
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

              <span className="px-1 tabular-nums">Page 1 of 19</span>

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
        {/* RIGHT DRAWER: "CALL DETAILS" INSPECTOR                             */}
        {/* ================================================================== */}
        <AnimatePresence>
          {isInspectorOpen && (
            <motion.div
              key="call-details-inspector"
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
                <h2 className={`text-[13.5px] font-semibold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                  Call Details
                </h2>
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

              {/* Inspector Content - no-scrollbar keeps UX clean and sleek */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 min-h-0">
                {/* 1. Caller Profile Card */}
                <div className="flex items-center gap-3">
                  <CallerAvatar
                    name={selectedCall.callerName}
                    avatarUrl={selectedCall.avatarUrl}
                    size="lg"
                    isDark={isDark}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-[14px] font-medium leading-tight truncate ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {selectedCall.callerName}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-medium tracking-wider border uppercase select-none ${getStatusBadge(
                          selectedCall.status
                        )}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusDotColor(selectedCall.status)}`} />
                        <span>{selectedCall.status}</span>
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-neutral-400 mt-0.5 flex items-center gap-1.5">
                      <span>{selectedCall.phone}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(selectedCall.phone);
                          showToast("Phone number copied.");
                        }}
                        className="text-neutral-500 hover:text-neutral-300 cursor-pointer"
                        title="Copy phone"
                      >
                        <Copy className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <div className="text-[10px] text-neutral-500 mt-0.5">
                      {selectedCall.timestamp} • {selectedCall.direction}
                    </div>
                  </div>
                </div>

                {/* 2. Apple Waveform Audio Player */}
                <div
                  className={`p-3 rounded-2xl border flex flex-col gap-2 transition-all ${
                    isDark
                      ? "bg-[#06080e]/80 border-white/[0.08]"
                      : "bg-slate-50/90 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10.5px] font-mono text-neutral-400 px-0.5">
                    <span className="tabular-nums font-medium text-emerald-400">
                      {formatTime(playbackSeconds)}
                    </span>
                    <span className="tabular-nums">
                      {selectedCall.duration !== "—" ? selectedCall.duration : "00:00"}
                    </span>
                  </div>

                  {/* Waveform Bars Spectrum */}
                  <div className="flex items-center gap-0.75 h-7 w-full px-0.5">
                    {WAVEFORM_BARS.map((height, idx) => {
                      const isPlayed = idx < (playbackSeconds / 261) * WAVEFORM_BARS.length;
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            const newSec = Math.round((idx / WAVEFORM_BARS.length) * 261);
                            setPlaybackSeconds(newSec);
                          }}
                          className={`flex-1 rounded-full transition-all duration-100 cursor-pointer ${
                            isPlayed
                              ? "bg-emerald-400"
                              : isDark
                              ? "bg-white/15 hover:bg-white/30"
                              : "bg-slate-300 hover:bg-slate-400"
                          }`}
                          style={{ height: `${height}%` }}
                        />
                      );
                    })}
                  </div>

                  {/* Player Controls Bar */}
                  <div className="flex items-center justify-between pt-0.5">
                    <button
                      type="button"
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-xs ${
                        isDark
                          ? "bg-white text-black hover:bg-neutral-200"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      {isPlayingAudio ? (
                        <Pause className="w-3 h-3 fill-current" />
                      ) : (
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)}
                          className={`h-6 px-2 rounded-md text-[10px] font-mono border cursor-pointer inline-flex items-center gap-1 ${
                            isDark
                              ? "bg-white/[0.06] border-white/10 text-neutral-300 hover:text-white"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span>{playbackSpeed}</span>
                          <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                        </button>

                        {isSpeedMenuOpen && (
                          <div
                            className={`absolute right-0 bottom-7 z-30 w-16 p-1 rounded-lg border shadow-lg ${
                              isDark ? "bg-[#090c12] border-white/15 text-white" : "bg-white border-slate-200 text-slate-900"
                            }`}
                          >
                            {(["1x", "1.25x", "1.5x", "2x"] as const).map((spd) => (
                              <button
                                key={spd}
                                type="button"
                                onClick={() => {
                                  setPlaybackSpeed(spd);
                                  setIsSpeedMenuOpen(false);
                                }}
                                className={`w-full text-center py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                                  playbackSpeed === spd
                                    ? isDark
                                      ? "bg-white/15 text-white font-semibold"
                                      : "bg-slate-100 font-bold"
                                    : "hover:bg-white/5"
                                }`}
                              >
                                {spd}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => showToast(`Audio downloaded for ${selectedCall.callerName}.`)}
                        className={`w-6 h-6 rounded-md border flex items-center justify-center cursor-pointer transition-all ${
                          isDark
                            ? "bg-white/[0.06] border-white/10 text-neutral-300 hover:text-white"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                        title="Download audio recording"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Segmented Navigation Tabs */}
                <div
                  className={`flex items-center border-b text-[11.5px] font-medium shrink-0 ${
                    isDark ? "border-white/[0.06]" : "border-slate-200"
                  }`}
                >
                  {(["Summary", "Transcript", "Analysis", "Lead", "Notes"] as const).map((tab) => {
                    const isActive = inspectorTab === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setInspectorTab(tab)}
                        className={`relative pb-2 px-2.5 transition-colors cursor-pointer ${
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
                            layoutId="callDetailsTabUnderline"
                            className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                              isDark ? "bg-white" : "bg-slate-900"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Views */}
                {inspectorTab === "Summary" && (
                  <div className="space-y-3.5">
                    {/* Metadata 2x2 Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div
                        className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                          isDark ? "bg-[#06080e]/60 border-white/[0.06]" : "bg-slate-50 border-slate-100"
                        }`}
                      >
                        <div className="w-5.5 h-5.5 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9.5px] text-neutral-500 block leading-tight">Intent</span>
                          <span className={`font-medium block leading-tight truncate mt-0.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                            {selectedCall.intent}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                          isDark ? "bg-[#06080e]/60 border-white/[0.06]" : "bg-slate-50 border-slate-100"
                        }`}
                      >
                        <div className="w-5.5 h-5.5 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                          <PhoneIncoming className="w-3 h-3" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9.5px] text-neutral-500 block leading-tight">Call Type</span>
                          <span className={`font-medium block leading-tight truncate mt-0.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                            {selectedCall.direction}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                          isDark ? "bg-[#06080e]/60 border-white/[0.06]" : "bg-slate-50 border-slate-100"
                        }`}
                      >
                        <div className="w-5.5 h-5.5 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-3 h-3" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9.5px] text-neutral-500 block leading-tight">Outcome</span>
                          <span className={`font-medium block leading-tight truncate mt-0.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                            {selectedCall.outcome}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                          isDark ? "bg-[#06080e]/60 border-white/[0.06]" : "bg-slate-50 border-slate-100"
                        }`}
                      >
                        <div className="w-5.5 h-5.5 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                          <Clock className="w-3 h-3" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9.5px] text-neutral-500 block leading-tight">Duration</span>
                          <span className={`font-medium block leading-tight truncate mt-0.5 font-mono ${isDark ? "text-white" : "text-slate-900"}`}>
                            {selectedCall.duration}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                          isDark ? "bg-[#06080e]/60 border-white/[0.06]" : "bg-slate-50 border-slate-100"
                        }`}
                      >
                        <div className="w-5.5 h-5.5 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                          <User className="w-3 h-3" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9.5px] text-neutral-500 block leading-tight">Lead</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className={`font-medium truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                              {selectedCall.callerName}
                            </span>
                            <span className="text-[10px] text-sky-400 hover:underline cursor-pointer">
                              View →
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                          isDark ? "bg-[#06080e]/60 border-white/[0.06]" : "bg-slate-50 border-slate-100"
                        }`}
                      >
                        <div className="w-5.5 h-5.5 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                          <PhoneForwarded className="w-3 h-3" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9.5px] text-neutral-500 block leading-tight">Transfer Status</span>
                          <span className={`font-medium block leading-tight truncate mt-0.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                            {selectedCall.transferTarget || "Not Transferred"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AI Call Summary Card */}
                    <div
                      className={`p-3.5 rounded-2xl border space-y-1.5 ${
                        isDark
                          ? "bg-gradient-to-b from-[#101422] to-[#0a0d16] border-indigo-500/20"
                          : "bg-indigo-50/70 border-indigo-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                            AI
                          </div>
                          <span className={`text-[12px] font-semibold ${isDark ? "text-white" : "text-indigo-950"}`}>
                            AI Call Summary
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setInspectorTab("Transcript")}
                          className="text-[10px] font-mono font-medium text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Full Transcript</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <p
                        className={`text-[11.5px] leading-relaxed font-normal ${
                          isDark ? "text-neutral-300" : "text-indigo-900/90"
                        }`}
                      >
                        {selectedCall.aiSummary}
                      </p>
                    </div>

                    {/* Suggested Actions: 4 Refined Buttons */}
                    <div>
                      <span className={`text-[11.5px] font-semibold block mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                        Suggested Actions
                      </span>
                      <div className="grid grid-cols-4 gap-2 text-center select-none">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => showToast(`Follow-up scheduled for ${selectedCall.callerName}.`)}
                          className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isDark
                              ? "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20 text-white"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                          }`}
                        >
                          <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                            <Calendar className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[10px] leading-tight font-medium">Create Follow-up</span>
                        </motion.button>

                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => showToast(`WhatsApp details sent to ${selectedCall.phone}.`)}
                          className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isDark
                              ? "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20 text-white"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                          }`}
                        >
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[10px] leading-tight font-medium">Send WhatsApp</span>
                        </motion.button>

                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setInspectorTab("Notes")}
                          className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isDark
                              ? "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20 text-white"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                          }`}
                        >
                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[10px] leading-tight font-medium">Add Note</span>
                        </motion.button>

                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => showToast(`${selectedCall.callerName} converted to CRM Lead.`)}
                          className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isDark
                              ? "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20 text-white"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                          }`}
                        >
                          <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                            <UserPlus className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[10px] leading-tight font-medium">Convert to Lead</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}

                {inspectorTab === "Transcript" && (
                  <div className="space-y-2.5">
                    {selectedCall.transcript.length > 0 ? (
                      selectedCall.transcript.map((t, idx) => {
                        const isAI = t.speaker === "AI Receptionist";
                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-2xl border space-y-1 ${
                              isAI
                                ? isDark
                                  ? "bg-indigo-950/20 border-indigo-500/20"
                                  : "bg-indigo-50/50 border-indigo-100"
                                : isDark
                                ? "bg-white/[0.02] border-white/[0.06]"
                                : "bg-slate-50 border-slate-100"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px]">
                              <span
                                className={`font-semibold ${
                                  isAI ? "text-indigo-400" : isDark ? "text-neutral-300" : "text-slate-800"
                                }`}
                              >
                                {t.speaker}
                              </span>
                              <span className="text-neutral-500 font-mono">{t.time}</span>
                            </div>
                            <p
                              className={`text-[11.5px] leading-relaxed ${
                                isDark ? "text-neutral-300" : "text-slate-700"
                              }`}
                            >
                              {t.text}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-neutral-500 text-[12px]">
                        No audio transcript recorded for missed call.
                      </div>
                    )}
                  </div>
                )}

                {inspectorTab === "Analysis" && (
                  <div className="space-y-3 text-[12px]">
                    <div
                      className={`p-3 rounded-2xl border space-y-2 ${
                        isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      <span className="text-[10.5px] text-neutral-400 uppercase font-mono tracking-wider">
                        Call Sentiment
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 font-semibold text-[13px]">
                          88% Positive
                        </span>
                        <span className="text-[11px] text-neutral-400">High Conversion Intent</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: "88%" }} />
                      </div>
                    </div>

                    <div
                      className={`p-3 rounded-2xl border space-y-2 ${
                        isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      <span className="text-[10.5px] text-neutral-400 uppercase font-mono tracking-wider">
                        Key Discussion Topics
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {["Data Science", "Weekend Batch", "Placement Assistance", "Installments"].map((kw) => (
                          <span
                            key={kw}
                            className={`px-2 py-0.5 rounded-lg text-[10.5px] border ${
                              isDark
                                ? "bg-white/5 border-white/10 text-neutral-300"
                                : "bg-white border-slate-200 text-slate-700"
                            }`}
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {inspectorTab === "Lead" && (
                  <div className="space-y-3 text-[12px]">
                    <div
                      className={`p-3.5 rounded-2xl border space-y-2.5 ${
                        isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Full Name</span>
                        <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                          {selectedCall.callerName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Phone</span>
                        <span className="font-mono text-neutral-300">{selectedCall.phone}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Lead Status</span>
                        <span className="text-emerald-400 font-semibold">Active Qualified</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Assigned Counsellor</span>
                        <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                          Neha Sen
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {inspectorTab === "Notes" && (
                  <div className="space-y-3">
                    <textarea
                      rows={4}
                      defaultValue={selectedCall.notes}
                      placeholder="Add an internal note regarding this conversation..."
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
                      onClick={() => showToast("Note saved.")}
                      className={`w-full py-2.5 rounded-full text-[12px] font-medium transition-all cursor-pointer ${
                        isDark ? "bg-white text-black hover:bg-neutral-200 font-semibold" : "bg-slate-900 text-white hover:bg-slate-800 font-semibold"
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
      {/* 4. MODAL: "MAKE A CALL" DIALER SIMULATION                            */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {isMakeCallModalOpen && (
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
                onClick={() => setIsMakeCallModalOpen(false)}
                className="absolute top-4.5 right-4.5 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Phone className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-[15.5px] font-semibold tracking-tight">Initiate Outbound Call</h3>
                  <p className="text-[12px] text-neutral-400">
                    Deploy MAYA Autonomous AI Receptionist
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={outboundNumber}
                    onChange={(e) => setOutboundNumber(e.target.value)}
                    placeholder="+91 98765 00000"
                    className={`w-full h-10 px-3.5 rounded-xl border text-[13px] outline-none font-mono ${
                      isDark
                        ? "bg-[#06080e] border-white/15 text-white focus:border-white/40"
                        : "bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-500"
                    }`}
                  />
                </div>

                <div className="p-3.5 rounded-2xl border bg-white/[0.02] border-white/10 text-[11.5px] space-y-1">
                  <span className="font-semibold block text-indigo-400">Autonomous Voice Engine</span>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">
                    MAYA will answer queries, handle counselling, schedule follow-ups, and sync audio recordings into your front-office dashboard.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsMakeCallModalOpen(false)}
                    className={`flex-1 h-9.5 rounded-full text-[12px] font-medium border cursor-pointer ${
                      isDark
                        ? "border-white/10 text-neutral-300 hover:bg-white/5"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsMakeCallModalOpen(false);
                      showToast(`Calling ${outboundNumber || "+91 98765 43210"} via MAYA...`);
                    }}
                    className={`flex-1 h-9.5 rounded-full text-[12px] font-medium cursor-pointer shadow-md flex items-center justify-center gap-1.5 ${
                      isDark ? "bg-white text-black hover:bg-neutral-100 font-semibold" : "bg-[#0B0F17] text-white hover:bg-slate-800 font-semibold"
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Dial Now</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
