import type { Metadata } from "next";
import WorkspaceDashboard from "@/components/workspace/WorkspaceDashboard";

export const metadata: Metadata = {
  title: "Workspace — MAYA Business",
  description:
    "MAYA Business workspace: Real-time front desk analytics, appointments, leads management, and AI copilot.",
};

export default function WorkspacePage() {
  return <WorkspaceDashboard />;
}
