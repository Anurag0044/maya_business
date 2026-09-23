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
  ArrowUp,
  Activity,
  ArrowUpRight,
  MessageSquare,
} from "lucide-react";
import GeometricThinkingAnimation from "./GeometricThinkingAnimation";
import { usePageLoad } from "@/context/PageLoadContext";

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

const PROMPT_TEXT = "How did our business perform today?";

// Signature MAYA Geometric Brand Mark (Faceted Titanium Vector Rendering)
function MayaBrandMark({
  isDark,
  className = "h-4 w-auto",
}: {
  isDark: boolean;
  className?: string;
}) {
  const uniqueId = React.useId().replace(/:/g, "_");
  return (
    <svg
      viewBox="25 80 460 350"
      className={className}
      shapeRendering="geometricPrecision"
      aria-hidden="true"
    >
      <defs>
        {/* Left Blade - Main Specular Face */}
        <linearGradient id={`maya-blade-${uniqueId}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={isDark ? "#808EA3" : "#64748B"} />
          <stop offset="35%" stopColor={isDark ? "#E2E8F0" : "#94A3B8"} />
          <stop offset="70%" stopColor={isDark ? "#FFFFFF" : "#0F172A"} />
          <stop offset="100%" stopColor={isDark ? "#CBD5E1" : "#334155"} />
        </linearGradient>

        {/* Right Chevron - Left Face */}
        <linearGradient id={`maya-chev-left-${uniqueId}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={isDark ? "#64748B" : "#475569"} />
          <stop offset="45%" stopColor={isDark ? "#CBD5E1" : "#94A3B8"} />
          <stop offset="100%" stopColor={isDark ? "#FFFFFF" : "#0F172A"} />
        </linearGradient>

        {/* Right Chevron - Right Face */}
        <linearGradient id={`maya-chev-right-${uniqueId}`} x1="0%" y1="100%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isDark ? "#FFFFFF" : "#0F172A"} />
          <stop offset="45%" stopColor={isDark ? "#CBD5E1" : "#64748B"} />
          <stop offset="100%" stopColor={isDark ? "#475569" : "#334155"} />
        </linearGradient>
      </defs>

      {/* Left Blade: Clean razor-sharp geometry with sweeping upper arc */}
      <g>
        <path
          d="M 29 427 L 144 373 L 361 85 Q 215 245 29 427 Z"
          fill={`url(#maya-blade-${uniqueId})`}
        />
        {/* Chamfer highlight line with specular trace */}
        <line
          x1="144"
          y1="373"
          x2="361"
          y2="85"
          stroke={isDark ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.85)"}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>

      {/* Right Chevron: Symmetrical faceted monogram */}
      <g>
        <path
          d="M 184 388 L 328 214 L 328 259 Z"
          fill={`url(#maya-chev-left-${uniqueId})`}
        />
        <path
          d="M 328 214 L 482 420 L 328 259 Z"
          fill={`url(#maya-chev-right-${uniqueId})`}
        />
        {/* Center ridge specular highlight */}
        <line
          x1="328"
          y1="214"
          x2="328"
          y2="259"
          stroke={isDark ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.9)"}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

// Apple-caliber fluid S-curve: smooth ease-in-out cubic for organic rolling numbers
function appleSmoothEase(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function AppleCountUp({
  value,
  duration = 2.4,
  delay = 0.25,
  decimals = 0,
  suffix = "",
}: {
  value: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  suffix?: string;
}) {
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let reqId: number;
    const delayMs = delay * 1000;
    const durationMs = duration * 1000;

    const timer = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / durationMs, 1);
        // Apple fluid S-curve: gentle awakening, mid-flight velocity, velvety deceleration
        const eased = appleSmoothEase(progress);
        const current = eased * value;

        setDisplayVal(current);

        if (progress < 1) {
          reqId = requestAnimationFrame(step);
        } else {
          setDisplayVal(value);
        }
      };
      reqId = requestAnimationFrame(step);
    }, delayMs);

    return () => {
      clearTimeout(timer);
      if (reqId) cancelAnimationFrame(reqId);
    };
  }, [value, duration, delay]);

  return (
    <span>
      {decimals > 0 ? displayVal.toFixed(decimals) : Math.round(displayVal)}
      {suffix}
    </span>
  );
}

// Apple-grade staggered fluid card entrance animation
const cardMotion = (idx: number) => ({
  initial: { opacity: 0, y: 14, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: {
    duration: 0.55,
    ease: [0.16, 1, 0.3, 1] as const,
    delay: idx * 0.07,
  },
});

// Biomechanical Cubic Bézier point evaluation for natural human motor trajectories
function getCubicBezier(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  t: number
) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  };
}

