"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  User,
  Bookmark,
  Users,
  Search,
  Plus,
  MoreHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  Globe,
  MessageCircle,
  Copy,
  CheckCircle2,
  List,
  LayoutGrid,
  X,
  MapPin,
  Tag,
  ShieldCheck,
  Check,
  Clock,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

// ============================================================================
// TYPES & DATA CONTRACTS
// ============================================================================

export type ContactType = "Student" | "Prospect" | "Client";
export type ContactStatus = "Active" | "Interested" | "Follow-up" | "Inactive";
export type InteractionChannel = "Call" | "Email" | "Appointment" | "Website" | "Chat";

export interface ContactItem {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
  organization: string;
  type: ContactType;
  email: string;
  phone: string;
  status: ContactStatus;
  lastInteractionTime: string;
  lastInteractionChannel: InteractionChannel;
  tags: string[];
  source: string;
  joinedDate: string;
  assignedStaff: {
    name: string;
    avatarUrl?: string;
    initials: string;
  };
  address: string;
  notes: {
    author: string;
    avatarUrl?: string;
    timeAgo: string;
    content: string;
  }[];
}

interface MetricCardItem {
  id: string;
  label: string;
  value: number;
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
// 4 TOP KPI METRIC CARDS
// ============================================================================

const CONTACTS_METRICS: MetricCardItem[] = [
  {
    id: "total-contacts",
    label: "Total Contacts",
    value: 248,
    changePct: "↑ 12%",
    isPositive: true,
    timeframe: "vs last month",
    icon: BookOpen,
    iconBgLight: "bg-sky-50 border-sky-100",
    iconColorLight: "text-sky-600",
    iconBgDark: "bg-sky-500/10 border-sky-500/20",
    iconColorDark: "text-sky-400",
    sparklineD: "M 0 24 C 20 22, 45 16, 70 12 C 95 8, 105 5, 120 3",
    strokeDark: "#38bdf8",
    strokeLight: "#0284c7",
  },
  {
    id: "students",
    label: "Students",
    value: 132,
    changePct: "↑ 18%",
    isPositive: true,
    timeframe: "vs last month",
    icon: User,
    iconBgLight: "bg-amber-50 border-amber-100",
    iconColorLight: "text-amber-600",
    iconBgDark: "bg-amber-500/10 border-amber-500/20",
    iconColorDark: "text-amber-400",
    sparklineD: "M 0 25 C 25 24, 45 18, 70 14 C 95 9, 105 6, 120 4",
    strokeDark: "#fbbf24",
    strokeLight: "#d97706",
  },
  {
    id: "prospects",
    label: "Prospects",
    value: 86,
    changePct: "↑ 6%",
    isPositive: true,
    timeframe: "vs last month",
    icon: Bookmark,
    iconBgLight: "bg-sky-50 border-sky-100",
    iconColorLight: "text-sky-600",
    iconBgDark: "bg-sky-500/10 border-sky-500/20",
    iconColorDark: "text-sky-400",
    sparklineD: "M 0 20 C 25 18, 50 15, 75 13 C 100 11, 110 8, 120 5",
    strokeDark: "#38bdf8",
    strokeLight: "#0284c7",
  },
  {
    id: "clients",
    label: "Clients",
    value: 30,
    changePct: "↑ 25%",
    isPositive: true,
    timeframe: "vs last month",
    icon: Users,
    iconBgLight: "bg-purple-50 border-purple-100",
    iconColorLight: "text-purple-600",
    iconBgDark: "bg-purple-500/10 border-purple-500/20",
    iconColorDark: "text-purple-400",
    sparklineD: "M 0 26 C 20 25, 45 18, 70 12 C 95 7, 105 4, 120 2",
    strokeDark: "#c084fc",
    strokeLight: "#7c3aed",
  },
];

// ============================================================================
// SEED CONTACT RECORDS (10 ROWS EXACT TO REFERENCE)
// ============================================================================

const INITIAL_CONTACTS: ContactItem[] = [
  {
    id: "contact-1",
    name: "Rohan Mehta",
    initials: "RM",
    organization: "ABC Institute",
    type: "Student",
    email: "rohan.mehta@gmail.com",
    phone: "+91 98765 43210",
    status: "Active",
    lastInteractionTime: "2 hours ago",
    lastInteractionChannel: "Call",
    tags: ["Python", "Batch A"],
    source: "Website",
    joinedDate: "12 Aug 2025",
    assignedStaff: {
      name: "Siddharth",
      initials: "SK",
    },
    address: "Jaipur, Rajasthan, India",
    notes: [
      {
        author: "Siddharth",
        timeAgo: "2 days ago",
        content: "Interested in Python full stack course. Asked for weekend batch details.",
      },
      {
        author: "Ananya",
        timeAgo: "1 week ago",
        content: "Follow up next week after demo class.",
      },
    ],
  },
  {
    id: "contact-2",
    name: "Priya Sharma",
    initials: "PS",
    organization: "Freelancer",
    type: "Prospect",
    email: "priya.sharma@mail.com",
    phone: "+91 98765 22110",
    status: "Interested",
    lastInteractionTime: "1 day ago",
    lastInteractionChannel: "Email",
    tags: ["UI/UX", "Web"],
    source: "Referral",
    joinedDate: "20 Aug 2025",
    assignedStaff: {
      name: "Neha Sharma",
      initials: "NS",
    },
    address: "Mumbai, Maharashtra, India",
    notes: [
      {
        author: "Neha Sharma",
        timeAgo: "1 day ago",
        content: "Dispatched UI/UX design masterclass brochure with early-bird coupon.",
      },
    ],
  },
  {
    id: "contact-3",
    name: "Aman Verma",
    initials: "AV",
    organization: "XYZ University",
    type: "Student",
    email: "aman.verma@uni.in",
    phone: "+91 91234 56789",
    status: "Active",
    lastInteractionTime: "1 day ago",
    lastInteractionChannel: "Appointment",
    tags: ["Data Science", "Batch B"],
    source: "Campus Event",
    joinedDate: "05 Aug 2025",
    assignedStaff: {
      name: "Amit Kumar",
      initials: "AK",
    },
    address: "Bengaluru, Karnataka, India",
    notes: [
      {
        author: "Amit Kumar",
        timeAgo: "1 day ago",
        content: "Attended on-campus counselling session. Enrolled into executive Batch B.",
      },
    ],
  },
  {
    id: "contact-4",
    name: "Sneha Kapoor",
    initials: "SK",
    organization: "TechWorks",
    type: "Client",
    email: "sneha@techworks.in",
    phone: "+91 99887 66544",
    status: "Active",
    lastInteractionTime: "3 days ago",
    lastInteractionChannel: "Call",
    tags: ["Corporate", "Workshop"],
    source: "Inbound",
    joinedDate: "15 Jul 2025",
    assignedStaff: {
      name: "Siddharth",
      initials: "SK",
    },
    address: "Gurugram, Haryana, India",
    notes: [
      {
        author: "Siddharth",
        timeAgo: "3 days ago",
        content: "Corporate AI workshop contract finalized for 40 engineering leads.",
      },
    ],
  },
  {
    id: "contact-5",
    name: "Karan Patel",
    initials: "KP",
    organization: "Self Learner",
    type: "Prospect",
    email: "karan.patel@mail.com",
    phone: "+91 90012 34567",
    status: "Follow-up",
    lastInteractionTime: "3 days ago",
    lastInteractionChannel: "Chat",
    tags: ["React", "Frontend"],
    source: "Social Ad",
    joinedDate: "28 Aug 2025",
    assignedStaff: {
      name: "Rohan Varma",
      initials: "RV",
    },
    address: "Ahmedabad, Gujarat, India",
    notes: [
      {
        author: "Rohan Varma",
        timeAgo: "3 days ago",
        content: "Evaluating course roadmap against college schedule.",
      },
    ],
  },
  {
    id: "contact-6",
    name: "Isha Gupta",
    initials: "IG",
    organization: "Design Studio",
    type: "Client",
    email: "isha.gupta@design.co",
    phone: "+91 88990 11223",
    status: "Active",
    lastInteractionTime: "5 days ago",
    lastInteractionChannel: "Email",
    tags: ["Design", "UI/UX"],
    source: "Partner Referral",
    joinedDate: "10 Jun 2025",
    assignedStaff: {
      name: "Neha Sharma",
      initials: "NS",
    },
    address: "New Delhi, India",
    notes: [
      {
        author: "Neha Sharma",
        timeAgo: "5 days ago",
        content: "Hiring partnership agreement renewed for another term.",
      },
    ],
  },
  {
    id: "contact-7",
    name: "Aditya Singh",
    initials: "AS",
    organization: "XYZ College",
    type: "Student",
    email: "aditya.singh@xyz.in",
    phone: "+91 77889 99011",
    status: "Inactive",
    lastInteractionTime: "1 week ago",
    lastInteractionChannel: "Call",
    tags: ["C++", "DSA"],
    source: "Direct",
    joinedDate: "01 Jun 2025",
    assignedStaff: {
      name: "Ishita Roy",
      initials: "IR",
    },
    address: "Pune, Maharashtra, India",
    notes: [
      {
        author: "Ishita Roy",
        timeAgo: "1 week ago",
        content: "Paused learning program due to semester examination.",
      },
    ],
  },
  {
    id: "contact-8",
    name: "Neha Jain",
    initials: "NJ",
    organization: "Freelancer",
    type: "Prospect",
    email: "neha.jain@mail.com",
    phone: "+91 88776 65544",
    status: "Interested",
    lastInteractionTime: "1 week ago",
    lastInteractionChannel: "Website",
    tags: ["AI/ML", "Python"],
    source: "Organic Search",
    joinedDate: "02 Sep 2025",
    assignedStaff: {
      name: "Amit Kumar",
      initials: "AK",
    },
    address: "Hyderabad, Telangana, India",
    notes: [
      {
        author: "Amit Kumar",
        timeAgo: "1 week ago",
        content: "Downloaded AI/ML master syllabus brochure from website landing page.",
      },
    ],
  },
  {
    id: "contact-9",
    name: "Vikram Rao",
    initials: "VR",
    organization: "Rao Solutions",
    type: "Client",
    email: "vikram@raosol.com",
    phone: "+91 99876 55433",
    status: "Active",
    lastInteractionTime: "1 week ago",
    lastInteractionChannel: "Appointment",
    tags: ["Corporate", "Onsite"],
    source: "Direct Inbound",
    joinedDate: "18 May 2025",
    assignedStaff: {
      name: "Siddharth",
      initials: "SK",
    },
    address: "Chennai, Tamil Nadu, India",
    notes: [
      {
        author: "Siddharth",
        timeAgo: "1 week ago",
        content: "Onsite cybersecurity enablement cohort running smoothly.",
      },
    ],
  },
  {
    id: "contact-10",
    name: "Tanya Desai",
    initials: "TD",
    organization: "Creative Labs",
    type: "Student",
    email: "tanya.desai@mail.com",
    phone: "+91 90987 66321",
    status: "Follow-up",
    lastInteractionTime: "2 weeks ago",
    lastInteractionChannel: "Email",
    tags: ["Design", "Portfolio"],
    source: "Referral",
    joinedDate: "14 Jul 2025",
    assignedStaff: {
      name: "Neha Sharma",
      initials: "NS",
    },
    address: "Noida, Uttar Pradesh, India",
    notes: [
      {
        author: "Neha Sharma",
        timeAgo: "2 weeks ago",
        content: "Reviewing capstone portfolio presentation draft.",
      },
    ],
  },
];

// ============================================================================
// DEFAULT CONTACT AVATAR COMPONENT
// ============================================================================

function ContactAvatar({
  name,
  size = "md",
  shape = "circle",
  isDark,
}: {
  name: string;
  initials?: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "squircle";
  isDark: boolean;
}) {
  const sizeClasses = {
    sm: "w-7 h-7",
    md: "w-8 h-8",
    lg: "w-11 h-11",
    xl: "w-14 h-14",
  }[size];

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
    xl: "w-6 h-6",
  }[size];

