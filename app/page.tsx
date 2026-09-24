"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BottomNav from "@/components/BottomNav";
import RightRail from "@/components/RightRail";
import BackgroundVideo from "@/components/BackgroundVideo";
import MotionLoader from "@/components/MotionLoader";
import MayaAgentShowcase from "@/components/MayaAgentShowcase";
import MayaReceptionist from "@/components/MayaReceptionist";
import { usePageLoad } from "@/context/PageLoadContext";

export default function Home() {
  const { isPageReady } = usePageLoad();

  return (
    <>
      {/* 0. Executive Sleek Motion Loader with MAYA Logo on every refresh */}
      <MotionLoader />

      {/* Persistent Fixed Top Navigation: Remains pinned to head on scroll */}
      <Navbar />

      <motion.main
        initial={{ opacity: 0.88, scale: 0.995 }}
        animate={isPageReady ? { opacity: 1, scale: 1 } : { opacity: 0.88, scale: 0.995 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="relative min-h-screen w-full flex flex-col bg-[#060709] text-white overflow-x-hidden selection:bg-neutral-500/20"
      >
        {/* ========================================================================= */}
        {/* 1. HERO STAGE VIEWPORT (Full-Screen Immersive Canvas)                      */}
        {/* ========================================================================= */}
        <section className="relative h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between overflow-hidden select-none">
          {/* Ambient Background Video (Night & Day Mode Seamless Crossfade) */}
          <BackgroundVideo />

          {/* Spacer preserving exact hero flex proportions and vertical balance */}
          <div className="w-full h-14 sm:h-16 shrink-0 pointer-events-none" aria-hidden="true" />

          {/* Main Stage: Hero (Left) & Right Rail (Right) */}
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

          {/* Lower Navigation / Capabilities Bar */}
          <div className="relative z-10 w-full px-6 sm:px-10 lg:px-14 pb-4 sm:pb-5 lg:pb-6 pt-1">
            <BottomNav />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. MAYA RECEPTIONIST (Interactive Voice Core & Capability Intro)          */}
        {/* ========================================================================= */}
        <MayaReceptionist />

        {/* ========================================================================= */}
        {/* 3. LIGHT MODE PRODUCT SHOWCASE ("MEET MAYA" & LIVE DASHBOARD)             */}
        {/* ========================================================================= */}
        <MayaAgentShowcase />
      </motion.main>
    </>
  );
}
