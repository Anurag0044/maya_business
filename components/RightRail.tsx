import React from "react";

export default function RightRail() {
  return (
    <aside className="hidden xl:flex flex-col justify-between items-start text-left z-20 pointer-events-none select-none h-full max-h-[74vh] my-auto pl-5 pr-4 py-6 rounded-l-2xl backdrop-blur-md bg-[#060709]/25 border-l border-white/[0.07] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),-8px_0_24px_rgba(0,0,0,0.3)]">
      {/* Top Capabilities Stack */}
      <div className="flex flex-col items-start gap-3">
        <div className="text-[9.5px] font-medium uppercase tracking-[0.24em] text-neutral-300/90 leading-[1.8] space-y-0.5">
          <div className="hover:text-white transition-colors duration-200">CALLS</div>
          <div className="hover:text-white transition-colors duration-200">LEADS</div>
          <div className="hover:text-white transition-colors duration-200">APPOINTMENTS</div>
          <div className="hover:text-white transition-colors duration-200">FOLLOW-UPS</div>
          <div className="hover:text-white transition-colors duration-200">INSIGHTS</div>
          <div className="hover:text-white transition-colors duration-200">GROWTH</div>
        </div>

        {/* Vertical Hairline Accent Rule */}
        <div className="w-[1px] h-8 bg-gradient-to-b from-white/40 to-white/10 ml-0.5" />

        {/* Poetic Editorial Statement */}
        <div className="text-[8.5px] font-normal uppercase tracking-[0.24em] text-neutral-400/80 leading-[1.75] space-y-0.5">
          <div>A</div>
          <div>QUIETER</div>
          <div>WAY</div>
          <div>TO A</div>
          <div>BIGGER</div>
          <div>TOMORROW.</div>
        </div>
      </div>

      {/* Middle-Lower Section (Pillars above water feature) */}
      <div className="flex flex-col items-start py-2">
        <div className="text-[8.5px] font-medium uppercase tracking-[0.24em] text-neutral-300/80 leading-[1.75] space-y-0.5">
          <div>PEOPLE</div>
          <div>CONVERSATIONS</div>
          <div>OPPORTUNITIES</div>
          <div className="text-white/90">REAL PROGRESS.</div>
        </div>
      </div>

      {/* Bottom Scroll Cue */}
      <div className="flex flex-col items-start gap-2 pt-1">
        <div className="text-[8px] font-medium uppercase tracking-[0.22em] text-neutral-400/80 leading-[1.3]">
          <div>SCROLL</div>
          <div>TO EXPLORE</div>
        </div>
        {/* Sleek Mouse outline icon with scroll wheel dot */}
        <div className="w-3.5 h-5 border border-white/30 rounded-full flex justify-center pt-1 ml-0.5 shadow-sm">
          <div className="w-[1px] h-1.5 bg-white/80 rounded-full animate-bounce" />
        </div>
      </div>
    </aside>
  );
}
