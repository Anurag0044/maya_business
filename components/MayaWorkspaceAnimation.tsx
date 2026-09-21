"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import {
  Phone,
  Users,
  Calendar,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  RotateCcw,
  Send,
  Activity,
  ArrowUpRight,
} from "lucide-react";

interface MayaWorkspaceAnimationProps {
  isDark: boolean;
}

type AnimationPhase =
  | "cursor-enter"
  | "typing"
  | "clicking-send"
  | "thinking"
  | "building"
  | "dashboard";

const PROMPT_TEXT = "Maya show me today's analytic updates";

// Signature MAYA Geometric Brand Mark
function MayaBrandMark({
  isDark,
  className = "h-4 w-auto",
}: {
  isDark: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="25 80 460 350"
      className={className}
      shapeRendering="geometricPrecision"
      aria-hidden="true"
    >
      <path
        d="M 29 427 L 144 373 L 361 85 Q 215 245 29 427 Z"
        fill={isDark ? "#FFFFFF" : "#0F172A"}
      />
      <path
        d="M 184 388 L 328 214 L 328 259 Z"
        fill={isDark ? "#64748B" : "#475569"}
      />
      <path
        d="M 328 214 L 482 420 L 328 259 Z"
        fill={isDark ? "#FFFFFF" : "#0F172A"}
      />
    </svg>
  );
}

