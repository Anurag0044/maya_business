export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "COUNSELLING"
  | "VISITED"
  | "LOST"
  | "ENROLLED";

export type LeadPriority = "High" | "Medium" | "Low";

export interface StatusConfig {
  label: string;
  badgeClassDark: string;
  badgeClassLight: string;
  dotColorDark: string;
  dotColorLight: string;
  activeBtnDark: string;
  activeBtnLight: string;
}

export const LEAD_STATUS_CONFIG: Record<LeadStatus, StatusConfig> = {
  NEW: {
    label: "NEW",
    badgeClassDark: "bg-sky-500/[0.12] text-sky-300 border-sky-400/25 shadow-[0_0_10px_-2px_rgba(56,189,248,0.22)]",
    badgeClassLight: "bg-sky-50 text-sky-700 border-sky-200 shadow-[0_1px_2px_rgba(14,165,233,0.06)]",
    dotColorDark: "bg-sky-400",
    dotColorLight: "bg-sky-500",
    activeBtnDark: "bg-sky-500/20 text-sky-300 border-sky-400/40 shadow-[0_0_12px_rgba(56,189,248,0.2)]",
    activeBtnLight: "bg-sky-100 text-sky-800 border-sky-300",
  },
  CONTACTED: {
    label: "CONTACTED",
    badgeClassDark: "bg-purple-500/[0.12] text-purple-300 border-purple-400/25 shadow-[0_0_10px_-2px_rgba(192,132,252,0.22)]",
    badgeClassLight: "bg-purple-50 text-purple-700 border-purple-200 shadow-[0_1px_2px_rgba(168,85,247,0.06)]",
    dotColorDark: "bg-purple-400",
    dotColorLight: "bg-purple-500",
    activeBtnDark: "bg-purple-500/20 text-purple-300 border-purple-400/40 shadow-[0_0_12px_rgba(192,132,252,0.2)]",
    activeBtnLight: "bg-purple-100 text-purple-800 border-purple-300",
  },
  INTERESTED: {
    label: "INTERESTED",
    badgeClassDark: "bg-amber-500/[0.12] text-amber-300 border-amber-400/25 shadow-[0_0_10px_-2px_rgba(251,191,36,0.22)]",
    badgeClassLight: "bg-amber-50 text-amber-700 border-amber-200 shadow-[0_1px_2px_rgba(217,119,6,0.06)]",
    dotColorDark: "bg-amber-400",
    dotColorLight: "bg-amber-500",
    activeBtnDark: "bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.2)]",
    activeBtnLight: "bg-amber-100 text-amber-800 border-amber-300",
  },
  COUNSELLING: {
    label: "COUNSELLING",
    badgeClassDark: "bg-cyan-500/[0.12] text-cyan-300 border-cyan-400/25 shadow-[0_0_10px_-2px_rgba(34,211,238,0.22)]",
    badgeClassLight: "bg-cyan-50 text-cyan-700 border-cyan-200 shadow-[0_1px_2px_rgba(6,182,212,0.06)]",
    dotColorDark: "bg-cyan-400",
    dotColorLight: "bg-cyan-500",
    activeBtnDark: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.2)]",
    activeBtnLight: "bg-cyan-100 text-cyan-800 border-cyan-300",
  },
  VISITED: {
    label: "VISITED",
    badgeClassDark: "bg-indigo-500/[0.12] text-indigo-300 border-indigo-400/25 shadow-[0_0_10px_-2px_rgba(129,140,248,0.22)]",
    badgeClassLight: "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-[0_1px_2px_rgba(99,102,241,0.06)]",
    dotColorDark: "bg-indigo-400",
    dotColorLight: "bg-indigo-500",
    activeBtnDark: "bg-indigo-500/20 text-indigo-300 border-indigo-400/40 shadow-[0_0_12px_rgba(129,140,248,0.2)]",
    activeBtnLight: "bg-indigo-100 text-indigo-800 border-indigo-300",
  },
  ENROLLED: {
    label: "ENROLLED",
    badgeClassDark: "bg-emerald-500/[0.12] text-emerald-300 border-emerald-400/25 shadow-[0_0_10px_-2px_rgba(52,211,153,0.22)]",
    badgeClassLight: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-[0_1px_2px_rgba(16,185,129,0.06)]",
    dotColorDark: "bg-emerald-400",
    dotColorLight: "bg-emerald-500",
    activeBtnDark: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_12px_rgba(52,211,153,0.2)]",
    activeBtnLight: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  LOST: {
    label: "LOST",
    badgeClassDark: "bg-rose-500/[0.12] text-rose-300/90 border-rose-500/20 shadow-[0_0_10px_-2px_rgba(244,63,94,0.15)]",
    badgeClassLight: "bg-rose-50/70 text-rose-600 border-rose-200/80 shadow-[0_1px_2px_rgba(225,29,72,0.04)]",
    dotColorDark: "bg-rose-400",
    dotColorLight: "bg-rose-500",
    activeBtnDark: "bg-rose-500/20 text-rose-300 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]",
    activeBtnLight: "bg-rose-100 text-rose-800 border-rose-300",
  },
};

export function getStatusBadgeStyle(status: LeadStatus, isDark: boolean): string {
  const conf = LEAD_STATUS_CONFIG[status];
  if (!conf) {
    return isDark
      ? "bg-white/[0.04] text-white/80 border-white/[0.08]"
      : "bg-slate-100 text-slate-700 border-slate-200";
  }
  return isDark ? conf.badgeClassDark : conf.badgeClassLight;
}

export function getStatusDotColor(status: LeadStatus, isDark: boolean): string {
  const conf = LEAD_STATUS_CONFIG[status];
  if (!conf) return isDark ? "bg-white/60" : "bg-slate-400";
  return isDark ? conf.dotColorDark : conf.dotColorLight;
}

export interface LeadItem {
  id: string;
  initials: string;
  name: string;
  source: "Website" | "WhatsApp" | "Phone" | "Walk-in" | "Instagram" | "Referral" | "Other";
  timeAgo: string;
  status: LeadStatus;
  phone?: string;
  email?: string;
  course?: string;
  priority?: LeadPriority;
  assignedTo?: {
    name: string;
    avatarInitials: string;
  };
  lastContact?: string;
  nextFollowUp?: string;
  notes?: string;
}

export type ActivityType = "lead" | "call" | "followup" | "status" | "appointment";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  detail: string;
  timeAgo: string;
}

export type AppointmentStatus = "Confirmed" | "Pending";

export interface AppointmentItem {
  id: string;
  time: string;
  name: string;
  type: string;
  status: AppointmentStatus;
}

export interface MetricCardItem {
  id: string;
  title: string;
  value: number;
  changePct: number;
  isPositive: boolean;
  timeframe: string;
  color: string;
  sparklinePoints: number[];
}

export interface LeadSourceItem {
  name: string;
  percentage: number;
  color: string;
  count: number;
}

export interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: string;
  business_id: string;
}

export interface BackendDashboardKPIs {
  calls_today: number;
  leads_total: number;
  appointments_today: number;
  pending_followups: number;
}

export interface BackendLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  status: string;
  created_at: string;
}

export interface BackendNotification {
  id: string;
  title: string;
  message: string;
  status: string;
  created_at: string;
}

export type ApiKeyStatus = "active" | "revoked";

export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  maskedKey: string;
  status: ApiKeyStatus;
  createdAt: string;
  lastUsed: string;
  scope: "full" | "read" | "webhooks";
  expiresAt: string;
}
