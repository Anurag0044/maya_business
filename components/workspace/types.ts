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
    badgeClassDark: "bg-sky-500/[0.08] text-sky-300 border-sky-400/20 shadow-[0_0_10px_-2px_rgba(56,189,248,0.18)]",
    badgeClassLight: "bg-sky-50 text-sky-700 border-sky-200/90 shadow-[0_1px_2px_rgba(14,165,233,0.06)]",
    dotColorDark: "bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.7)]",
    dotColorLight: "bg-sky-500",
    activeBtnDark: "bg-sky-500/15 text-sky-300 border-sky-400/35 shadow-[0_0_12px_rgba(56,189,248,0.22)]",
    activeBtnLight: "bg-sky-50 text-sky-800 border-sky-300 shadow-2xs",
  },
  CONTACTED: {
    label: "CONTACTED",
    badgeClassDark: "bg-sky-500/[0.08] text-sky-300 border-sky-400/20 shadow-[0_0_10px_-2px_rgba(56,189,248,0.18)]",
    badgeClassLight: "bg-sky-50 text-sky-700 border-sky-200/90 shadow-[0_1px_2px_rgba(14,165,233,0.06)]",
    dotColorDark: "bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.7)]",
    dotColorLight: "bg-sky-500",
    activeBtnDark: "bg-sky-500/15 text-sky-300 border-sky-400/35 shadow-[0_0_12px_rgba(56,189,248,0.22)]",
    activeBtnLight: "bg-sky-50 text-sky-800 border-sky-300 shadow-2xs",
  },
  INTERESTED: {
    label: "INTERESTED",
    badgeClassDark: "bg-sky-500/[0.08] text-sky-300 border-sky-400/20 shadow-[0_0_10px_-2px_rgba(56,189,248,0.18)]",
    badgeClassLight: "bg-sky-50 text-sky-700 border-sky-200/90 shadow-[0_1px_2px_rgba(14,165,233,0.06)]",
    dotColorDark: "bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.7)]",
    dotColorLight: "bg-sky-500",
    activeBtnDark: "bg-sky-500/15 text-sky-300 border-sky-400/35 shadow-[0_0_12px_rgba(56,189,248,0.22)]",
    activeBtnLight: "bg-sky-50 text-sky-800 border-sky-300 shadow-2xs",
  },
  COUNSELLING: {
    label: "COUNSELLING",
    badgeClassDark: "bg-sky-500/[0.08] text-sky-300 border-sky-400/20 shadow-[0_0_10px_-2px_rgba(56,189,248,0.18)]",
    badgeClassLight: "bg-sky-50 text-sky-700 border-sky-200/90 shadow-[0_1px_2px_rgba(14,165,233,0.06)]",
    dotColorDark: "bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.7)]",
    dotColorLight: "bg-sky-500",
    activeBtnDark: "bg-sky-500/15 text-sky-300 border-sky-400/35 shadow-[0_0_12px_rgba(56,189,248,0.22)]",
    activeBtnLight: "bg-sky-50 text-sky-800 border-sky-300 shadow-2xs",
  },
  VISITED: {
    label: "VISITED",
    badgeClassDark: "bg-sky-500/[0.08] text-sky-300 border-sky-400/20 shadow-[0_0_10px_-2px_rgba(56,189,248,0.18)]",
    badgeClassLight: "bg-sky-50 text-sky-700 border-sky-200/90 shadow-[0_1px_2px_rgba(14,165,233,0.06)]",
    dotColorDark: "bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.7)]",
    dotColorLight: "bg-sky-500",
    activeBtnDark: "bg-sky-500/15 text-sky-300 border-sky-400/35 shadow-[0_0_12px_rgba(56,189,248,0.22)]",
    activeBtnLight: "bg-sky-50 text-sky-800 border-sky-300 shadow-2xs",
  },
  ENROLLED: {
    label: "ENROLLED",
    badgeClassDark: "bg-emerald-500/[0.08] text-emerald-300 border-emerald-400/20 shadow-[0_0_10px_-2px_rgba(52,211,153,0.18)]",
    badgeClassLight: "bg-emerald-50 text-emerald-700 border-emerald-200/90 shadow-[0_1px_2px_rgba(16,185,129,0.06)]",
    dotColorDark: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]",
    dotColorLight: "bg-emerald-500",
    activeBtnDark: "bg-emerald-500/15 text-emerald-300 border-emerald-400/35 shadow-[0_0_12px_rgba(52,211,153,0.22)]",
    activeBtnLight: "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs",
  },
  LOST: {
    label: "LOST",
    badgeClassDark: "bg-white/[0.03] text-neutral-400 border-white/[0.08] shadow-none",
    badgeClassLight: "bg-slate-100 text-slate-500 border-slate-200 shadow-none",
    dotColorDark: "bg-neutral-500",
    dotColorLight: "bg-slate-400",
    activeBtnDark: "bg-white/[0.08] text-neutral-200 border-white/20 shadow-none",
    activeBtnLight: "bg-slate-200 text-slate-800 border-slate-300 shadow-2xs",
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