  const roundedClass = shape === "squircle" ? "rounded-xl" : "rounded-full";

  return (
    <div
      className={`${sizeClasses} ${roundedClass} flex items-center justify-center shrink-0 border transition-all duration-200 select-none ${
        isDark
          ? "bg-white/[0.06] text-neutral-300 border-white/[0.09]"
          : "bg-slate-100 text-slate-600 border-slate-200 shadow-2xs"
      }`}
      title={name}
    >
      <User className={`${iconSizes} stroke-[1.8]`} />
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT: WORKSPACE CONTACTS VIEW
// ============================================================================

export default function WorkspaceContactsView() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Data State
  const [contacts, setContacts] = useState<ContactItem[]>(INITIAL_CONTACTS);
  const [activeTypeTab, setActiveTypeTab] = useState<"All" | "Students" | "Prospects" | "Clients">("All");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");
  const [tagFilter, setTagFilter] = useState<string>("ALL");
  const [lastInteractionFilter, setLastInteractionFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Selection & Inspector
  const [selectedContactId, setSelectedContactId] = useState<string>("contact-1");
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [inspectorTab, setInspectorTab] = useState<"Overview" | "Activity" | "Appointments" | "Notes">("Overview");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal & Feedback
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formOrg, setFormOrg] = useState("");
  const [formType, setFormType] = useState<ContactType>("Student");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formTags, setFormTags] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Ctrl+K Search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsAddModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const copyToClipboard = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`${label} copied to clipboard.`);
    }
  };

  // Currently selected contact
  const selectedContact = useMemo(() => {
    return contacts.find((c) => c.id === selectedContactId) || contacts[0];
  }, [contacts, selectedContactId]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: 248,
      students: 132,
      prospects: 86,
      clients: 30,
    };
  }, []);

  // Filtered Pipeline
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // Type Tab filter
      if (activeTypeTab === "Students" && c.type !== "Student") return false;
      if (activeTypeTab === "Prospects" && c.type !== "Prospect") return false;
      if (activeTypeTab === "Clients" && c.type !== "Client") return false;

      // Status dropdown
      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
      // Source dropdown
      if (sourceFilter !== "ALL" && c.source !== sourceFilter) return false;
      // Tag dropdown
      if (tagFilter !== "ALL" && !c.tags.includes(tagFilter)) return false;
      // Last Interaction Channel dropdown
      if (lastInteractionFilter !== "ALL" && c.lastInteractionChannel !== lastInteractionFilter) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesOrg = c.organization.toLowerCase().includes(q);
        const matchesEmail = c.email.toLowerCase().includes(q);
        const matchesPhone = c.phone.includes(q);
        const matchesTags = c.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesOrg && !matchesEmail && !matchesPhone && !matchesTags) return false;
      }
      return true;
    });
  }, [contacts, activeTypeTab, statusFilter, sourceFilter, tagFilter, lastInteractionFilter, searchQuery]);

  // Selection Checkbox Logic
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredContacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContacts.map((c) => c.id)));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Badge Stylers
  const getTypeBadgeStyle = (type: ContactType) => {
    switch (type) {
      case "Student":
        return isDark
          ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
          : "bg-sky-50 text-sky-700 border-sky-200";
      case "Prospect":
        return isDark
          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
          : "bg-amber-50 text-amber-700 border-amber-200";
      case "Client":
        return isDark
          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
          : "bg-purple-50 text-purple-700 border-purple-200";
    }
  };

  const getStatusBadgeStyle = (status: ContactStatus) => {
    switch (status) {
      case "Active":
        return isDark
          ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
          : "text-emerald-700 border-emerald-200 bg-emerald-50";
      case "Interested":
        return isDark
          ? "text-sky-400 border-sky-500/20 bg-sky-500/10"
          : "text-sky-700 border-sky-200 bg-sky-50";
      case "Follow-up":
        return isDark
          ? "text-amber-400 border-amber-500/20 bg-amber-500/10"
          : "text-amber-700 border-amber-200 bg-amber-50";
      case "Inactive":
        return isDark
          ? "text-neutral-400 border-white/10 bg-white/[0.04]"
          : "text-slate-600 border-slate-200 bg-slate-100";
    }
  };

  const renderStatusDot = (status: ContactStatus) => {
    switch (status) {
      case "Active":
        return <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />;
      case "Interested":
        return <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />;
      case "Follow-up":
        return <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />;
      case "Inactive":
        return <span className="w-1.5 h-1.5 rounded-full border border-neutral-400" />;
    }
  };

  const renderChannelIcon = (channel: InteractionChannel) => {
    switch (channel) {
      case "Call":
        return <Phone className="w-3.5 h-3.5 text-neutral-400" />;
      case "Email":
        return <Mail className="w-3.5 h-3.5 text-neutral-400" />;
      case "Appointment":
        return <Calendar className="w-3.5 h-3.5 text-neutral-400" />;
      case "Website":
        return <Globe className="w-3.5 h-3.5 text-neutral-400" />;
      case "Chat":
        return <MessageCircle className="w-3.5 h-3.5 text-neutral-400" />;
    }
  };

  // Add Contact Form Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const initials = formName
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const newContact: ContactItem = {
      id: `contact-${Date.now()}`,
      name: formName.trim(),
      initials,
      organization: formOrg.trim() || "Independent",
      type: formType,
      email: formEmail.trim() || `${formName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      phone: formPhone.trim() || "+91 98765 00000",
      status: "Active",
      lastInteractionTime: "Just now",
      lastInteractionChannel: "Call",
      tags: formTags
        ? formTags.split(",").map((t) => t.trim())
        : ["New Contact"],
      source: "Manual",
      joinedDate: "Today",
      assignedStaff: {
        name: "Siddharth",
        initials: "SK",
      },
      address: "Jaipur, Rajasthan, India",
      notes: [
        {
          author: "Siddharth",
          timeAgo: "Just now",
          content: "Contact profile created via workspace front desk.",
        },
      ],
    };

    setContacts((prev) => [newContact, ...prev]);
    setSelectedContactId(newContact.id);
    setIsAddModalOpen(false);
    setFormName("");
    setFormOrg("");
    setFormEmail("");
    setFormPhone("");
    setFormTags("");
    showToast(`Contact created for ${newContact.name}.`);
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
            CONTACTS
          </span>
          <h1
            className={`text-[23px] sm:text-[25px] font-light tracking-[-0.03em] leading-tight mt-0.5 ${
              isDark ? "text-white" : "text-[#0B0F17]"
            }`}
          >
            Manage your contacts.
          </h1>
          <p
            className={`text-[12.5px] sm:text-[13px] font-normal leading-normal mt-0.5 ${
              isDark ? "text-[#9ca3af]" : "text-[#64748B]"
            }`}
          >
            Keep all your students, prospects and clients in one place. View history, manage details and take actions quickly.
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
              placeholder="Search contacts, emails, phone..."
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

          {/* Primary CTA: Add Contact */}
          <motion.button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`inline-flex items-center gap-1.5 h-8.5 px-4 rounded-full text-[12px] font-medium transition-all duration-200 cursor-pointer shadow-sm select-none ${
              isDark
                ? "bg-white text-black hover:bg-neutral-100 shadow-[0_2px_10px_rgba(255,255,255,0.08)]"
                : "bg-[#0B0F17] text-white hover:bg-slate-800 shadow-xs"
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Add Contact</span>
          </motion.button>

          {/* More Actions Pill */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => showToast("Contacts export and bulk actions.")}
            className={`h-8.5 w-8.5 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer ${
              isDark
                ? "bg-[#0c101a] border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20 shadow-2xs"
                : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs hover:border-slate-300"
            }`}
            title="More Options"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. 4 KPI METRIC CARDS                                                */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0 select-none">
        {CONTACTS_METRICS.map((card, idx) => {
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
              className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between overflow-hidden group cursor-default select-none ${
                isDark
                  ? "bg-gradient-to-b from-[#111724]/95 via-[#0c101a]/95 to-[#080b12]/98 border-white/[0.09] hover:border-white/[0.2] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_24px_-6px_rgba(0,0,0,0.55)]"
                  : "bg-gradient-to-b from-white via-white to-[#F8FAFC] border-slate-200/90 hover:border-slate-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_4px_16px_rgba(15,23,42,0.05)]"
              }`}
            >
              {/* Left Squircle Icon & Text Metrics */}
              <div className="flex items-center gap-3.5 relative z-10 min-w-0">
                <div
                  className={`w-11.5 h-11.5 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 shrink-0 shadow-2xs ${
                    isDark
                      ? `${card.iconBgDark} ${card.iconColorDark}`
                      : `${card.iconBgLight} ${card.iconColorLight}`
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </div>

                <div className="min-w-0">
                  <span
                    className={`text-[12px] sm:text-[12.5px] font-medium block truncate ${
                      isDark ? "text-neutral-400 group-hover:text-neutral-300" : "text-slate-500 group-hover:text-slate-700"
                    }`}
                  >
                    {card.label}
                  </span>

                  <div className="flex items-baseline gap-2 mt-1">
                    <span
                      className={`text-[27px] sm:text-[30px] font-light tracking-[-0.03em] tabular-nums leading-none ${
                        isDark ? "text-white" : "text-[#0B0F17]"
                      }`}
                    >
                      {card.value}
                    </span>
                    <span
                      className={`text-[11.5px] font-medium tracking-tight shrink-0 ${
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
                  </div>

                  <span
                    className={`text-[10px] sm:text-[10.5px] block mt-0.5 truncate ${
                      isDark ? "text-[#717682]" : "text-slate-400"
                    }`}
                  >
                    {card.timeframe}
                  </span>
                </div>
              </div>

              {/* Subtle background sparkline curve */}
              <div className="w-16 h-8 opacity-25 group-hover:opacity-60 transition-opacity duration-300 shrink-0 hidden sm:block">
                <svg viewBox="0 0 120 30" fill="none" className="w-full h-full overflow-visible">
                  <motion.path
                    d={card.sparklineD}
                    stroke={strokeColor}
                    strokeWidth="1.5"
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
            </motion.div>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* 3. MAIN STAGE: DE-CLUTTERED TABLE & RIGHT DRAWER                     */}
      {/* ==================================================================== */}
      <div className="flex-1 w-full flex gap-3.5 overflow-hidden min-h-0">
        {/* Table / Grid Surface */}
        <div
          className={`flex-1 min-w-0 h-full rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
            isDark
              ? "bg-gradient-to-b from-[#111724]/95 via-[#0c101a]/95 to-[#080b12]/98 border-white/[0.09] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_30px_rgba(0,0,0,0.55)]"
              : "bg-gradient-to-b from-white via-white to-[#F8FAFC] border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_4px_20px_rgba(15,23,42,0.06)]"
          }`}
        >
          {/* Toolbar: Segmented Controls + Filters + View Toggle */}
          <div
            className={`p-3 px-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
              isDark ? "border-white/[0.06]" : "border-slate-100"
            }`}
          >
            {/* Segmented Type Filter Pills with Parenthesized Counts */}
            <div
              className={`inline-flex items-center p-0.75 rounded-full border ${
                isDark ? "bg-[#090C12]/90 border-white/[0.08]" : "bg-slate-100/80 border-slate-200/60"
              }`}
            >
              {[
                { key: "All", label: "All", count: tabCounts.all },
                { key: "Students", label: "Students", count: tabCounts.students },
                { key: "Prospects", label: "Prospects", count: tabCounts.prospects },
                { key: "Clients", label: "Clients", count: tabCounts.clients },
              ].map((tab) => {
                const isActive = activeTypeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTypeTab(tab.key as any)}
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
                        layoutId="active-contact-type-pill"
                        className={`absolute inset-0 rounded-full ${
                          isDark ? "bg-white shadow-[0_2px_8px_rgba(255,255,255,0.15)]" : "bg-[#0B0F17] shadow-xs"
                        }`}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                    <span
                      className={`relative z-10 text-[10.5px] font-mono tabular-nums ${
                        isActive
                          ? isDark
                            ? "text-black/80 font-bold"
                            : "text-white/80 font-bold"
                          : isDark
                          ? "text-neutral-400"
                          : "text-slate-400"
                      }`}
                    >
                      ({tab.count})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Filter Dropdowns + View Switcher */}
            <div className="flex items-center gap-2 flex-wrap">
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
                  <option value="Active">Active</option>
                  <option value="Interested">Interested</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Source Filter */}
              <div className="relative">
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className={`h-8 pl-3 pr-7 rounded-full text-[11.5px] font-medium border appearance-none cursor-pointer outline-none transition-all duration-200 ${
                    isDark
                      ? "bg-[#0b0e14] border-white/[0.08] text-neutral-200 hover:border-white/20"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <option value="ALL">Source</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Campus Event">Campus Event</option>
                  <option value="Inbound">Inbound</option>
                  <option value="Social Ad">Social Ad</option>
                </select>
                <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Tags Filter */}
              <div className="relative">
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className={`h-8 pl-3 pr-7 rounded-full text-[11.5px] font-medium border appearance-none cursor-pointer outline-none transition-all duration-200 ${
                    isDark
                      ? "bg-[#0b0e14] border-white/[0.08] text-neutral-200 hover:border-white/20"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <option value="ALL">Tags</option>
                  <option value="Python">Python</option>
                  <option value="UI/UX">UI/UX</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Corporate">Corporate</option>
                  <option value="React">React</option>
                  <option value="Design">Design</option>
                  <option value="AI/ML">AI/ML</option>
                </select>
                <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Last Interaction Filter */}
              <div className="relative">
                <select
                  value={lastInteractionFilter}
                  onChange={(e) => setLastInteractionFilter(e.target.value)}
                  className={`h-8 pl-3 pr-7 rounded-full text-[11.5px] font-medium border appearance-none cursor-pointer outline-none transition-all duration-200 ${
                    isDark
                      ? "bg-[#0b0e14] border-white/[0.08] text-neutral-200 hover:border-white/20"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <option value="ALL">Last Interaction</option>
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                  <option value="Appointment">Appointment</option>
                  <option value="Website">Website</option>
                  <option value="Chat">Chat</option>
                </select>
                <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* View Switcher: List vs Grid */}
              <div
                className={`flex items-center p-0.5 rounded-full border ${
                  isDark ? "bg-[#06080d] border-white/[0.08]" : "bg-slate-100 border-slate-200/70"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-full cursor-pointer transition-all ${
                    viewMode === "list"
                      ? isDark
                        ? "bg-white text-black shadow-xs"
                        : "bg-white text-slate-900 shadow-xs"
                      : isDark
                      ? "text-neutral-400 hover:text-white"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-full cursor-pointer transition-all ${
                    viewMode === "grid"
                      ? isDark
                        ? "bg-white text-black shadow-xs"
                        : "bg-white text-slate-900 shadow-xs"
                      : isDark
                      ? "text-neutral-400 hover:text-white"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Table / Grid Content Switcher */}
          {viewMode === "list" ? (
            /* 1. LIST VIEW: 8-Column Data Table */
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
                          filteredContacts.length > 0 &&
                          selectedIds.size === filteredContacts.length
                        }
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 accent-neutral-800 cursor-pointer"
                      />
                    </th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Email / Phone</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Last Interaction</th>
                    <th className="py-2.5 px-3">Tags</th>
                    <th className="py-2.5 pr-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className={`divide-y ${isDark ? "divide-white/[0.04]" : "divide-slate-100"}`}>
                  {filteredContacts.map((contact) => {
                    const isSelected = selectedContactId === contact.id;
                    const isChecked = selectedIds.has(contact.id);

                    return (
                      <tr
                        key={contact.id}
                        onClick={() => {
                          setSelectedContactId(contact.id);
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
                        <td className="py-2.5 pl-4 pr-2" onClick={(e) => toggleSelectRow(contact.id, e)}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded border-slate-300 accent-neutral-800 cursor-pointer"
                          />
                        </td>

                        {/* Name & Org */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <ContactAvatar
                              name={contact.name}
                              initials={contact.initials}
                              avatarUrl={contact.avatarUrl}
                              size="sm"
                              isDark={isDark}
                            />

                            <div className="min-w-0">
                              <span
                                className={`font-medium block leading-tight truncate ${
                                  isDark ? "text-white" : "text-slate-900"
                                }`}
                              >
                                {contact.name}
                              </span>
                              <span
                                className={`text-[10.5px] leading-tight block mt-0.5 truncate ${
                                  isDark ? "text-neutral-400" : "text-slate-500"
                                }`}
                              >
                                {contact.organization}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Type Badge */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border select-none ${getTypeBadgeStyle(
                              contact.type
                            )}`}
                          >
                            {contact.type}
                          </span>
                        </td>

                        {/* Email / Phone */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className={`text-[11.5px] ${isDark ? "text-neutral-300" : "text-slate-700"}`}>
                              {contact.email}
                            </span>
                            <span className="text-[10.5px] font-mono text-neutral-400 tabular-nums mt-0.5">
                              {contact.phone}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-medium tracking-wider border uppercase select-none transition-colors duration-150 ${getStatusBadgeStyle(
                              contact.status
                            )}`}
                          >
                            {renderStatusDot(contact.status)}
                            <span>{contact.status}</span>
                          </span>
                        </td>

                        {/* Last Interaction */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {renderChannelIcon(contact.lastInteractionChannel)}
                            <div className="flex flex-col">
                              <span className={`text-[11.5px] font-medium ${isDark ? "text-neutral-200" : "text-slate-800"}`}>
                                {contact.lastInteractionTime}
                              </span>
                              <span className="text-[10px] text-neutral-400">
                                {contact.lastInteractionChannel}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Tags */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {contact.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${
                                  isDark
                                    ? "bg-white/[0.04] border-white/10 text-neutral-300"
                                    : "bg-slate-100 border-slate-200 text-slate-700"
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Actions Menu */}
                        <td className="py-2.5 pr-4 text-right whitespace-nowrap">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              showToast(`Actions for ${contact.name}`);
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
          ) : (
            /* 2. GRID VIEW: Luxury Contact Cards */
            <div className="flex-1 overflow-auto no-scrollbar p-3.5 sm:p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 min-h-0">
              {filteredContacts.map((contact) => {
                const isSelected = selectedContactId === contact.id;

                return (
                  <motion.div
                    key={contact.id}
                    layout
                    onClick={() => {
                      setSelectedContactId(contact.id);
                      if (!isInspectorOpen) setIsInspectorOpen(true);
                    }}
                    whileHover={{ y: -2 }}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 cursor-pointer select-none ${
                      isSelected
                        ? isDark
                          ? "bg-white/[0.08] border-white/25 shadow-md"
                          : "bg-slate-50 border-slate-400 shadow-sm"
                        : isDark
                        ? "bg-[#0b0f18]/80 border-white/[0.08] hover:border-white/20 hover:bg-[#0e1320]"
                        : "bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-2xs"
                    }`}
                  >
                    {/* Header: Avatar, Name, Type Pill, Actions */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ContactAvatar
                          name={contact.name}
                          initials={contact.initials}
                          avatarUrl={contact.avatarUrl}
                          size="md"
                          shape="squircle"
                          isDark={isDark}
                        />
                        <div className="min-w-0">
                          <h4 className={`text-[13px] font-semibold tracking-tight truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                            {contact.name}
                          </h4>
                          <span className={`text-[11px] block truncate ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
                            {contact.organization}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-medium border ${getTypeBadgeStyle(contact.type)}`}>
                          {contact.type}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono border uppercase ${getStatusBadgeStyle(contact.status)}`}>
                          {renderStatusDot(contact.status)}
                        </span>
                      </div>
                    </div>

                    {/* Contact Channels */}
                    <div className={`p-2 rounded-xl text-[11px] space-y-1 ${isDark ? "bg-white/[0.03]" : "bg-slate-50"}`}>
                      <div className="flex items-center justify-between text-neutral-400">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className={`truncate ${isDark ? "text-neutral-300" : "text-slate-700"}`}>{contact.email}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(contact.email, "Email");
                          }}
                          className="hover:text-white cursor-pointer ml-1"
                        >
                          <Copy className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-neutral-400">
                        <div className="flex items-center gap-1.5 font-mono tabular-nums">
                          <Phone className="w-3 h-3 shrink-0" />
                          <span className={isDark ? "text-neutral-300" : "text-slate-700"}>{contact.phone}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(contact.phone, "Phone");
                          }}
                          className="hover:text-white cursor-pointer ml-1"
                        >
                          <Copy className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>

                    {/* Tags & Last Interaction Footer */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.05] text-[10.5px]">
                      <div className="flex items-center gap-1 flex-wrap">
                        {contact.tags.map((t) => (
                          <span
                            key={t}
                            className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono border ${
                              isDark ? "bg-white/[0.04] border-white/10 text-neutral-300" : "bg-slate-100 border-slate-200 text-slate-700"
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 text-neutral-400 shrink-0 font-medium">
                        {renderChannelIcon(contact.lastInteractionChannel)}
                        <span>{contact.lastInteractionTime}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Table / Grid Footer: Sleek Apple Numbered Pagination */}
          <div
            className={`p-2.5 px-4 flex items-center justify-between border-t shrink-0 text-[11px] select-none ${
              isDark ? "border-white/[0.06] text-[#8e95a5]" : "border-slate-100 text-slate-500"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Showing 1–10 of 248 contacts</span>
            </div>

            <div className="flex items-center gap-1 font-mono text-[11px]">
              {/* Prev button */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  if (currentPage > 1) {
                    setCurrentPage((p) => p - 1);
                    showToast(`Navigated to page ${currentPage - 1}`);
                  }
                }}
                disabled={currentPage === 1}
                className={`w-7 h-7 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                  currentPage === 1 ? "opacity-35 cursor-not-allowed" : ""
                } ${
                  isDark
                    ? "border-white/10 hover:border-white/20 text-neutral-300 hover:text-white"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                title="Previous"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </motion.button>

              {/* Numbered buttons matching screenshot: 1, 2, 3, 4, 5, ..., 25 */}
              {[1, 2, 3, 4, 5].map((pageNum) => {
                const isActive = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => {
                      setCurrentPage(pageNum);
                      showToast(`Navigated to page ${pageNum}`);
                    }}
                    className={`w-7 h-7 rounded-lg text-[11px] font-mono tabular-nums font-medium transition-all cursor-pointer ${
                      isActive
                        ? isDark
                          ? "bg-white text-black font-semibold shadow-xs"
                          : "bg-[#0B0F17] text-white font-semibold shadow-xs"
                        : isDark
                        ? "text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <span className="px-1 text-neutral-400 select-none">...</span>

              <button
                type="button"
                onClick={() => {
                  setCurrentPage(25);
                  showToast("Navigated to page 25");
                }}
                className={`w-7 h-7 rounded-lg text-[11px] font-mono tabular-nums font-medium transition-all cursor-pointer ${
                  currentPage === 25
                    ? isDark
                      ? "bg-white text-black font-semibold shadow-xs"
                      : "bg-[#0B0F17] text-white font-semibold shadow-xs"
                    : isDark
                    ? "text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                25
              </button>

              {/* Next button */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  if (currentPage < 25) {
                    setCurrentPage((p) => p + 1);
                    showToast(`Navigated to page ${currentPage + 1}`);
                  }
                }}
                disabled={currentPage === 25}
                className={`w-7 h-7 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                  currentPage === 25 ? "opacity-35 cursor-not-allowed" : ""
                } ${
                  isDark
                    ? "border-white/10 hover:border-white/20 text-neutral-300 hover:text-white"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                title="Next"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* RIGHT DRAWER: "CONTACT DETAILS" INSPECTOR                          */}
        {/* ================================================================== */}
        <AnimatePresence>
          {isInspectorOpen && (
            <motion.div
              key="contact-details-inspector"
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
              {/* Top Identity Block */}
              <div
                className={`p-4 border-b shrink-0 flex items-start gap-3.5 ${
                  isDark ? "border-white/[0.06]" : "border-slate-100"
                }`}
              >
                <ContactAvatar
                  name={selectedContact.name}
                  initials={selectedContact.initials}
                  avatarUrl={selectedContact.avatarUrl}
                  size="xl"
                  shape="squircle"
                  isDark={isDark}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2 py-0.2 rounded-full text-[9px] font-mono font-medium border uppercase ${getStatusBadgeStyle(
                        selectedContact.status
                      )}`}
                    >
                      {selectedContact.status}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => showToast(`Options for ${selectedContact.name}`)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer ${
                          isDark ? "text-neutral-400 hover:text-white" : "text-slate-400 hover:text-slate-900"
                        }`}
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsInspectorOpen(false)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer ${
                          isDark ? "text-neutral-400 hover:text-white" : "text-slate-400 hover:text-slate-900"
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h2 className={`text-[15px] font-semibold tracking-tight mt-1 truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                    {selectedContact.name}
                  </h2>
                  <span className="text-[11px] text-neutral-400 block truncate">
                    {selectedContact.type} • {selectedContact.organization}
                  </span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    Last seen {selectedContact.lastInteractionTime}
                  </span>
                </div>
              </div>

              {/* 5 Quick Action Buttons Row */}
              <div
                className={`p-2.5 px-3 border-b shrink-0 grid grid-cols-5 gap-1.5 text-center ${
                  isDark ? "border-white/[0.06]" : "border-slate-100"
                }`}
              >
                {[
                  { label: "Call", icon: Phone, action: () => showToast(`Calling ${selectedContact.name}...`) },
                  { label: "Message", icon: MessageCircle, action: () => showToast(`Message sent to ${selectedContact.name}.`) },
                  { label: "Email", icon: Mail, action: () => showToast(`Drafting email to ${selectedContact.email}...`) },
                  { label: "Schedule", icon: Calendar, action: () => showToast(`Schedule meeting with ${selectedContact.name}.`) },
                  { label: "More", icon: MoreHorizontal, action: () => showToast(`More actions for ${selectedContact.name}.`) },
                ].map((act) => {
                  const ActIcon = act.icon;
                  return (
                    <motion.button
                      key={act.label}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={act.action}
                      className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isDark
                          ? "bg-white/[0.03] hover:bg-white/[0.07] text-neutral-300 hover:text-white border border-white/[0.06]"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/70"
                      }`}
                    >
                      <ActIcon className="w-3.5 h-3.5" />
                      <span className="text-[9.5px] font-medium leading-tight">{act.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Inspector Content */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 min-h-0">
                {/* 4 Segmented Navigation Tabs */}
                <div
                  className={`flex items-center border-b text-[11.5px] font-medium shrink-0 ${
                    isDark ? "border-white/[0.06]" : "border-slate-200"
                  }`}
                >
                  {(["Overview", "Activity", "Appointments", "Notes"] as const).map((tab) => {
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
                            layoutId="contactTabUnderline"
                            className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                              isDark ? "bg-white" : "bg-slate-900"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Tab: Overview */}
                {inspectorTab === "Overview" && (
                  <div className="space-y-4">
                    {/* Key-Value Details */}
                    <div className="space-y-2.5 text-[11px]">
                      {/* Email */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-neutral-400">
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                            {selectedContact.email}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedContact.email, "Email")}
                            className="text-neutral-500 hover:text-neutral-300 cursor-pointer"
                            title="Copy email"
                          >
                            <Copy className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-neutral-400">
                          <Phone className="w-3.5 h-3.5" />
                          <span>Phone</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-neutral-300 tabular-nums">
                            {selectedContact.phone}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedContact.phone, "Phone")}
                            className="text-neutral-500 hover:text-neutral-300 cursor-pointer"
                            title="Copy phone"
                          >
                            <Copy className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>

                      {/* Type */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-neutral-400">
                          <Tag className="w-3.5 h-3.5" />
                          <span>Type</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9.5px] font-medium border ${getTypeBadgeStyle(
                            selectedContact.type
                          )}`}
                        >
                          {selectedContact.type}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-neutral-400">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Status</span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-medium border uppercase ${getStatusBadgeStyle(
                            selectedContact.status
                          )}`}
                        >
                          {renderStatusDot(selectedContact.status)}
                          <span>{selectedContact.status}</span>
                        </span>
                      </div>

                      {/* Source */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-neutral-400">
                          <Globe className="w-3.5 h-3.5" />
                          <span>Source</span>
                        </div>
                        <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                          {selectedContact.source}
                        </span>
                      </div>

                      {/* Joined Date */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-neutral-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Joined</span>
                        </div>
                        <span className={`font-mono text-[11px] ${isDark ? "text-white" : "text-slate-900"}`}>
                          {selectedContact.joinedDate}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-neutral-400">
                          <Tag className="w-3.5 h-3.5" />
                          <span>Tags</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          {selectedContact.tags.map((t) => (
                            <span
                              key={t}
                              className={`px-2 py-0.5 rounded-md text-[9.5px] font-mono border ${
                                isDark
                                  ? "bg-white/[0.04] border-white/10 text-neutral-300"
                                  : "bg-slate-100 border-slate-200 text-slate-700"
                              }`}
                            >
                              {t}
                            </span>
                          ))}
                          <button
                            type="button"
                            onClick={() => showToast("Add tag trigger.")}
                            className="w-5 h-5 rounded-md border border-dashed flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Assigned Staff */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-neutral-400">
                          <User className="w-3.5 h-3.5" />
                          <span>Assigned To</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ContactAvatar
                            name={selectedContact.assignedStaff.name}
                            initials={selectedContact.assignedStaff.initials}
                            avatarUrl={selectedContact.assignedStaff.avatarUrl}
                            size="sm"
                            isDark={isDark}
                          />
                          <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                            {selectedContact.assignedStaff.name}
                          </span>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-neutral-400">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Address</span>
                        </div>
                        <span className={`text-[10.5px] truncate max-w-[180px] ${isDark ? "text-neutral-300" : "text-slate-700"}`}>
                          {selectedContact.address}
                        </span>
                      </div>
                    </div>

                    {/* Internal Notes Feed */}
                    <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                      <div className="flex items-center justify-between">
                        <span className={`text-[11.5px] font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                          Notes
                        </span>
                        <button
                          type="button"
                          onClick={() => showToast("Add internal note.")}
                          className="text-[10.5px] font-medium text-sky-400 hover:underline cursor-pointer"
                        >
                          + Add Note
                        </button>
                      </div>

                      <div className="space-y-2">
                        {selectedContact.notes.map((note, i) => (
                          <div
                            key={i}
                            className={`p-2.5 rounded-xl border space-y-1 ${
                              isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-slate-50 border-slate-100"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`font-medium text-[11px] ${isDark ? "text-white" : "text-slate-900"}`}>
                                {note.author}
                              </span>
                              <span className="text-[10px] font-mono text-neutral-400">{note.timeAgo}</span>
                            </div>
                            <p className={`text-[11px] leading-relaxed ${isDark ? "text-neutral-300" : "text-slate-600"}`}>
                              {note.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Quick Actions */}
                    <div className="pt-2 border-t border-white/[0.06] space-y-2 select-none">
                      <span className={`text-[11.5px] font-semibold block ${isDark ? "text-white" : "text-slate-900"}`}>
                        Quick Actions
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => showToast(`Schedule appointment for ${selectedContact.name}.`)}
                          className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isDark
                              ? "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] text-neutral-300"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5 text-sky-400" />
                          <span className="text-[10.5px] font-medium">Create Appointment</span>
                        </motion.button>

                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => showToast(`Add follow-up task for ${selectedContact.name}.`)}
                          className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isDark
                              ? "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] text-neutral-300"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10.5px] font-medium">Add Follow-up</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Activity */}
                {inspectorTab === "Activity" && (
                  <div className="space-y-3">
                    <span className={`text-[11.5px] font-semibold block mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                      Recent Timeline
                    </span>
                    <div className="space-y-2">
                      <div
                        className={`p-2.5 rounded-xl border space-y-1 ${
                          isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-slate-50 border-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                          <span>Today, 10:30 AM</span>
                          <span>Inbound Call</span>
                        </div>
                        <p className={`text-[11.5px] ${isDark ? "text-neutral-300" : "text-slate-700"}`}>
                          Spoke for 04:21 regarding batch timings.
                        </p>
                      </div>

                      <div
                        className={`p-2.5 rounded-xl border space-y-1 ${
                          isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-slate-50 border-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                          <span>Yesterday, 3:15 PM</span>
                          <span>WhatsApp</span>
                        </div>
                        <p className={`text-[11.5px] ${isDark ? "text-neutral-300" : "text-slate-700"}`}>
                          Dispatched course curriculum PDF brochure.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Appointments */}
                {inspectorTab === "Appointments" && (
                  <div className="space-y-3">
                    <span className={`text-[11.5px] font-semibold block mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                      Booked Consultations
                    </span>
                    <div
                      className={`p-3 rounded-2xl border space-y-2 text-[11.5px] ${
                        isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Date</span>
                        <span className="font-mono">Thu, 25 Sep 2025</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Time</span>
                        <span className="font-mono">03:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Type</span>
                        <span>1-on-1 Academic Advisory</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Notes */}
                {inspectorTab === "Notes" && (
                  <div className="space-y-3">
                    <textarea
                      rows={4}
                      placeholder="Add an internal note for this contact..."
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
                      onClick={() => showToast("Internal note saved.")}
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
      {/* 4. MODAL: "ADD CONTACT"                                              */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {isAddModalOpen && (
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
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4.5 right-4.5 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                  <Plus className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-[15.5px] font-semibold tracking-tight">Add New Contact</h3>
                  <p className="text-[12px] text-neutral-400">
                    Register a student, prospect or client record
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Rohan Mehta"
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
                      Organization / School
                    </label>
                    <input
                      type="text"
                      value={formOrg}
                      onChange={(e) => setFormOrg(e.target.value)}
                      placeholder="e.g. ABC Institute"
                      className={`w-full h-10 px-3.5 rounded-xl border text-[13px] outline-none ${
                        isDark
                          ? "bg-[#06080e] border-white/15 text-white focus:border-white/40"
                          : "bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-500"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                      Contact Type
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as ContactType)}
                      className={`w-full h-10 px-3 rounded-xl border text-[12.5px] outline-none cursor-pointer ${
                        isDark ? "bg-[#06080e] border-white/15 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
                    >
                      <option value="Student">Student</option>
                      <option value="Prospect">Prospect</option>
                      <option value="Client">Client</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="rohan@example.com"
                      className={`w-full h-10 px-3.5 rounded-xl border text-[13px] outline-none ${
                        isDark
                          ? "bg-[#06080e] border-white/15 text-white focus:border-white/40"
                          : "bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-500"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className={`w-full h-10 px-3.5 rounded-xl border text-[13px] outline-none font-mono ${
                        isDark
                          ? "bg-[#06080e] border-white/15 text-white focus:border-white/40"
                          : "bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-500"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="Python, Batch A, UI/UX"
                    className={`w-full h-10 px-3.5 rounded-xl border text-[13px] outline-none ${
                      isDark
                        ? "bg-[#06080e] border-white/15 text-white focus:border-white/40"
                        : "bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-500"
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
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
                    <span>Save Contact</span>
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
