"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Hammer } from "lucide-react";
import SoftAurora from "./SoftAurora";

interface GeometricThinkingAnimationProps {
  isDark: boolean;
  promptText?: string;
}

// 3-Step Sequence with Bespoke Executive-Grade Color Palettes:
// Dark: Luminous titanium crests + deep royal indigo / azure / emerald
// Light: Elegant corporate pastel watercolor veil
const STEP_THEMES = [
  {
    id: 0,
    label: "Thinking",
    dark: {
      color1: "#F8FAFC", // Titanium Silver White
      color2: "#6366F1", // Royal Electric Indigo
      glow: "rgba(99, 102, 241, 0.28)",
      ring: "border-indigo-400/[0.14]",
      dotGlow: "rgba(99, 102, 241, 0.75)",
      rimGradient: "from-white/25 via-indigo-400/25 to-white/10",
      iconColor: "text-indigo-300",
    },
    light: {
      color1: "#4338CA", // Deep Corporate Indigo
      color2: "#6366F1", // Royal Indigo
      glow: "rgba(79, 70, 229, 0.12)",
      ring: "border-indigo-500/[0.08]",
      dotGlow: "rgba(79, 70, 229, 0.35)",
      rimGradient: "from-slate-200 via-indigo-200/80 to-slate-200",
      iconColor: "text-indigo-600",
    },
  },
  {
    id: 1,
    label: "Searching resources",
    dark: {
      color1: "#F0F9FF", // Luminous Ice Sky White
      color2: "#0284C7", // Electric Azure / Sapphire
      glow: "rgba(14, 165, 233, 0.28)",
      ring: "border-sky-400/[0.14]",
      dotGlow: "rgba(14, 165, 233, 0.75)",
      rimGradient: "from-white/25 via-sky-400/25 to-white/10",
      iconColor: "text-sky-300",
    },
    light: {
      color1: "#0369A1", // Ocean Azure
      color2: "#0284C7", // Sky Blue
      glow: "rgba(2, 132, 199, 0.12)",
      ring: "border-sky-500/[0.08]",
      dotGlow: "rgba(2, 132, 199, 0.35)",
      rimGradient: "from-slate-200 via-sky-200/80 to-slate-200",
      iconColor: "text-sky-600",
    },
  },
  {
    id: 2,
    label: "Building the final result",
    dark: {
      color1: "#F0FDF4", // Mint Pearl White
      color2: "#059669", // Executive Emerald
      glow: "rgba(16, 185, 129, 0.28)",
      ring: "border-emerald-400/[0.14]",
      dotGlow: "rgba(16, 185, 129, 0.75)",
      rimGradient: "from-white/25 via-emerald-400/25 to-white/10",
      iconColor: "text-emerald-300",
    },
    light: {
      color1: "#047857", // Deep Jade
      color2: "#059669", // Mint Emerald
      glow: "rgba(5, 150, 105, 0.12)",
      ring: "border-emerald-500/[0.08]",
      dotGlow: "rgba(5, 150, 105, 0.35)",
      rimGradient: "from-slate-200 via-emerald-200/80 to-slate-200",
      iconColor: "text-emerald-600",
    },
  },
];