export default function MayaWorkspaceAnimation({
  isDark,
}: MayaWorkspaceAnimationProps) {
  const { isPageReady } = usePageLoad();
  const hasStartedRef = useRef(false);
  const isInViewRef = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const promptBarRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLDivElement>(null);
  const sendBtnRef = useRef<HTMLButtonElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);
  const chartPathRef = useRef<SVGPathElement>(null);
  const chartAreaRef = useRef<SVGPathElement>(null);
  const iconHeadingRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

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
  const runAnimationRef = useRef<() => void>(() => { });

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
        inputX = i.left - stageRect.left + 16 - 3;
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

    if (chatWindowRef.current) {
      gsap.set(chatWindowRef.current, { scale: 1, rotateX: 0, rotateY: 0, transformOrigin: "center center" });
    }
    if (iconHeadingRef.current) {
      gsap.set(iconHeadingRef.current, { opacity: 1, filter: "blur(0px)" });
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

    // Initialize first interface camera state: normal POV, zero tilt
    if (chatWindowRef.current) {
      gsap.set(chatWindowRef.current, { scale: 1, rotateX: 0, rotateY: 0, transformOrigin: "center center" });
    }
    if (iconHeadingRef.current) {
      gsap.set(iconHeadingRef.current, { opacity: 1, filter: "blur(0px)" });
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
    // PHASE 1: Organic Human Cursor Glide to Prompt Bar (Natural Pacing & Settle)
    // -------------------------------------------------------------
    tl.to(cursor, {
      opacity: 1,
      duration: 0.25,
      ease: "power1.out",
    });

    const targetPos = getTargetPos();
    const p0 = { x: initX, y: initY };
    const dx = targetPos.inputX - p0.x;
    const dy = targetPos.inputY - p0.y;
    const dist = Math.hypot(dx, dy);

    // Biomechanical wrist arc offsets (proportional to distance)
    const arcX = Math.sign(dx) * Math.min(22, Math.max(8, Math.abs(dx) * 0.04));
    const arcY = Math.min(26, Math.max(10, dist * 0.06));

    const p1 = { x: p0.x + dx * 0.35 + arcX, y: p0.y + dy * 0.22 + arcY };
    const p2 = { x: p0.x + dx * 0.78 - arcX * 0.4, y: p0.y + dy * 0.85 - arcY * 0.2 };
    const pOver = { x: targetPos.inputX - 1.5, y: targetPos.inputY + 1.0 };

    const approachFlight = { t: 0 };
    tl.to(
      approachFlight,
      {
        t: 1,
        duration: 0.85,
        ease: "power2.out",
        onUpdate: () => {
          const pt = getCubicBezier(p0, p1, p2, pOver, approachFlight.t);
          // Subtle dynamic banking / tilt along velocity
          const tilt = -10 + approachFlight.t * 9 + Math.sin(approachFlight.t * Math.PI) * 1.5;
          gsap.set(cursor, { x: pt.x, y: pt.y, rotate: tilt });
        },
      },
      "<+=0.04"
    );

    // Fitts's law corrective micro-settle onto input target
    tl.to(cursor, {
      x: () => getTargetPos().inputX,
      y: () => getTargetPos().inputY,
      rotate: 0,
      duration: 0.12,
      ease: "power1.out",
    });

    // Human ocular verification pause before clicking
    tl.to({}, { duration: 0.12 });

    // Tactile click compression on prompt bar
    tl.to(cursor, {
      scale: 0.86,
      y: "+=1.2",
      duration: 0.10,
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

    // Elastic mouse-up release
    tl.to(cursor, {
      scale: 1,
      y: "-=1.2",
      duration: 0.18,
      ease: "back.out(2)",
    });

    // -------------------------------------------------------------
    // CAMERA FOCUS ON CHAT WINDOW (Only in first interface)
    // -------------------------------------------------------------
    tl.to(
      chatWindowRef.current,
      {
        scale: 1.09,
        rotateX: 3.2,
        rotateY: -1.8,
        duration: 0.65,
        ease: "power2.inOut",
      },
      "<+=0.04"
    );

    tl.to(
      iconHeadingRef.current,
      {
        opacity: 0.45,
        filter: "blur(1.5px)",
        duration: 0.65,
        ease: "power2.inOut",
      },
      "<"
    );

    // Cognitive delay as hands move to keyboard
    tl.to({}, { duration: 0.28 });

    // -------------------------------------------------------------
    // PHASE 2: Natural, Rhythmic Human Typing Cadence with Cognitive Pacing
    // -------------------------------------------------------------
    tl.call(() => {
      setPhase("typing");
    });

    for (let i = 1; i <= PROMPT_TEXT.length; i++) {
      const char = PROMPT_TEXT[i - 1];
      const prevChar = i > 1 ? PROMPT_TEXT[i - 2] : "";
      const isSpace = char === " ";
      const isPunctuation = char === "?" || char === "." || char === "!";

      // Realistic human typing cadence:
      // - Punctuation mark: deliberate pause (~190ms)
      // - Space between words: natural word-boundary hesitation (~155ms)
      // - Word-initial keystroke: slight cognitive trigger (~110ms)
      // - Intra-word characters: fluid, natural variance (~82ms - 100ms)
      let delay = 0.088 + Math.sin(i * 1.5) * 0.014;
      if (isSpace) {
        delay = 0.155;
      } else if (isPunctuation) {
        delay = 0.19;
      } else if (prevChar === " ") {
        delay = 0.11;
      }

      tl.to({}, {
        duration: delay,
        onStart: () => {
          setTypedText(PROMPT_TEXT.substring(0, i));
        },
      });

      // At character 3: user's hand relaxes and parks mouse slightly out of the way
      if (i === 3) {
        tl.to(
          cursor,
          {
            x: () => getTargetPos().inputX + 38,
            y: () => getTargetPos().inputY + 22,
            rotate: 0,
            duration: 0.45,
            ease: "power1.out",
          },
          "<"
        );
      }

      // At character 27: hand returns to mouse; anticipatory drift towards Send button
      if (i === 27) {
        tl.to(
          cursor,
          {
            x: () => getTargetPos().sendX - 36,
            y: () => getTargetPos().sendY + 12,
            rotate: 2,
            duration: 0.50,
            ease: "power1.inOut",
          },
          "<"
        );
      }
    }

    // Deliberate ocular confirmation pause after finishing typing
    tl.to({}, { duration: 0.28 });

    // Activate Send button visual state
    tl.call(() => {
      setIsSendActive(true);
      setPhase("clicking-send");
    });

    // -------------------------------------------------------------
    // PHASE 2.5: Curved Glide to Send Button + Tactile Click
    // -------------------------------------------------------------
    const sendFlight: {
      t: number;
      p0?: { x: number; y: number };
      p1?: { x: number; y: number };
      p2?: { x: number; y: number };
      pOver?: { x: number; y: number };
    } = { t: 0 };

    tl.to(sendFlight, {
      t: 1,
      duration: 0.52,
      ease: "power2.out",
      onStart: () => {
        const pos = getTargetPos();
        sendFlight.p0 = { x: pos.sendX - 36, y: pos.sendY + 12 };
        sendFlight.p1 = { x: pos.sendX - 22, y: pos.sendY + 14 };
        sendFlight.p2 = { x: pos.sendX - 6, y: pos.sendY - 2 };
        sendFlight.pOver = { x: pos.sendX + 1.0, y: pos.sendY - 0.5 };
      },
      onUpdate: () => {
        if (sendFlight.p0 && sendFlight.p1 && sendFlight.p2 && sendFlight.pOver) {
          const pt = getCubicBezier(
            sendFlight.p0,
            sendFlight.p1,
            sendFlight.p2,
            sendFlight.pOver,
            sendFlight.t
          );
          gsap.set(cursor, { x: pt.x, y: pt.y, rotate: 2 - sendFlight.t * 2 });
        }
      },
    });

    // Micro-settle into Send button center
    tl.to(cursor, {
      x: () => getTargetPos().sendX,
      y: () => getTargetPos().sendY,
      rotate: 0,
      duration: 0.12,
      ease: "power1.out",
    });

    // Hover reaction on Send button + human target confirmation pause
    tl.to(sendBtnRef.current, {
      scale: 1.08,
      duration: 0.14,
      ease: "power1.out",
    });

    // Tactile Send button depression
    tl.to(cursor, {
      scale: 0.80,
      y: "+=1",
      duration: 0.11,
      ease: "power1.in",
    });

    tl.to(
      sendBtnRef.current,
      {
        scale: 0.86,
        duration: 0.11,
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

    // Elastic spring back
    tl.to(cursor, {
      scale: 1,
      y: "-=1",
      duration: 0.18,
      ease: "back.out(2)",
    });

    tl.to(
      sendBtnRef.current,
      {
        scale: 1.05,
        duration: 0.20,
        ease: "back.out(2.2)",
      },
      "<"
    );

    // -------------------------------------------------------------
    // CAMERA RETURN: Smoothly return to normal POV as prompt is sent
    // -------------------------------------------------------------
    tl.to(
      chatWindowRef.current,
      {
        scale: 1.0,
        rotateX: 0,
        rotateY: 0,
        duration: 0.65,
        ease: "power2.inOut",
      },
      "<"
    );

    tl.to(
      iconHeadingRef.current,
      {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.65,
        ease: "power2.inOut",
      },
      "<"
    );

    // Natural follow-through relaxation: Hand eases down-right and fades out
    tl.to(cursor, {
      opacity: 0,
      x: "+=26",
      y: "+=20",
      rotate: "+=4",
      duration: 0.65,
      ease: "power2.out",
    }, "<");

    // -------------------------------------------------------------
    // PHASE 3: Thinking Sequence (Maya is thinking -> Searching resources -> Building the final result)
    // -------------------------------------------------------------
    tl.call(() => {
      setPhase("thinking");
    });

    tl.to({}, { duration: 5.0 });

    // -------------------------------------------------------------
    // PHASE 5: Dashboard Production (The Final Result Reveal)
    // -------------------------------------------------------------
    tl.call(() => {
      setPhase("dashboard");
    });
  }, [getTargetPos, restartAnimation]);

  runAnimationRef.current = runAnimation;

  // IntersectionObserver: Triggers animation when the user scrolls down to the agent showcase
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const isIntersecting = entry.isIntersecting;
        isInViewRef.current = isIntersecting;

        // When the workspace card enters view and the page loader is finished
        if (isIntersecting && isPageReady && !hasStartedRef.current) {
          hasStartedRef.current = true;
          setTimeout(() => {
            runAnimation();
          }, 220);
        }
      },
      {
        threshold: 0.2, // Triggers when at least 20% of the showcase card is visible
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [isPageReady, runAnimation]);

  // If the user refreshed while already scrolled down to this section:
  // Wait for isPageReady (loader finished), then trigger smoothly
  useEffect(() => {
    if (isPageReady && isInViewRef.current && !hasStartedRef.current) {
      hasStartedRef.current = true;
      const timer = setTimeout(() => {
        runAnimation();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isPageReady, runAnimation]);

  // If the user scrolls all the way back to the top (Hero section),
  // reset so that the next time they scroll down it plays again from the beginning!
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 40 && hasStartedRef.current) {
        hasStartedRef.current = false;
        if (timelineRef.current) {
          timelineRef.current.kill();
        }
        setPhase("cursor-enter");
        setTypedText("");
        setIsFocused(false);
        setIsSendActive(false);
        setMetrics({ calls: 0, leads: 0, appointments: 0, conversion: 0 });
        if (cursorRef.current) {
          gsap.set(cursorRef.current, { opacity: 0 });
        }
        if (chatWindowRef.current) {
          gsap.set(chatWindowRef.current, { scale: 1, rotateX: 0, rotateY: 0 });
        }
        if (iconHeadingRef.current) {
          gsap.set(iconHeadingRef.current, { opacity: 1, filter: "blur(0px)" });
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full min-h-[480px] sm:min-h-[520px] rounded-2xl sm:rounded-3xl border overflow-hidden flex flex-col transition-colors duration-300 select-none ${isDark
        ? "bg-[#0B0D13]/95 border-white/[0.08] shadow-[0_24px_70px_-15px_rgba(0,0,0,0.85)]"
        : "bg-white border-[#E2E8F0] shadow-[0_24px_60px_-12px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.03)]"
        }`}
    >
      {/* ----------------------------------------------------------------- */}
      {/* Top Window Header Bar: Minimal, Clean, Premium (No clutter)      */}
      {/* ----------------------------------------------------------------- */}
      <div
        className={`px-4 sm:px-5 py-3 border-b flex items-center justify-between text-[11px] font-mono tracking-wider transition-colors z-20 ${isDark
          ? "bg-[#0E121B]/90 border-white/[0.07] text-[#717682]"
          : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]"
          }`}
      >
        <div className="flex items-center gap-2">
          {/* Subtle Muted Traffic Dots */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full inline-block ${isDark ? "bg-white/20" : "bg-slate-300"
                }`}
            />
            <span
              className={`w-2 h-2 rounded-full inline-block ${isDark ? "bg-white/20" : "bg-slate-300"
                }`}
            />
            <span
              className={`w-2 h-2 rounded-full inline-block ${isDark ? "bg-white/20" : "bg-slate-300"
                }`}
            />
          </div>
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
              {/* Center Brand Mark Icon & Heading */}
              <div
                ref={iconHeadingRef}
                className="flex flex-col items-center mb-5 text-center will-change-transform"
              >
                <div className="relative mb-3 flex items-center justify-center">
                  {/* Subtle ethereal diffuse glow behind the pure mark */}
                  <div
                    className={`absolute w-12 h-12 rounded-full blur-xl pointer-events-none transition-opacity duration-500 ${isDark ? "bg-white/[0.08]" : "bg-slate-400/[0.12]"
                      }`}
                  />
                  <MayaBrandMark
                    isDark={isDark}
                    className="h-7 sm:h-7.5 w-auto relative z-10 transition-transform duration-300 hover:scale-105"
                  />
                </div>

                <h4
                  className={`text-[17px] sm:text-[18px] font-light tracking-[-0.02em] leading-snug ${isDark ? "text-white" : "text-[#0F172A]"
                    }`}
                >
                  What would you like MAYA to handle today?
                </h4>
              </div>

              {/* Glowing Premium Floating Prompt Capsule */}
              <div
                ref={chatWindowRef}
                className="w-full max-w-md relative group will-change-transform"
                style={{
                  transformOrigin: "center center",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Ambient Unidirectional Soft Glow on Hover */}
                <div
                  className={`absolute -inset-[2px] rounded-full pointer-events-none overflow-hidden transition-opacity duration-500 blur-[8px] ${isFocused ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                >
                  <motion.div
                    className="w-full h-full"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
                    style={{
                      background: isDark
                        ? "linear-gradient(90deg, transparent 0%, rgba(251, 191, 36, 0.16) 35%, rgba(255, 255, 255, 0.22) 50%, rgba(251, 191, 36, 0.16) 65%, transparent 100%)"
                        : "linear-gradient(90deg, transparent 0%, rgba(217, 119, 6, 0.12) 35%, rgba(15, 23, 42, 0.12) 50%, rgba(217, 119, 6, 0.12) 65%, transparent 100%)",
                    }}
                  />
                </div>

                {/* Precision Unidirectional Border Beam: Left-to-Right Edge Flow */}
                <div
                  className={`absolute -inset-[1px] rounded-full pointer-events-none overflow-hidden transition-opacity duration-500 ${isFocused ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  style={{
                    padding: "1px",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                  } as React.CSSProperties}
                >
                  <motion.div
                    className="w-full h-full"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
                    style={{
                      background: isDark
                        ? "linear-gradient(90deg, transparent 0%, rgba(251, 191, 36, 0.25) 30%, rgba(255, 255, 255, 0.95) 50%, rgba(251, 191, 36, 0.25) 70%, transparent 100%)"
                        : "linear-gradient(90deg, transparent 0%, rgba(217, 119, 6, 0.25) 30%, rgba(15, 23, 42, 0.85) 50%, rgba(217, 119, 6, 0.25) 70%, transparent 100%)",
                    }}
                  />
                </div>

                {/* Primary Capsule Container with Clean Specular Edge */}
                <div
                  ref={promptBarRef}
                  className={`relative rounded-full px-5 py-2.5 sm:py-3 flex items-center justify-between border backdrop-blur-xl transition-all duration-500 ease-out ${isFocused
                    ? isDark
                      ? "bg-[#0E121B] border-white/25 ring-1 ring-white/10 shadow-[0_4px_28px_rgba(0,0,0,0.5),0_0_20px_rgba(255,255,255,0.03)]"
                      : "bg-white border-slate-400 ring-1 ring-slate-200 shadow-[0_4px_24px_rgba(15,23,42,0.08)]"
                    : isDark
                      ? "bg-[#0E121B]/95 border-white/[0.09] hover:border-white/25 hover:shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_18px_rgba(255,255,255,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.35)]"
                      : "bg-[#F8FAFC] border-[#E2E8F0] hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06),0_0_16px_rgba(15,23,42,0.02)] shadow-[0_4px_16px_rgba(15,23,42,0.04)]"
                    }`}
                >
                  {/* Input Text / Caret */}
                  <div
                    ref={promptInputRef}
                    className="flex items-center flex-1 overflow-hidden pr-2 pl-1"
                  >
                    <div className="flex items-center text-[13px] tracking-[-0.01em] font-normal truncate">
                      {typedText ? (
                        <span className={isDark ? "text-white" : "text-[#0F172A]"}>
                          {typedText}
                        </span>
                      ) : (
                        <span
                          className={
                            isDark ? "text-white/40" : "text-slate-400"
                          }
                        >
                          Ask MAYA anything...
                        </span>
                      )}

                      {/* Blinking Typing Caret */}
                      {isFocused && (
                        <span
                          className={`inline-block w-[1.5px] h-3.5 ml-0.5 animate-pulse ${isDark ? "bg-white" : "bg-[#0F172A]"
                            }`}
                        />
                      )}
                    </div>
                  </div>

                  {/* Send Button: Minimal & Premium Circular Arrow Button */}
                  <button
                    ref={sendBtnRef}
                    type="button"
                    aria-label="Send prompt"
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer will-change-transform shrink-0 ${isSendActive
                      ? isDark
                        ? "bg-white text-black shadow-sm scale-105"
                        : "bg-[#0F172A] text-white shadow-sm scale-105"
                      : isDark
                        ? "bg-white/[0.06] text-white/40 border border-white/[0.08]"
                        : "bg-slate-100 text-[#94A3B8] border border-slate-200"
                      }`}
                  >
                    <ArrowUp className="w-3.5 h-3.5 stroke-[2.4]" />
                  </button>
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col items-center justify-center my-auto w-full"
          >
            <GeometricThinkingAnimation
              isDark={isDark}
              promptText={PROMPT_TEXT}
            />
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
                  className={`text-[12.5px] font-medium tracking-[-0.01em] ${isDark ? "text-white" : "text-[#0F172A]"
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
                  className={`rounded-xl p-3 border border-dashed flex flex-col justify-between h-20 transition-all animate-pulse ${isDark
                    ? "border-white/[0.07] bg-white/[0.015]"
                    : "border-slate-200 bg-slate-50/50"
                    }`}
                >
                  <div
                    className={`h-2.5 w-16 rounded ${isDark ? "bg-white/[0.06]" : "bg-slate-200"
                      }`}
                  />
                  <div
                    className={`h-6 w-12 rounded my-1 ${isDark ? "bg-white/[0.09]" : "bg-slate-300"
                      }`}
                  />
                  <div
                    className={`h-2 w-10 rounded ${isDark ? "bg-white/[0.06]" : "bg-slate-200"
                      }`}
                  />
                </div>
              ))}
            </div>

            {/* Skeleton Chart & Insight Assembly Wireframe */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
              {/* Wide Chart Wireframe */}
              <div
                className={`md:col-span-2 rounded-xl p-4 border border-dashed flex flex-col justify-between min-h-[140px] animate-pulse ${isDark
                  ? "border-white/[0.07] bg-white/[0.015]"
                  : "border-slate-200 bg-slate-50/50"
                  }`}
              >
                <div className="flex justify-between">
                  <div
                    className={`h-3 w-36 rounded ${isDark ? "bg-white/[0.06]" : "bg-slate-200"
                      }`}
                  />
                  <div
                    className={`h-3 w-16 rounded ${isDark ? "bg-white/[0.06]" : "bg-slate-200"
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
                        className={`flex-1 rounded-t transition-all ${isDark ? "bg-white/[0.05]" : "bg-slate-200"
                          }`}
                      />
                    )
                  )}
                </div>
              </div>

              {/* AI Insight Pill Wireframe */}
              <div
                className={`rounded-xl p-4 border border-dashed flex flex-col justify-between min-h-[140px] animate-pulse ${isDark
                  ? "border-white/[0.07] bg-white/[0.015]"
                  : "border-slate-200 bg-slate-50/50"
                  }`}
              >
                <div
                  className={`h-3 w-28 rounded ${isDark ? "bg-white/[0.06]" : "bg-slate-200"
                    }`}
                />
                <div className="flex flex-col gap-2 my-2">
                  <div
                    className={`h-2.5 w-full rounded ${isDark ? "bg-white/[0.06]" : "bg-slate-200"
                      }`}
                  />
                  <div
                    className={`h-2.5 w-4/5 rounded ${isDark ? "bg-white/[0.06]" : "bg-slate-200"
                      }`}
                  />
                  <div
                    className={`h-2.5 w-3/5 rounded ${isDark ? "bg-white/[0.06]" : "bg-slate-200"
                      }`}
                  />
                </div>
                <div
                  className={`h-5 w-24 rounded ${isDark ? "bg-white/[0.09]" : "bg-slate-300"
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col gap-3.5 justify-between"
          >
            {/* 4 KPI Metric Cards with Staggered Entrance & Apple Rolling Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Metric 1: Calls handled */}
              <motion.div
                {...cardMotion(0)}
                className={`rounded-xl p-3 flex flex-col justify-between border transition-all ${isDark
                  ? "bg-[#121622]/85 border-white/[0.06]"
                  : "bg-[#F8FAFC] border-[#E2E8F0]/80"
                  }`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`text-[12px] font-normal tracking-[-0.01em] select-none ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                      }`}
                  >
                    Calls Handled
                  </span>
                  <Phone
                    className={`w-3.5 h-3.5 ${isDark ? "text-[#64748B]" : "text-[#94A3B8]"
                      }`}
                  />
                </div>
                <div className="my-1.5 flex items-baseline justify-between">
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                    className={`text-[24px] sm:text-[26px] font-light tracking-[-0.035em] tabular-nums inline-block ${isDark ? "text-white" : "text-[#0F172A]"
                      }`}
                  >
                    <AppleCountUp value={24} delay={0.25} duration={2.4} />
                  </motion.span>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 1.15 }}
                  className={`inline-flex items-center gap-0.5 text-[10.5px] font-medium tabular-nums tracking-tight ${isDark ? "text-emerald-400" : "text-emerald-600"
                    }`}
                >
                  <TrendingUp className="w-2.5 h-2.5 stroke-[2.2]" />
                  <span>+12%</span>
                </motion.div>
              </motion.div>

              {/* Metric 2: New Leads */}
              <motion.div
                {...cardMotion(1)}
                className={`rounded-xl p-3 flex flex-col justify-between border transition-all ${isDark
                  ? "bg-[#121622]/85 border-white/[0.06]"
                  : "bg-[#F8FAFC] border-[#E2E8F0]/80"
                  }`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`text-[12px] font-normal tracking-[-0.01em] select-none ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                      }`}
                  >
                    New Leads
                  </span>
                  <Users
                    className={`w-3.5 h-3.5 ${isDark ? "text-[#64748B]" : "text-[#94A3B8]"
                      }`}
                  />
                </div>
                <div className="my-1.5 flex items-baseline justify-between">
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.22 }}
                    className={`text-[24px] sm:text-[26px] font-light tracking-[-0.035em] tabular-nums inline-block ${isDark ? "text-white" : "text-[#0F172A]"
                      }`}
                  >
                    <AppleCountUp value={12} delay={0.35} duration={2.3} />
                  </motion.span>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 1.25 }}
                  className={`inline-flex items-center gap-0.5 text-[10.5px] font-medium tabular-nums tracking-tight ${isDark ? "text-emerald-400" : "text-emerald-600"
                    }`}
                >
                  <TrendingUp className="w-2.5 h-2.5 stroke-[2.2]" />
                  <span>+8%</span>
                </motion.div>
              </motion.div>

              {/* Metric 3: Appointments */}
              <motion.div
                {...cardMotion(2)}
                className={`rounded-xl p-3 flex flex-col justify-between border transition-all ${isDark
                  ? "bg-[#121622]/85 border-white/[0.06]"
                  : "bg-[#F8FAFC] border-[#E2E8F0]/80"
                  }`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`text-[12px] font-normal tracking-[-0.01em] select-none ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                      }`}
                  >
                    Appointments
                  </span>
                  <Calendar
                    className={`w-3.5 h-3.5 ${isDark ? "text-[#64748B]" : "text-[#94A3B8]"
                      }`}
                  />
                </div>
                <div className="my-1.5 flex items-baseline justify-between">
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.29 }}
                    className={`text-[24px] sm:text-[26px] font-light tracking-[-0.035em] tabular-nums inline-block ${isDark ? "text-white" : "text-[#0F172A]"
                      }`}
                  >
                    <AppleCountUp value={8} delay={0.45} duration={2.2} />
                  </motion.span>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 1.35 }}
                  className={`inline-flex items-center gap-0.5 text-[10.5px] font-medium tabular-nums tracking-tight ${isDark ? "text-emerald-400" : "text-emerald-600"
                    }`}
                >
                  <TrendingUp className="w-2.5 h-2.5 stroke-[2.2]" />
                  <span>+20%</span>
                </motion.div>
              </motion.div>

              {/* Metric 4: Conversion rate */}
              <motion.div
                {...cardMotion(3)}
                className={`rounded-xl p-3 flex flex-col justify-between border transition-all ${isDark
                  ? "bg-[#121622]/85 border-white/[0.06]"
                  : "bg-[#F8FAFC] border-[#E2E8F0]/80"
                  }`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`text-[12px] font-normal tracking-[-0.01em] select-none ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                      }`}
                  >
                    Conversion Rate
                  </span>
                  <MessageSquare
                    className={`w-3.5 h-3.5 ${isDark ? "text-[#64748B]" : "text-[#94A3B8]"
                      }`}
                  />
                </div>
                <div className="my-1.5 flex items-baseline justify-between">
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.36 }}
                    className={`text-[24px] sm:text-[26px] font-light tracking-[-0.035em] tabular-nums inline-block ${isDark ? "text-white" : "text-[#0F172A]"
                      }`}
                  >
                    <AppleCountUp value={18.4} decimals={1} suffix="%" delay={0.55} duration={2.4} />
                  </motion.span>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 1.45 }}
                  className={`inline-flex items-center gap-0.5 text-[10.5px] font-medium tabular-nums tracking-tight ${isDark ? "text-emerald-400" : "text-emerald-600"
                    }`}
                >
                  <TrendingUp className="w-2.5 h-2.5 stroke-[2.2]" />
                  <span>+6%</span>
                </motion.div>
              </motion.div>
            </div>

            {/* Visual Analytics Chart & Maya Executive Synthesis with Apple Staggered Reveal */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1">
              {/* Left / Activity over the day Spline Chart (7 Cols) */}
              <motion.div
                {...cardMotion(4)}
                className={`md:col-span-7 rounded-xl p-3.5 flex flex-col justify-between border transition-colors ${isDark
                  ? "bg-[#121622]/85 border-white/[0.06]"
                  : "bg-[#F8FAFC] border-[#E2E8F0]/80"
                  }`}
              >
                <div
                  className={`flex items-center justify-between pb-2 border-b ${isDark ? "border-white/[0.06]" : "border-[#E2E8F0]"
                    }`}
                >
                  <div>
                    <h5
                      className={`text-[12px] font-medium tracking-[-0.01em] ${isDark ? "text-white" : "text-[#0F172A]"
                        }`}
                    >
                      Activity over the day
                    </h5>
                    <p
                      className={`text-[10px] font-mono ${isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                        }`}
                    >
                      Peak engagement between 1:00 PM – 3:30 PM
                    </p>
                  </div>
                </div>

                {/* SVG Area & Stroke Drawing: Fluid Apple-Style Path Draw */}
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

                    {/* Gradient Area Fill: Gentle Dissolve */}
                    <motion.path
                      d="M 0 100 Q 60 70, 110 82 T 220 30 T 310 55 T 400 15 L 400 120 L 0 120 Z"
                      fill="url(#chartMonochromeGradient)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1.4, ease: "easeOut", delay: 0.8 }}
                    />

                    {/* Vertical Dashed Peak Guideline */}
                    <motion.line
                      x1="220"
                      y1="34"
                      x2="220"
                      y2="115"
                      stroke={isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)"}
                      strokeDasharray="2 3"
                      strokeWidth="1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.45, delay: 1.50 }}
                    />

                    {/* Main Spline Line: Fluid Progressive Draw-in */}
                    <motion.path
                      d="M 0 100 Q 60 70, 110 82 T 220 30 T 310 55 T 400 15"
                      fill="none"
                      stroke={isDark ? "#FFFFFF" : "#0F172A"}
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{
                        pathLength: { duration: 2.8, ease: [0.16, 1, 0.3, 1], delay: 0.25 },
                        opacity: { duration: 0.3, delay: 0.25 },
                      }}
                    />

                    {/* Peak Point Concentric Halo */}
                    <motion.circle
                      cx="220"
                      cy="30"
                      r="6.5"
                      fill="none"
                      stroke={isDark ? "#FFFFFF" : "#0F172A"}
                      strokeWidth="1"
                      strokeOpacity="0.22"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 20,
                        delay: 1.48,
                      }}
                    />

                    {/* Peak Point Core Dot */}
                    <motion.circle
                      cx="220"
                      cy="30"
                      r="3"
                      fill={isDark ? "#FFFFFF" : "#0F172A"}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 22,
                        delay: 1.48,
                      }}
                    />
                  </svg>

                  {/* Minimal Frosted Peak Annotation Pill */}
                  <motion.div
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 1.55 }}
                    className="absolute top-1.5 left-[55%] -translate-x-1/2 pointer-events-none"
                  >
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-tight border backdrop-blur-md transition-colors ${isDark
                        ? "bg-white/[0.07] border-white/10 text-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                        : "bg-white/90 border-slate-200/90 text-slate-800 shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
                        }`}
                    >
                      <span
                        className={`w-1 h-1 rounded-full shrink-0 ${isDark
                          ? "bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.6)]"
                          : "bg-amber-500"
                          }`}
                      />
                      <span className="font-semibold">6/hr</span>
                      <span className="opacity-30">•</span>
                      <span className="opacity-70">2:15 PM</span>
                    </div>
                  </motion.div>
                </div>

                {/* X Axis Time Labels */}
                <div
                  className={`flex justify-between text-[9px] font-mono pt-1 ${isDark ? "text-[#717682]" : "text-[#94A3B8]"
                    }`}
                >
                  <span>9:00 AM</span>
                  <span>12:00 PM</span>
                  <span>2:15 PM</span>
                  <span>4:00 PM</span>
                  <span>Now</span>
                </div>
              </motion.div>

              {/* Right / Executive summary Card (5 Cols) */}
              <motion.div
                {...cardMotion(5)}
                className={`md:col-span-5 rounded-xl p-3.5 flex flex-col justify-between border transition-colors ${isDark
                  ? "bg-[#121622]/85 border-white/[0.06]"
                  : "bg-[#F8FAFC] border-[#E2E8F0]/80"
                  }`}
              >
                <div>
                  <div
                    className={`flex items-center pb-2 border-b ${isDark ? "border-white/[0.06]" : "border-[#E2E8F0]"
                      }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <MayaBrandMark isDark={isDark} className="h-3 w-auto" />
                      <span
                        className={`text-[11px] font-medium tracking-tight ${isDark ? "text-white" : "text-[#0F172A]"
                          }`}
                      >
                        Executive summary
                      </span>
                    </div>
                  </div>

                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.52 }}
                    className={`text-[11.5px] leading-relaxed mt-2.5 font-normal tracking-[-0.005em] ${isDark ? "text-[#9ca3af]" : "text-[#334155]"
                      }`}
                  >
                    &ldquo;Today our business handled 24 customer calls with an 18.4% conversation rate, qualifying 12 high-intent leads and scheduling 8 appointments directly into your calendar.&rdquo;
                  </motion.p>
                </div>

                {/* Static Executive Status Indicators (Professional & Clean Metadata matching UI) */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.62 }}
                  className="flex items-center gap-2 pt-3 select-none"
                >
                  <div
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[10.5px] font-medium tracking-tight border ${
                      isDark
                        ? "bg-white/[0.03] border-white/[0.07] text-[#9ca3af]"
                        : "bg-white border-[#E2E8F0] text-[#64748B]"
                    }`}
                  >
                    <ArrowUpRight className="w-3 h-3 opacity-60" />
                    <span>Export summary</span>
                  </div>
                  <div
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[10.5px] font-medium tracking-tight border ${
                      isDark
                        ? "bg-white/[0.03] border-white/[0.07] text-[#9ca3af]"
                        : "bg-white border-[#E2E8F0] text-[#64748B]"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 opacity-60" />
                    <span>Sync CRM</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* =============================================================== */}
        {/* Animated Virtual Cursor                                         */}
        {/* =============================================================== */}
        {/* Animated Virtual Cursor - strictly visible only on chat interface */}
        <div
          ref={cursorRef}
          className={`absolute top-0 left-0 pointer-events-none z-50 will-change-transform transition-opacity duration-200 ${
            phase === "cursor-enter" || phase === "typing" || phase === "clicking-send"
              ? "opacity-100"
              : "opacity-0 invisible"
          }`}
          style={{ transform: "translate3d(340px, 280px, 0)" }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.32)] drop-shadow-[0_6px_14px_rgba(0,0,0,0.22)]"
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
          className={`absolute pointer-events-none z-40 rounded-full w-8 h-8 -translate-x-1/2 -translate-y-1/2 ${
            phase === "cursor-enter" || phase === "typing" || phase === "clicking-send"
              ? ""
              : "opacity-0 invisible"
          }`}
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
