"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { usePageLoad } from "@/context/PageLoadContext";

const CAPABILITIES = [
  "CALLS",
  "LEADS",
  "APPOINTMENTS",
  "FOLLOW-UPS",
  "INSIGHTS",
  "GROWTH",
];

const EDITORIAL_STATEMENT = [
  "A",
  "QUIETER",
  "WAY",
  "TO A",
  "BIGGER",
  "TOMORROW.",
];

const PILLARS = [
  "PEOPLE",
  "CONVERSATIONS",
  "OPPORTUNITIES",
  "REAL PROGRESS.",
];

const lineVariants: Variants = {
  hidden: { opacity: 0, y: 6, filter: "blur(3px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.65,
      delay: 0.12 + i * 0.045,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export default function RightRail() {
  const { isPageReady } = usePageLoad();

  return (
    <motion.aside
      initial={{ opacity: 0, x: 14 }}
      animate={isPageReady ? { opacity: 1, x: 0 } : { opacity: 0, x: 14 }}
      transition={{ duration: 0.85, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="hidden xl:flex flex-col justify-between items-start text-left z-20 pointer-events-none select-none h-full max-h-[74vh] my-auto pl-5 pr-4 py-6 rounded-l-2xl backdrop-blur-md bg-[#060709]/25 border-l border-white/[0.07] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),-8px_0_24px_rgba(0,0,0,0.3)]"
    >
      {/* Top Capabilities Stack */}
      <div className="flex flex-col items-start gap-3">
        <div className="text-[9.5px] font-medium uppercase tracking-[0.24em] text-neutral-300/90 leading-[1.8] space-y-0.5">
          {CAPABILITIES.map((item, idx) => (
            <motion.div
              key={item}
              custom={idx}
              initial="hidden"
              animate={isPageReady ? "visible" : "hidden"}
              variants={lineVariants}
              className="hover:text-white transition-colors duration-200"
            >
              {item}
            </motion.div>
          ))}
        </div>

        {/* Vertical Hairline Accent Rule */}
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          animate={isPageReady ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
          style={{ originY: 0 }}
          className="w-[1px] h-8 bg-gradient-to-b from-white/40 to-white/10 ml-0.5"
        />

        {/* Poetic Editorial Statement */}
        <div className="text-[8.5px] font-normal uppercase tracking-[0.24em] text-neutral-400/80 leading-[1.75] space-y-0.5">
          {EDITORIAL_STATEMENT.map((line, idx) => (
            <motion.div
              key={line}
              custom={idx + 6}
              initial="hidden"
              animate={isPageReady ? "visible" : "hidden"}
              variants={lineVariants}
            >
              {line}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Middle-Lower Section (Pillars above water feature) */}
      <div className="flex flex-col items-start py-2">
        <div className="text-[8.5px] font-medium uppercase tracking-[0.24em] text-neutral-300/80 leading-[1.75] space-y-0.5">
          {PILLARS.map((item, idx) => {
            const isHighlight = item === "REAL PROGRESS.";
            return (
              <motion.div
                key={item}
                custom={idx + 12}
                initial="hidden"
                animate={isPageReady ? "visible" : "hidden"}
                variants={lineVariants}
                className={isHighlight ? "text-white/90" : ""}
              >
                {item}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Scroll Cue */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={isPageReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
        transition={{ duration: 0.7, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-start gap-2 pt-1"
      >
        <div className="text-[8px] font-medium uppercase tracking-[0.22em] text-neutral-400/80 leading-[1.3]">
          <div>SCROLL</div>
          <div>TO EXPLORE</div>
        </div>
        {/* Sleek Mouse outline icon with scroll wheel dot */}
        <div className="w-3.5 h-5 border border-white/30 rounded-full flex justify-center pt-1 ml-0.5 shadow-sm">
          <div className="w-[1px] h-1.5 bg-white/80 rounded-full animate-bounce" />
        </div>
      </motion.div>
    </motion.aside>
  );
}
