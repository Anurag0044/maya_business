"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePageLoad } from "@/context/PageLoadContext";

interface FeatureNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_FEATURES: FeatureNavItem[] = [
  {
    id: "calls",
    label: "CALLS",
    icon: (
      <svg
        className="w-3.5 h-3.5 stroke-current fill-none transition-transform duration-200 group-hover:scale-105"
        viewBox="0 0 24 24"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 2a9 9 0 0 1 9 9" />
        <path d="M13 6a5 5 0 0 1 5 5" />
        <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
      </svg>
    ),
  },
  {
    id: "leads",
    label: "LEADS",
    icon: (
      <svg
        className="w-3.5 h-3.5 stroke-current fill-none transition-transform duration-200 group-hover:scale-105"
        viewBox="0 0 24 24"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="7.2" r="3.7" />
        <ellipse cx="12" cy="16.2" rx="6.2" ry="3.8" />
      </svg>
    ),
  },
  {
    id: "appointments",
    label: "APPOINTMENTS",
    icon: (
      <svg
        className="w-3.5 h-3.5 stroke-current fill-none transition-transform duration-200 group-hover:scale-105"
        viewBox="0 0 24 24"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
        <line x1="16" y1="2.5" x2="16" y2="5" />
        <line x1="8" y1="2.5" x2="8" y2="5" />
        <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" />
      </svg>
    ),
  },
  {
    id: "follow-ups",
    label: "FOLLOW-UPS",
    icon: (
      <svg
        className="w-3.5 h-3.5 stroke-current fill-none transition-transform duration-200 group-hover:scale-105"
        viewBox="0 0 24 24"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="7.5" />
      </svg>
    ),
  },
  {
    id: "knowledge",
    label: "KNOWLEDGE",
    icon: (
      <svg
        className="w-3.5 h-3.5 stroke-current fill-none transition-transform duration-200 group-hover:scale-105"
        viewBox="0 0 24 24"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    id: "analytics",
    label: "ANALYTICS",
    icon: (
      <svg
        className="w-3.5 h-3.5 stroke-current fill-none transition-transform duration-200 group-hover:scale-105"
        viewBox="0 0 24 24"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="3" y1="20" x2="21" y2="20" />
        <rect x="4.5" y="13" width="3" height="7" rx="1.5" />
        <rect x="10.5" y="5" width="3" height="15" rx="1.5" />
        <rect x="16.5" y="10" width="3" height="10" rx="1.5" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const { isPageReady } = usePageLoad();

  return (
    <motion.nav
      aria-label="Lower Navigation"
      initial={{ opacity: 0, y: 14 }}
      animate={isPageReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: 0.8, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-3 sm:gap-4.5 lg:gap-5.5 overflow-x-auto no-scrollbar select-none py-1"
    >
      {NAV_FEATURES.map((feature) => (
        <React.Fragment key={feature.id}>
          <a
            href={`#${feature.id}`}
            className="group flex items-center gap-2 sm:gap-2.5 text-[#8a929f] hover:text-white transition-colors duration-200 outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded py-0.5 px-0.5 whitespace-nowrap"
          >
            <span className="shrink-0 text-white/75 group-hover:text-white transition-colors duration-200">
              {feature.icon}
            </span>
            <span className="text-[9px] sm:text-[9.5px] lg:text-[10px] font-medium tracking-[0.22em] uppercase leading-none">
              {feature.label}
            </span>
          </a>

          {/* Delicate vertical hairline divider between items */}
          <div
            className="h-3 sm:h-3.5 w-[1px] bg-white/[0.14] shrink-0"
            aria-hidden="true"
          />
        </React.Fragment>
      ))}
    </motion.nav>
  );
}
