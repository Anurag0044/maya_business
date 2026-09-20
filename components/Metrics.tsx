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
            <span className="text-[clamp(1.5rem,3.2vh,2.25rem)] font-light tracking-tight text-white leading-none mb-1">
              {stat.value}
            </span>
            <span className="text-[11.5px] text-[#8e95a5] font-normal leading-tight">
              {stat.label}
            </span>
          </div>

          {/* Thin vertical hairline divider */}
          {idx < stats.length - 1 && (
            <div className="h-7 sm:h-8 lg:h-9 w-[1px] bg-white/15 mx-5 sm:mx-7" />
          )}
        </div>
      ))}
    </div>
  );
}