export default function MayaWorkspaceAnimation({
  isDark,
}: MayaWorkspaceAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const promptBarRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLDivElement>(null);
  const sendBtnRef = useRef<HTMLButtonElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);
  const chartPathRef = useRef<SVGPathElement>(null);
  const chartAreaRef = useRef<SVGPathElement>(null);

  const [phase, setPhase] = useState<AnimationPhase>("cursor-enter");
  const [typedText, setTypedText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSendActive, setIsSendActive] = useState(false);

  // Animated KPI numbers
  const [metrics, setMetrics] = useState({
    calls: 0,
    leads: 0,
    appointments: 0,
    conversion: 0,
  });

  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const runAnimationRef = useRef<() => void>(() => {});

  // Dynamic target position calculation relative to stage (always measures real DOM)
  const getTargetPos = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) {
      return { inputX: 220, inputY: 210, sendX: 410, sendY: 210 };
    }
    const stageRect = stage.getBoundingClientRect();

    let inputX = stageRect.width / 2 - 80;
    let inputY = stageRect.height * 0.48;

    if (promptInputRef.current) {
      const i = promptInputRef.current.getBoundingClientRect();
      if (i.width > 0 && i.height > 0) {
        inputX = i.left - stageRect.left + 28 - 3;
        inputY = i.top - stageRect.top + i.height / 2 - 3;
      }
    } else if (promptBarRef.current) {
      const p = promptBarRef.current.getBoundingClientRect();
      if (p.width > 0 && p.height > 0) {
        inputX = p.left - stageRect.left + 50 - 3;
        inputY = p.top - stageRect.top + p.height / 2 - 3;
      }
    }

    let sendX = stageRect.width / 2 + 180;
    let sendY = stageRect.height * 0.48;

    if (sendBtnRef.current) {
      const b = sendBtnRef.current.getBoundingClientRect();
      if (b.width > 0 && b.height > 0) {
        sendX = b.left - stageRect.left + b.width / 2 - 3;
        sendY = b.top - stageRect.top + b.height / 2 - 3;
      }
    }

    return { inputX, inputY, sendX, sendY };
  }, []);

  const restartAnimation = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    setPhase("cursor-enter");
    setTypedText("");
    setIsFocused(false);
    setIsSendActive(false);
    setMetrics({ calls: 0, leads: 0, appointments: 0, conversion: 0 });

    // Allow React state to commit and DOM elements to mount before starting timeline
    requestAnimationFrame(() => {
      setTimeout(() => {
        runAnimationRef.current();
      }, 60);
    });
  }, []);

  // Primary animation controller: stable position, slower deliberate cursor & typing
  const runAnimation = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const cursor = cursorRef.current;
    const ripple = rippleRef.current;
    const stage = stageRef.current;
    if (!cursor || !stage) return;

    if (ripple) {
      gsap.set(ripple, { scale: 0, opacity: 0 });
    }

    // Dynamic initial cursor position: bottom-right of stage
    const s = stage.getBoundingClientRect();
    const initX = s.width > 500 ? s.width * 0.74 : s.width * 0.82;
    const initY = s.height * 0.76;

    gsap.set(cursor, {
      x: initX,
      y: initY,
      scale: 1,
      opacity: 0,
      rotate: -12,
    });

    const tl = gsap.timeline({
      onComplete: () => {
        // Hold for 7 seconds on the finished dashboard, then loop cleanly
        gsap.delayedCall(7, () => {
          restartAnimation();
        });
      },
    });
    timelineRef.current = tl;

    // -------------------------------------------------------------
    // PHASE 1: Slower Deliberate Cursor Glide to Prompt Bar
    // -------------------------------------------------------------
    tl.to(cursor, {
      opacity: 1,
      duration: 0.6,
      ease: "power2.out",
    });

    // Dynamic function: ALWAYS evaluates live coordinates of prompt input
    tl.to(
      cursor,
      {
        x: () => getTargetPos().inputX,
        y: () => getTargetPos().inputY,
        rotate: -2,
        duration: 2.2,
        ease: "power2.inOut",
      },
      "<+=0.1"
    );

    // Intentional pause before clicking into the prompt
    tl.to({}, { duration: 0.3 });

    // Cursor click compression on prompt bar
    tl.to(cursor, {
      scale: 0.82,
      duration: 0.15,
      ease: "power1.in",
      onComplete: () => {
        setIsFocused(true);
        if (ripple) {
          const currentPos = getTargetPos();
          gsap.fromTo(
            ripple,
            { scale: 0.3, opacity: 0.55, x: currentPos.inputX + 3, y: currentPos.inputY + 3 },
            { scale: 2.2, opacity: 0, duration: 0.5, ease: "power2.out" }
          );
        }
      },
    });

    tl.to(cursor, {
      scale: 1,
      duration: 0.22,
      ease: "back.out(2)",
    });

    // Deliberate pause before typing begins
    tl.to({}, { duration: 0.45 });

    // -------------------------------------------------------------
    // PHASE 2: Slower, Realistic, Confident Typing Cadence
    // -------------------------------------------------------------
    tl.call(() => {
      setPhase("typing");
    });

    // Slower typing speed: words flow with clear, human-like cadence
    for (let i = 1; i <= PROMPT_TEXT.length; i++) {
      const sub = PROMPT_TEXT.substring(0, i);
      const isSpace = PROMPT_TEXT[i - 1] === " ";
      // Spaces give a thoughtful breath between words; letters type at ~0.12s-0.16s
      const delay = isSpace ? 0.3 : 0.12 + Math.random() * 0.04;

      tl.to({}, {
        duration: delay,
        onStart: () => {
          setTypedText(sub);
        },
      });
    }

    // Deliberate pause after finishing typing
    tl.to({}, { duration: 0.5 });

    // Activate Send button visual state
    tl.call(() => {
      setIsSendActive(true);
      setPhase("clicking-send");
    });

    // -------------------------------------------------------------
    // SLOW DELIBERATE GLIDE TO SEND BUTTON + CLICK
    // -------------------------------------------------------------
    // Dynamic function: ALWAYS evaluates live coordinates of Send button
    tl.to(
      cursor,
      {
        x: () => getTargetPos().sendX,
        y: () => getTargetPos().sendY,
        rotate: 0,
        duration: 1.8,
        ease: "power2.inOut",
      },
      "+=0.08"
    );

    // Deliberate hover pause over the Send button
    tl.to({}, { duration: 0.35 });

    // Press Send Button down (cursor + button depression effect)
    tl.to(cursor, {
      scale: 0.78,
      duration: 0.14,
      ease: "power1.in",
    });

    tl.to(
      sendBtnRef.current,
      {
        scale: 0.86,
        duration: 0.14,
        ease: "power1.in",
        onComplete: () => {
          if (ripple) {
            const currentPos = getTargetPos();
            gsap.fromTo(
              ripple,
              { scale: 0.4, opacity: 0.8, x: currentPos.sendX + 3, y: currentPos.sendY + 3 },
              { scale: 3.2, opacity: 0, duration: 0.55, ease: "power2.out" }
            );
          }
        },
      },
      "<"
    );

    // Spring button and cursor back
    tl.to(cursor, {
      scale: 1,
      duration: 0.22,
      ease: "back.out(2.2)",
    });

    tl.to(
      sendBtnRef.current,
      {
        scale: 1.05,
        duration: 0.22,
        ease: "back.out(2.2)",
      },
      "<"
    );

    // Cursor drifts naturally away and fades
    tl.to(cursor, {
      opacity: 0,
      x: "+=22",
      y: "+=26",
      duration: 0.6,
      ease: "power2.in",
    });

    // -------------------------------------------------------------
    // PHASE 3: "Maya is thinking"
    // -------------------------------------------------------------
    tl.call(() => {
      setPhase("thinking");
    });

    tl.to({}, { duration: 1.5 });

    // -------------------------------------------------------------
    // PHASE 4: "Maya is building"
    // -------------------------------------------------------------
    tl.call(() => {
      setPhase("building");
    });

    tl.to({}, { duration: 1.4 });

    // -------------------------------------------------------------
    // PHASE 5: Dashboard Production (The Climax Reveal)
    // -------------------------------------------------------------
    tl.call(() => {
      setPhase("dashboard");

      // Number count-up animation
      const countObj = { calls: 0, leads: 0, appointments: 0, conversion: 0 };
      gsap.to(countObj, {
        calls: 24,
        leads: 12,
        appointments: 8,
        conversion: 18.4,
        duration: 1.4,
        ease: "power2.out",
        onUpdate: () => {
          setMetrics({
            calls: Math.round(countObj.calls),
            leads: Math.round(countObj.leads),
            appointments: Math.round(countObj.appointments),
            conversion: Number(countObj.conversion.toFixed(1)),
          });
        },
      });
    });

    // Animate Chart Spline Stroke drawing in
    tl.fromTo(
      chartPathRef.current,
      { strokeDashoffset: 600, strokeDasharray: 600 },
      { strokeDashoffset: 0, duration: 1.4, ease: "power2.out" },
      "+=0.1"
    );

    tl.fromTo(
      chartAreaRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: "power2.out" },
      "-=0.7"
    );
  }, [getTargetPos, restartAnimation]);

  runAnimationRef.current = runAnimation;

  useEffect(() => {
    const timer = setTimeout(() => {
      runAnimation();
    }, 120);

    return () => {
      clearTimeout(timer);
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [runAnimation]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full min-h-[480px] sm:min-h-[520px] rounded-2xl sm:rounded-3xl border overflow-hidden flex flex-col transition-colors duration-300 select-none ${
        isDark
          ? "bg-[#0B0D13]/95 border-white/[0.08] shadow-[0_24px_70px_-15px_rgba(0,0,0,0.85)]"
          : "bg-white border-[#E2E8F0] shadow-[0_24px_60px_-12px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.03)]"
      }`}
    >
      {/* ----------------------------------------------------------------- */}
      {/* Top Window Header Bar: Minimal, Clean, Premium (No clutter)      */}
      {/* ----------------------------------------------------------------- */}
      <div
        className={`px-4 sm:px-5 py-3 border-b flex items-center justify-between text-[11px] font-mono tracking-wider transition-colors z-20 ${
          isDark
            ? "bg-[#0E121B]/90 border-white/[0.07] text-[#717682]"
            : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]"
        }`}
      >
        <div className="flex items-center gap-2">
          {/* Subtle Muted Traffic Dots */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full inline-block ${
                isDark ? "bg-white/20" : "bg-slate-300"
              }`}
            />
            <span
              className={`w-2 h-2 rounded-full inline-block ${
                isDark ? "bg-white/20" : "bg-slate-300"
              }`}
            />
            <span
              className={`w-2 h-2 rounded-full inline-block ${
                isDark ? "bg-white/20" : "bg-slate-300"
              }`}
            />
          </div>
        </div>

        {/* Minimalist Replay Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => restartAnimation()}
            title="Replay Animation"
            type="button"
            className={`p-1.5 rounded-md border transition-all cursor-pointer ${
              isDark
                ? "border-white/[0.08] hover:bg-white/[0.06] text-[#717682] hover:text-white"
                : "border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900"
            }`}
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Dynamic Animated Stage Area (Stable Position, Zero Jitter)        */}
      {/* ----------------------------------------------------------------- */}
      <div
        ref={stageRef}
        className="relative flex-1 p-5 sm:p-6 flex flex-col justify-between overflow-hidden"
      >
        {/* Architectural Subtle Diffuse Light */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-700"
          style={{
            background: isDark
              ? "radial-gradient(ellipse 60% 45% at 50% 25%, rgba(255, 255, 255, 0.025), transparent 70%)"
              : "radial-gradient(ellipse 60% 45% at 50% 25%, rgba(15, 23, 42, 0.02), transparent 70%)",
          }}
        />

        {/* =============================================================== */}
        {/* PHASES 0, 1, 2: Interactive Prompt Bar View (Original Position) */}
        {/* =============================================================== */}
        {(phase === "cursor-enter" ||
          phase === "typing" ||
          phase === "clicking-send") && (
          <motion.div
            key="prompt-phase"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col items-center justify-center my-auto"
          >
            {/* Center Brand Mark Icon & Heading: Exact Original Resting Position */}
            <div className="flex flex-col items-center mb-6 text-center">
              <div
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-3 shadow-sm transition-colors ${
                  isDark
                    ? "bg-[#121622] border-white/[0.08]"
                    : "bg-[#F1F5F9] border-[#E2E8F0]"
                }`}
              >
                <MayaBrandMark isDark={isDark} className="h-5 w-auto" />
              </div>

              <h4
                className={`text-[17px] sm:text-[18px] font-light tracking-[-0.02em] leading-snug ${
                  isDark ? "text-white" : "text-[#0F172A]"
                }`}
              >
                What would you like Maya to analyze?
              </h4>
              <p
                className={`text-[12px] mt-1 font-normal tracking-[-0.005em] ${
                  isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                }`}
              >
                Natural language query into live visual dashboards
              </p>
            </div>

            {/* Glowing Prompt Bar */}
            <div className="w-full max-w-md relative group">
              <div
                ref={promptBarRef}
                className={`relative rounded-xl px-4 py-3 flex items-center justify-between border shadow-sm transition-all duration-300 ${
                  isFocused
                    ? isDark
                      ? "bg-[#0E121B] border-white/30 ring-1 ring-white/10 shadow-[0_0_25px_rgba(255,255,255,0.03)]"
                      : "bg-white border-slate-400 ring-1 ring-slate-200"
                    : isDark
                    ? "bg-[#0E121B] border-white/[0.08] hover:border-white/20"
                    : "bg-[#F8FAFC] border-[#E2E8F0] hover:border-slate-300"
                }`}
              >
                {/* Input Text / Caret */}
                <div
                  ref={promptInputRef}
                  className="flex items-center gap-2.5 flex-1 overflow-hidden pr-2"
                >
                  <MayaBrandMark
                    isDark={isDark}
                    className="h-3.5 w-auto shrink-0 opacity-70"
                  />
                  <div className="flex items-center text-[12.5px] tracking-[-0.01em] font-normal truncate">
                    {typedText ? (
                      <span className={isDark ? "text-white" : "text-[#0F172A]"}>
                        {typedText}
                      </span>
                    ) : (
                      <span
                        className={
                          isDark ? "text-[#717682]" : "text-[#94A3B8]"
                        }
                      >
                        Ask Maya anything or query metrics...
                      </span>
                    )}

                    {/* Blinking Typing Caret */}
                    {isFocused && (
                      <span
                        className={`inline-block w-[1.5px] h-3.5 ml-0.5 animate-pulse ${
                          isDark ? "bg-white" : "bg-[#0F172A]"
                        }`}
                      />
                    )}
                  </div>
                </div>

                {/* Send Button: Consistent with Hero Get Started Button */}
                <button
                  ref={sendBtnRef}
                  type="button"
                  aria-label="Send prompt"
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer will-change-transform ${
                    isSendActive
                      ? isDark
                        ? "bg-white text-black shadow-sm scale-105"
                        : "bg-[#0F172A] text-white shadow-sm scale-105"
                      : isDark
                      ? "bg-white/[0.05] text-[#717682] border border-white/[0.08]"
                      : "bg-slate-100 text-[#94A3B8] border border-slate-200"
                  }`}
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>

              {/* Shortcut Suggestion Pills */}
              <div className="flex items-center justify-center gap-2 mt-3 text-[10px] font-mono">
                <span
                  className={`px-2 py-0.5 rounded-md border ${
                    isDark
                      ? "bg-white/[0.03] border-white/[0.07] text-[#717682]"
                      : "bg-slate-100 border-slate-200 text-slate-600"
                  }`}
                >
                  Tab: Autocomplete
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md border ${
                    isDark
                      ? "bg-white/[0.03] border-white/[0.07] text-[#717682]"
                      : "bg-slate-100 border-slate-200 text-slate-600"
                  }`}
                >
                  Return: Build Dashboards
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* =============================================================== */}
        {/* PHASE 3: "Maya is thinking" State (Minimal & Clean)             */}
        {/* =============================================================== */}
        {phase === "thinking" && (
          <motion.div
            key="thinking-phase"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="flex-1 flex flex-col items-center justify-center my-auto"
          >
            {/* Minimal Brand Container */}
            <div
              className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 shadow-sm ${
                isDark
                  ? "bg-[#121622] border-white/[0.08]"
                  : "bg-[#F1F5F9] border-[#E2E8F0]"
              }`}
            >
              <MayaBrandMark isDark={isDark} className="h-5 w-auto" />
            </div>

            {/* Prompt Echo */}
            <div
              className={`px-3 py-1 rounded-full text-[11px] font-mono mb-3 border ${
                isDark
                  ? "bg-white/[0.03] border-white/[0.08] text-[#8e95a5]"
                  : "bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              &ldquo;{PROMPT_TEXT}&rdquo;
            </div>

            {/* Thinking Editorial Shimmer Text */}
            <div className="flex items-center gap-2 text-[17px] sm:text-[18px] font-light tracking-[-0.02em]">
              <span className="animate-luxury-shimmer">Maya is thinking</span>
              <span className="flex items-center gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full animate-bounce ${
                    isDark ? "bg-white/90" : "bg-[#0F172A]"
                  }`}
                />
                <span
                  className={`w-1.5 h-1.5 rounded-full animate-bounce ${
                    isDark ? "bg-white/60" : "bg-[#64748B]"
                  }`}
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className={`w-1.5 h-1.5 rounded-full animate-bounce ${
                    isDark ? "bg-white/30" : "bg-[#CBD5E1]"
                  }`}
                  style={{ animationDelay: "300ms" }}
                />
              </span>
            </div>

            <p
              className={`text-[12px] mt-1.5 font-normal tracking-[-0.005em] ${
                isDark ? "text-[#717682]" : "text-[#64748B]"
              }`}
            >
              Synthesizing 24 inbound calls, conversion velocity, and lead data...
            </p>
          </motion.div>
        )}

        {/* =============================================================== */}
        {/* PHASE 4: "Maya is building" (Minimalist Skeleton Assembly)      */}
        {/* =============================================================== */}
        {phase === "building" && (
          <motion.div
            key="building-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col gap-3 justify-between"
          >
            {/* Assembly Header Pill */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                <span
                  className={`text-[12.5px] font-medium tracking-[-0.01em] ${
                    isDark ? "text-white" : "text-[#0F172A]"
                  }`}
                >
                  Maya is building dashboards...
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#8e95a5] uppercase tracking-wider">
                Compiling 4 visual cards + spline stream
              </span>
            </div>

            {/* Skeleton Grid: 4 Metric Wireframes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`rounded-xl p-3 border border-dashed flex flex-col justify-between h-20 transition-all animate-pulse ${
                    isDark
                      ? "border-white/[0.07] bg-white/[0.015]"
                      : "border-slate-200 bg-slate-50/50"
                  }`}
                >
                  <div
                    className={`h-2.5 w-16 rounded ${
                      isDark ? "bg-white/[0.06]" : "bg-slate-200"
                    }`}
                  />
                  <div
                    className={`h-6 w-12 rounded my-1 ${
                      isDark ? "bg-white/[0.09]" : "bg-slate-300"
                    }`}
                  />
                  <div
                    className={`h-2 w-10 rounded ${
                      isDark ? "bg-white/[0.06]" : "bg-slate-200"
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Skeleton Chart & Insight Assembly Wireframe */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
              {/* Wide Chart Wireframe */}
              <div
                className={`md:col-span-2 rounded-xl p-4 border border-dashed flex flex-col justify-between min-h-[140px] animate-pulse ${
                  isDark
                    ? "border-white/[0.07] bg-white/[0.015]"
                    : "border-slate-200 bg-slate-50/50"
                }`}
              >
                <div className="flex justify-between">
                  <div
                    className={`h-3 w-36 rounded ${
                      isDark ? "bg-white/[0.06]" : "bg-slate-200"
                    }`}
                  />
                  <div
                    className={`h-3 w-16 rounded ${
                      isDark ? "bg-white/[0.06]" : "bg-slate-200"
                    }`}
                  />
                </div>
                {/* Simulated Waveform Wireframe */}
                <div className="flex items-end gap-1.5 h-16 pt-3">
                  {[20, 45, 30, 65, 80, 50, 95, 70, 85, 60, 90, 75].map(
                    (h, idx) => (
                      <div
                        key={idx}
                        style={{ height: `${h}%` }}
                        className={`flex-1 rounded-t transition-all ${
                          isDark ? "bg-white/[0.05]" : "bg-slate-200"
                        }`}
                      />
                    )
                  )}
                </div>
              </div>

              {/* AI Insight Pill Wireframe */}
              <div
                className={`rounded-xl p-4 border border-dashed flex flex-col justify-between min-h-[140px] animate-pulse ${
                  isDark
                    ? "border-white/[0.07] bg-white/[0.015]"
                    : "border-slate-200 bg-slate-50/50"
                }`}
              >
                <div
                  className={`h-3 w-28 rounded ${
                    isDark ? "bg-white/[0.06]" : "bg-slate-200"
                  }`}
                />
                <div className="flex flex-col gap-2 my-2">
                  <div
                    className={`h-2.5 w-full rounded ${
                      isDark ? "bg-white/[0.06]" : "bg-slate-200"
                    }`}
                  />
                  <div
                    className={`h-2.5 w-4/5 rounded ${
                      isDark ? "bg-white/[0.06]" : "bg-slate-200"
                    }`}
                  />
                  <div
                    className={`h-2.5 w-3/5 rounded ${
                      isDark ? "bg-white/[0.06]" : "bg-slate-200"
                    }`}
                  />
                </div>
                <div
                  className={`h-5 w-24 rounded ${
                    isDark ? "bg-white/[0.09]" : "bg-slate-300"
                  }`}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* =============================================================== */}
        {/* PHASE 5: Live Produced Dashboards (Disciplined Luxury)         */}
        {/* =============================================================== */}
        {phase === "dashboard" && (
          <motion.div
            key="dashboard-phase"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col gap-3.5 justify-between"
          >
            {/* Docked Top Command Context Bar */}
            <div
              className={`rounded-xl px-3.5 py-2 border flex items-center justify-between transition-colors ${
                isDark
                  ? "bg-[#121622]/85 border-white/[0.06]"
                  : "bg-slate-50 border-[#E2E8F0]"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate pr-2">
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    isDark
                      ? "bg-white/[0.04] border-white/[0.08]"
                      : "bg-white border-[#E2E8F0]"
                  }`}
                >
                  <MayaBrandMark isDark={isDark} className="h-2.5 w-auto" />
                </div>
                <span
                  className={`text-[12px] font-normal tracking-[-0.01em] truncate ${
                    isDark ? "text-[#8e95a5]" : "text-slate-600"
                  }`}
                >
                  Prompt:{" "}
                  <span
                    className={`font-medium ${
                      isDark ? "text-white" : "text-[#0F172A]"
                    }`}
                  >
                    &ldquo;{PROMPT_TEXT}&rdquo;
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline-block text-[9.5px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">
                  Built in 1.4s
                </span>
                <span
                  className={`text-[9.5px] font-mono uppercase tracking-wider ${
                    isDark ? "text-[#717682]" : "text-[#64748B]"
                  }`}
                >
                  Live Today
                </span>
              </div>
            </div>

            {/* 4 KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Metric 1: Calls Handled */}
              <div
                className={`rounded-xl p-3 flex flex-col justify-between border transition-all ${
                  isDark
                    ? "bg-[#121622]/85 border-white/[0.06]"
                    : "bg-[#F8FAFC] border-[#E2E8F0]/80"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`text-[9px] font-medium uppercase tracking-[0.18em] select-none ${
                      isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                    }`}
                  >
                    Calls Handled
                  </span>
                  <Phone
                    className={`w-3.5 h-3.5 ${
                      isDark ? "text-[#64748B]" : "text-[#94A3B8]"
                    }`}
                  />
                </div>
                <div className="my-1.5 flex items-baseline justify-between">
                  <span
                    className={`text-[24px] sm:text-[26px] font-light tracking-[-0.035em] tabular-nums ${
                      isDark ? "text-white" : "text-[#0F172A]"
                    }`}
                  >
                    {metrics.calls}
                  </span>
                </div>
                <div className="flex items-center text-[10px] font-medium font-mono text-[#10B981]">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>+12%</span>
                </div>
              </div>

              {/* Metric 2: Leads Qualified */}
              <div
                className={`rounded-xl p-3 flex flex-col justify-between border transition-all ${
                  isDark
                    ? "bg-[#121622]/85 border-white/[0.06]"
                    : "bg-[#F8FAFC] border-[#E2E8F0]/80"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`text-[9px] font-medium uppercase tracking-[0.18em] select-none ${
                      isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                    }`}
                  >
                    Leads Qualified
                  </span>
                  <Users
                    className={`w-3.5 h-3.5 ${
                      isDark ? "text-[#64748B]" : "text-[#94A3B8]"
                    }`}
                  />
                </div>
                <div className="my-1.5 flex items-baseline justify-between">
                  <span
                    className={`text-[24px] sm:text-[26px] font-light tracking-[-0.035em] tabular-nums ${
                      isDark ? "text-white" : "text-[#0F172A]"
                    }`}
                  >
                    {metrics.leads}
                  </span>
                </div>
                <div className="flex items-center text-[10px] font-medium font-mono text-[#10B981]">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>+8%</span>
                </div>
              </div>

              {/* Metric 3: Appointments */}
              <div
                className={`rounded-xl p-3 flex flex-col justify-between border transition-all ${
                  isDark
                    ? "bg-[#121622]/85 border-white/[0.06]"
                    : "bg-[#F8FAFC] border-[#E2E8F0]/80"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`text-[9px] font-medium uppercase tracking-[0.18em] select-none ${
                      isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                    }`}
                  >
                    Appointments
                  </span>
                  <Calendar
                    className={`w-3.5 h-3.5 ${
                      isDark ? "text-[#64748B]" : "text-[#94A3B8]"
                    }`}
                  />
                </div>
                <div className="my-1.5 flex items-baseline justify-between">
                  <span
                    className={`text-[24px] sm:text-[26px] font-light tracking-[-0.035em] tabular-nums ${
                      isDark ? "text-white" : "text-[#0F172A]"
                    }`}
                  >
                    {metrics.appointments}
                  </span>
                </div>
                <div className="flex items-center text-[10px] font-medium font-mono text-[#10B981]">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>+20%</span>
                </div>
              </div>

              {/* Metric 4: Conversion Rate */}
              <div
                className={`rounded-xl p-3 flex flex-col justify-between border transition-all ${
                  isDark
                    ? "bg-[#121622]/85 border-white/[0.06]"
                    : "bg-[#F8FAFC] border-[#E2E8F0]/80"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`text-[9px] font-medium uppercase tracking-[0.18em] select-none ${
                      isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                    }`}
                  >
                    Conversion Rate
                  </span>
                  <BarChart2
                    className={`w-3.5 h-3.5 ${
                      isDark ? "text-[#64748B]" : "text-[#94A3B8]"
                    }`}
                  />
                </div>
                <div className="my-1.5 flex items-baseline justify-between">
                  <span
                    className={`text-[24px] sm:text-[26px] font-light tracking-[-0.035em] tabular-nums ${
                      isDark ? "text-white" : "text-[#0F172A]"
                    }`}
                  >
                    {metrics.conversion}%
                  </span>
                </div>
                <div className="flex items-center text-[10px] font-medium font-mono text-[#10B981]">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>+6%</span>
                </div>
              </div>
            </div>

            {/* Visual Analytics Chart & Maya Executive Synthesis */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1">
              {/* Left / Main Spline Area Chart (7 Cols) */}
              <div
                className={`md:col-span-7 rounded-xl p-3.5 flex flex-col justify-between border transition-colors ${
                  isDark
                    ? "bg-[#121622]/85 border-white/[0.06]"
                    : "bg-[#F8FAFC] border-[#E2E8F0]/80"
                }`}
              >
                <div
                  className={`flex items-center justify-between pb-2 border-b ${
                    isDark ? "border-white/[0.06]" : "border-[#E2E8F0]"
                  }`}
                >
                  <div>
                    <h5
                      className={`text-[12px] font-medium tracking-[-0.01em] ${
                        isDark ? "text-white" : "text-[#0F172A]"
                      }`}
                    >
                      Hourly Call &amp; Qualification Velocity
                    </h5>
                    <p
                      className={`text-[10px] font-mono ${
                        isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                      }`}
                    >
                      Peak engagement between 1:00 PM – 3:30 PM
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 text-[9.5px] font-mono px-2 py-0.5 rounded border ${
                      isDark
                        ? "bg-white/[0.03] border-white/[0.08] text-[#8e95a5]"
                        : "bg-slate-100 border-slate-200 text-slate-600"
                    }`}
                  >
                    <Activity className="w-3 h-3" />
                    <span>Live Spline</span>
                  </div>
                </div>

                {/* SVG Area & Stroke Drawing: Disciplined Monochrome Line */}
                <div className="relative w-full h-28 my-1 flex items-end">
                  <svg
                    viewBox="0 0 400 120"
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="chartMonochromeGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={isDark ? "#FFFFFF" : "#0F172A"}
                          stopOpacity={isDark ? "0.08" : "0.05"}
                        />
                        <stop
                          offset="100%"
                          stopColor={isDark ? "#FFFFFF" : "#0F172A"}
                          stopOpacity="0.0"
                        />
                      </linearGradient>
                    </defs>

                    {/* Background Grid Lines */}
                    <line
                      x1="0"
                      y1="30"
                      x2="400"
                      y2="30"
                      stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"}
                      strokeDasharray="4 4"
                    />
                    <line
                      x1="0"
                      y1="75"
                      x2="400"
                      y2="75"
                      stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"}
                      strokeDasharray="4 4"
                    />

                    {/* Gradient Area Fill */}
                    <path
                      ref={chartAreaRef}
                      d="M 0 100 Q 60 70, 110 82 T 220 30 T 310 55 T 400 15 L 400 120 L 0 120 Z"
                      fill="url(#chartMonochromeGradient)"
                    />

                    {/* Main Spline Line: Crisp Razor Line */}
                    <path
                      ref={chartPathRef}
                      d="M 0 100 Q 60 70, 110 82 T 220 30 T 310 55 T 400 15"
                      fill="none"
                      stroke={isDark ? "#FFFFFF" : "#0F172A"}
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />

                    {/* Peak Point Pulsing Radar Dot */}
                    <circle
                      cx="220"
                      cy="30"
                      r="3.5"
                      fill={isDark ? "#FFFFFF" : "#0F172A"}
                    />
                    <circle
                      cx="220"
                      cy="30"
                      r="8"
                      fill="none"
                      stroke={isDark ? "#FFFFFF" : "#0F172A"}
                      strokeOpacity="0.3"
                      strokeWidth="1"
                      className="animate-ping"
                    />
                  </svg>

                  {/* Floating Peak Tooltip */}
                  <div
                    className="absolute top-1 left-[46%] -translate-x-1/2 px-2.5 py-0.5 rounded text-[9px] font-mono tracking-wider shadow-md border backdrop-blur-md pointer-events-none"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(11, 13, 19, 0.95)"
                        : "rgba(255, 255, 255, 0.95)",
                      borderColor: isDark
                        ? "rgba(255, 255, 255, 0.12)"
                        : "rgba(226, 232, 240, 1)",
                      color: isDark ? "#FFFFFF" : "#0F172A",
                    }}
                  >
                    Peak: 2:15 PM • 6 calls/hr
                  </div>
                </div>

                {/* X Axis Time Labels */}
                <div
                  className={`flex justify-between text-[9px] font-mono pt-1 ${
                    isDark ? "text-[#717682]" : "text-[#94A3B8]"
                  }`}
                >
                  <span>9:00 AM</span>
                  <span>12:00 PM</span>
                  <span>2:15 PM</span>
                  <span>4:00 PM</span>
                  <span>Now</span>
                </div>
              </div>

              {/* Right / Maya Executive Synthesis Card (5 Cols) */}
              <div
                className={`md:col-span-5 rounded-xl p-3.5 flex flex-col justify-between border transition-colors ${
                  isDark
                    ? "bg-[#121622]/85 border-white/[0.06]"
                    : "bg-[#F8FAFC] border-[#E2E8F0]/80"
                }`}
              >
                <div>
                  <div
                    className={`flex items-center justify-between pb-2 border-b ${
                      isDark ? "border-white/[0.06]" : "border-[#E2E8F0]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <MayaBrandMark isDark={isDark} className="h-3 w-auto" />
                      <span
                        className={`text-[11px] font-medium tracking-tight ${
                          isDark ? "text-white" : "text-[#0F172A]"
                        }`}
                      >
                        Maya Executive Brief
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded border border-[#10B981]/20">
                      High Confidence
                    </span>
                  </div>

                  <p
                    className={`text-[11.5px] leading-relaxed mt-2.5 font-normal tracking-[-0.005em] ${
                      isDark ? "text-[#9ca3af]" : "text-[#334155]"
                    }`}
                  >
                    &ldquo;Inbound calls surged +34% after 1 PM. Conversion
                    reached{" "}
                    <strong
                      className={`font-medium ${
                        isDark ? "text-white" : "text-[#0F172A]"
                      }`}
                    >
                      18.4%
                    </strong>{" "}
                    with 8 consultations booked directly into your
                    calendar.&rdquo;
                  </p>
                </div>

                {/* Bottom Action CTAs: Matching Hero CTAs */}
                <div className="flex items-center gap-2 pt-3">
                  <div
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[10.5px] font-medium border transition-colors cursor-pointer ${
                      isDark
                        ? "bg-white/[0.04] hover:bg-white/[0.08] text-white border-white/[0.1]"
                        : "bg-white hover:bg-slate-100 text-slate-800 border-slate-200"
                    }`}
                  >
                    <span>Export Brief</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                  <div
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[10.5px] font-medium transition-colors cursor-pointer shadow-sm ${
                      isDark
                        ? "bg-white text-black hover:bg-neutral-100"
                        : "bg-[#0F172A] text-white hover:bg-black"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Sync CRM</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* =============================================================== */}
        {/* Animated Virtual Cursor                                         */}
        {/* =============================================================== */}
        <div
          ref={cursorRef}
          className="absolute top-0 left-0 pointer-events-none z-50 will-change-transform"
          style={{ transform: "translate3d(340px, 280px, 0)" }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]"
          >
            <path
              d="M3 3L10.5 21L14 13.5L21.5 10L3 3Z"
              fill={isDark ? "#FFFFFF" : "#0F172A"}
              stroke={isDark ? "#0F172A" : "#FFFFFF"}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Tactile Click Ripple (Subtle Glass Wave) */}
        <div
          ref={rippleRef}
          className="absolute pointer-events-none z-40 rounded-full w-8 h-8 -translate-x-1/2 -translate-y-1/2"
          style={{
            background: isDark
              ? "radial-gradient(circle, rgba(255, 255, 255, 0.45) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(15, 23, 42, 0.25) 0%, transparent 70%)",
          }}
        />
      </div>
    </div>
  );
}
