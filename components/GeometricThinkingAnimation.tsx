"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Hammer } from "lucide-react";

interface GeometricThinkingAnimationProps {
  isDark: boolean;
  promptText?: string;
}

// Exactly the 3-step sequence:
// 1. Thinking (unique 3 dots animation)
// 2. Searching resources (search icon animation)
// 3. Building the final result (hammer icon animation)
const STEPS = [
  { id: 0, label: "Thinking" },
  { id: 1, label: "Searching resources" },
  { id: 2, label: "Building the final result" },
];

// Step 1: Unique yet minimal liquid elastic wave (squash & stretch + soft luminous aura)
function PremiumDotLoader({ isDark }: { isDark: boolean }) {
  const dotColor = isDark ? "bg-white" : "bg-[#0F172A]";
  const glow = isDark ? "rgba(255,255,255,0.55)" : "rgba(15,23,42,0.22)";

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
            opacity: [0.32, 1, 0.32],
            boxShadow: [
              `0 0 0px ${glow}`,
              `0 0 6px ${glow}`,
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

// Step 2: Minimal & clean search icon scanning animation
function SearchIconLoader({ isDark }: { isDark: boolean }) {
  const iconColor = isDark ? "text-white" : "text-[#0F172A]";

  return (
    <div className={`flex items-center justify-center shrink-0 ${iconColor}`}>
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

// Step 3: Minimal & clean hammer icon crafting animation
function HammerIconLoader({ isDark }: { isDark: boolean }) {
  const iconColor = isDark ? "text-white" : "text-[#0F172A]";

  return (
    <div className={`flex items-center justify-center shrink-0 ${iconColor}`}>
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

function StepIndicator({ stepId, isDark }: { stepId: number; isDark: boolean }) {
  if (stepId === 0) return <PremiumDotLoader isDark={isDark} />;
  if (stepId === 1) return <SearchIconLoader isDark={isDark} />;
  return <HammerIconLoader isDark={isDark} />;
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

  const activeStep = STEPS[currentStepIndex] || STEPS[0];

  return (
    <div className="flex-1 flex flex-col items-center justify-center my-auto w-full max-w-md mx-auto select-none py-6">
      {/* Minimalist Thinking Capsule with Dynamic Symmetrical Padding & Fluid Width */}
      <motion.div
        layout
        transition={{
          layout: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
        }}
        className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full border transition-colors duration-300 ${isDark
            ? "bg-[#0E121B] border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
            : "bg-white border-slate-200 shadow-[0_4px_16px_rgba(15,23,42,0.06)]"
          }`}
      >
        {/* Dynamic Step Icon: 3 Dots -> Search Icon -> Hammer Icon */}
        <div className="flex items-center justify-center shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              className="flex items-center justify-center"
            >
              <StepIndicator stepId={activeStep.id} isDark={isDark} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dynamic Thinking State (Tailored Symmetrical Width) */}
        <div className="relative h-5 flex items-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={activeStep.id}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={`text-[13px] font-medium tracking-tight whitespace-nowrap leading-none ${isDark ? "text-white" : "text-[#0F172A]"
                }`}
            >
              {activeStep.label}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
