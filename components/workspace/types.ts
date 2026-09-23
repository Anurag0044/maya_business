export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "COUNSELLING"
  | "VISITED";

export interface LeadItem {
  id: string;
  initials: string;
  name: string;
  source: "Website" | "WhatsApp" | "Phone" | "Walk-in" | "Other";
  timeAgo: string;
  status: LeadStatus;
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
