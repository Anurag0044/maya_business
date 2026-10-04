export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "COUNSELLING"
  | "VISITED"
  | "LOST"
  | "ENROLLED";

export type LeadPriority = "High" | "Medium" | "Low";

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
