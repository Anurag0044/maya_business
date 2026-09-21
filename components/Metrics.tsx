import React from "react";

export default function Metrics() {
  const stats = [
    {
      value: "3×",
      label: "More conversions",
    },
    {
      value: "70%",
      label: "Less manual work",
    },
    {
      value: "24/7",
      label: "Always on",
    },
  ];

  return (
    <div className="flex items-center pt-1">
      {stats.map((stat, idx) => (
        <div key={idx} className="flex items-center">
          <div className="flex flex-col">
            <span className="text-[clamp(1.5rem,2.1vw,2.15rem)] font-light tracking-[-0.02em] text-white leading-none mb-1">
              {stat.value}
            </span>
            <span className="text-[11px] sm:text-[11.5px] text-[#8e95a5] font-normal leading-tight">
              {stat.label}
            </span>
          </div>

          {/* Thin vertical hairline divider */}
          {idx < stats.length - 1 && (
            <div className="h-6.5 sm:h-7.5 lg:h-8 w-[1px] bg-white/[0.12] mx-5 sm:mx-6 lg:mx-7" />
          )}
        </div>
      ))}
    </div>
  );
}