// Step 1: Liquid elastic 3-dot wave
function PremiumDotLoader({ isDark, glow }: { isDark: boolean; glow: string }) {
  const dotColor = isDark ? "bg-white" : "bg-[#0F172A]";

  return (
    <div className="flex items-center gap-1.5 px-0.5 shrink-0 h-4">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${dotColor}`}
          animate={{
            y: [0, -2.8, 0],
            scaleY: [1, 1.85, 0.92, 1],
            scaleX: [1, 0.86, 1.10, 1],
            opacity: [0.35, 1, 0.35],
            boxShadow: [
              `0 0 0px ${glow}`,
              `0 0 7px ${glow}`,
              `0 0 0px ${glow}`,
            ],
          }}
          transition={{
            duration: 1.25,
            repeat: Infinity,
            ease: [0.33, 1, 0.68, 1],
            delay: i * 0.16,
          }}
        />
      ))}
    </div>
  );
}

// Step 2: Minimalist search scan icon
function SearchIconLoader({ iconClass }: { iconClass: string }) {
  return (
    <div className={`flex items-center justify-center shrink-0 ${iconClass}`}>
      <motion.div
        animate={{
          rotate: [-8, 8, -8],
          scale: [0.95, 1.08, 0.95],
        }}
        transition={{
          duration: 1.3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="flex items-center justify-center"
      >
        <Search className="w-3.5 h-3.5 stroke-[2.2]" />
      </motion.div>
    </div>
  );
}

// Step 3: Minimalist craft hammer icon
function HammerIconLoader({ iconClass }: { iconClass: string }) {
  return (
    <div className={`flex items-center justify-center shrink-0 ${iconClass}`}>
      <motion.div
        animate={{
          rotate: [0, -20, 0],
        }}
        style={{
          transformOrigin: "80% 80%",
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="flex items-center justify-center"
      >
        <Hammer className="w-3.5 h-3.5 stroke-[2.2]" />
      </motion.div>
    </div>
  );
}

export default function GeometricThinkingAnimation({
  isDark,
}: GeometricThinkingAnimationProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Smooth cadence per phase (~1.65s per phase, 5.0s total):
  // 0.0s  -> Maya is thinking (3 dots animation)
  // 1.65s -> Searching resources (search icon animation)
  // 3.35s -> Building the final result (hammer icon animation)
  // 5.0s  -> Transitions directly to final dashboard
  useEffect(() => {
    const t1 = setTimeout(() => setCurrentStepIndex(1), 1650);
    const t2 = setTimeout(() => setCurrentStepIndex(2), 3350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const activeTheme = STEP_THEMES[currentStepIndex] || STEP_THEMES[0];
  const themeProps = isDark ? activeTheme.dark : activeTheme.light;

  return (
    <div className="relative w-full h-full flex-1 flex flex-col items-center justify-center select-none py-6 overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. SOFT AURORA WEBGL SHADER (Executive Titanium & Indigo/Sapphire Veil)    */}
      {/* ========================================================================= */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center transition-opacity duration-1000"
        style={{
          maskImage:
            "radial-gradient(ellipse 85% 72% at 50% 50%, black 30%, transparent 88%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 85% 72% at 50% 50%, black 30%, transparent 88%)",
          opacity: isDark ? 0.85 : 0.60,
        }}
      >
        <SoftAurora
          speed={0.55}
          scale={1.4}
          brightness={isDark ? 0.95 : 0.70}
          color1={themeProps.color1}
          color2={themeProps.color2}
          noiseFrequency={2.4}
          noiseAmplitude={0.9}
          bandHeight={0.5}
          bandSpread={1.1}
          octaveDecay={0.12}
          layerOffset={0}
          colorSpeed={0.8}
          enableMouseInteraction={false}
          mouseInfluence={0}
          lightMode={!isDark}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {/* ========================================================================= */}
      {/* 2. ARCHITECTURAL RESONANCE RING (Hidden on Dark Mode)                     */}
      {/* ========================================================================= */}
      {!isDark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{
              scale: [0.97, 1.03, 0.97],
              opacity: [0.12, 0.25, 0.12],
            }}
            transition={{
              duration: 4.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`w-72 h-72 rounded-full border transition-colors duration-1000 ${themeProps.ring}`}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MINIMALIST GLASSMORPHIC THINKING CAPSULE                               */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Localized Subtle Luminous Halo hugging Capsule */}
        <div
          className="absolute -inset-2 rounded-full blur-xl transition-all duration-1000 pointer-events-none"
          style={{
            background: themeProps.glow,
          }}
        />

        <motion.div
          layout
          transition={{
            layout: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
          }}
          className={`relative p-[1px] rounded-full transition-all duration-700 shadow-2xl bg-gradient-to-r ${themeProps.rimGradient} ${
            isDark
              ? "shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
              : "shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
          }`}
        >
          {/* Inner Capsule Body */}
          <div
            className={`inline-flex items-center gap-3 px-4.5 py-2 rounded-full backdrop-blur-2xl transition-colors duration-500 ${
              isDark
                ? "bg-[#0B0E17]/85 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14)]"
                : "bg-white/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]"
            }`}
          >
            {/* Dynamic Step Icon */}
            <div className="flex items-center justify-center shrink-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTheme.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center justify-center"
                >
                  {activeTheme.id === 0 && (
                    <PremiumDotLoader isDark={isDark} glow={themeProps.dotGlow} />
                  )}
                  {activeTheme.id === 1 && (
                    <SearchIconLoader iconClass={themeProps.iconColor} />
                  )}
                  {activeTheme.id === 2 && (
                    <HammerIconLoader iconClass={themeProps.iconColor} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dynamic Step Label */}
            <div className="relative h-5 flex items-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={activeTheme.id}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className={`text-[13px] font-medium tracking-tight whitespace-nowrap leading-none ${
                    isDark ? "text-white" : "text-[#0F172A]"
                  }`}
                >
                  {activeTheme.label}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
