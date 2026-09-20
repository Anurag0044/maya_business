import React from "react";

export default function RightRail() {
  return (
    <aside className="hidden xl:flex flex-col justify-between items-start text-left z-20 pointer-events-none select-none h-full max-h-[76vh] my-auto pr-3 lg:pr-6">
      {/* Top Capabilities Stack */}
      <div className="flex flex-col items-start gap-3.5">
        <div className="text-[9.5px] font-medium uppercase tracking-[0.24em] text-[#9ca3af]/90 leading-[1.8] space-y-0.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
          <div>CALLS</div>
          <div>LEADS</div>
          <div>APPOINTMENTS</div>
          <div>FOLLOW-UPS</div>
          <div>INSIGHTS</div>
          <div>GROWTH</div>
        </div>

        {/* Vertical Accent Rule */}
        <div className="w-[1.5px] h-9 bg-white/30 ml-0.5 shadow-sm" />

        {/* Poetic Editorial Statement */}
        <div className="text-[9px] font-medium uppercase tracking-[0.24em] text-[#9ca3af]/90 leading-[1.75] space-y-0.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
          <div>A</div>
          <div>QUIETER</div>
          <div>WAY</div>
          <div>TO A</div>
          <div>BIGGER</div>
          <div>TOMORROW.</div>
        </div>
      </div>

      {/* Middle-Lower Section (Pillars above water feature) */}
      <div className="flex flex-col items-start py-3">
        <div className="text-[9px] font-medium uppercase tracking-[0.24em] text-[#9ca3af]/90 leading-[1.75] space-y-0.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
          <div>PEOPLE</div>
          <div>CONVERSATIONS</div>
          <div>OPPORTUNITIES</div>
          <div>REAL PROGRESS.</div>
        </div>
      </div>

      {/* Bottom Scroll Cue */}
      <div className="flex flex-col items-start gap-2">
        <div className="text-[8px] font-medium uppercase tracking-[0.22em] text-[#9ca3af]/80 leading-[1.3] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
          <div>SCROLL</div>
          <div>TO EXPLORE</div>
        </div>
        {/* Sleek Mouse outline icon with scroll wheel dot */}
        <div className="w-3.5 h-5 border-[1.5px] border-white/40 rounded-full flex justify-center pt-1 ml-0.5 shadow-md">
          <div className="w-[1px] h-1.5 bg-white/90 rounded-full animate-bounce" />
        </div>
      </div>
    </aside>
  );
}
