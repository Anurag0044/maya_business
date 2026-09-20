"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LogoCloud from "@/components/LogoCloud";
import RightRail from "@/components/RightRail";
import BackgroundVideo from "@/components/BackgroundVideo";

export default function Home() {
  return (
    <main className="relative h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between bg-[#060709] text-white overflow-hidden select-none">
      {/* 1. Ambient Background Video (Night & Day Mode Seamless Crossfade) */}
      <BackgroundVideo />

      {/* 2. Top Navigation with Premium Minimal Mode Switcher */}
      <Navbar />

      {/* 3. Main Stage: Hero (Left) & Right Rail (Right) */}
      <div className="relative z-10 w-full px-6 sm:px-10 lg:px-14 flex-1 flex items-center justify-between min-h-0 py-1">
        {/* Left: Hero & Metrics */}
        <div className="flex-1 flex flex-col justify-center max-w-2xl py-1">
          <Hero />
        </div>

        {/* Right: Vertical Marginalia Column */}
        <div className="h-full flex items-center justify-end pl-6">
          <RightRail />
        </div>
      </div>

      {/* 4. Bottom Social Proof Bar */}
      <div className="relative z-10 w-full px-6 sm:px-10 lg:px-14 pb-3.5 sm:pb-4 lg:pb-5 pt-1">
        <LogoCloud />
      </div>
    </main>
  );
}
