import React from "react";
import Metrics from "./Metrics";

export default function Hero() {
  return (
    <div className="flex flex-col justify-center max-w-xl z-10 select-none">
      {/* Eyebrow */}
      <div className="text-[10px] sm:text-[10.5px] font-medium uppercase tracking-[0.24em] text-[#717682] mb-[1.5vh] flex items-center gap-2">
        <span>AI THAT WORKS WHILE YOU DO</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-[clamp(2.4rem,4.8vh,4.75rem)] font-light tracking-[-0.03em] leading-[0.98] text-white">
        <div>More</div>
        <div>Business.</div>
        <div className="text-[#606777]">Less Work.</div>
      </h1>

      {/* Sub-headline / Value Proposition */}
      <p className="mt-[1.6vh] text-[#9ca3af] text-[clamp(0.82rem,1.45vh,0.95rem)] leading-relaxed max-w-[460px] font-normal">
        MAYA Business is your always-on AI receptionist, lead manager and
        operations partner — so you can focus on what truly matters.
      </p>

      {/* CTAs */}
      <div className="flex items-center gap-5 sm:gap-6 my-[2.2vh]">
        {/* Primary CTA Button */}
        <a
          href="#get-started"
          className="group inline-flex items-center gap-2 px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-white text-black font-medium text-[13px] hover:bg-neutral-100 hover:shadow-[0_0_24px_rgba(255,255,255,0.22)] active:scale-[0.98] transition-all duration-300"
        >
          <span>Get started</span>
          <span className="text-[13px] leading-none transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </a>

        {/* Secondary Video CTA */}
        <button
          type="button"
          className="group flex items-center gap-3 text-left focus:outline-none cursor-pointer"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/20 bg-white/[0.04] backdrop-blur-md flex items-center justify-center group-hover:border-white/40 group-hover:bg-white/10 group-hover:scale-105 transition-all duration-200">
            <svg
              className="w-3 h-3 text-white fill-current ml-0.5"
              viewBox="0 0 24 24"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[12.5px] font-medium text-white group-hover:text-white/90 transition-colors">
              See it in action
            </span>
            <span className="text-[11px] text-[#717682] font-normal leading-none mt-0.5">
              2 min
            </span>
          </div>
        </button>
      </div>

      {/* Metrics Row */}
      <Metrics />
    </div>
  );
}
