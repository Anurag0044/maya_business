import React from "react";

export default function LogoCloud() {
  return (
    <div className="flex flex-wrap items-center gap-x-8 sm:gap-x-10 lg:gap-x-12 gap-y-2 text-[#8e95a2]/70 select-none">
      {/* Label */}
      <div className="text-[9.5px] uppercase font-semibold tracking-[0.22em] text-[#5a606d] leading-[1.35] whitespace-nowrap mr-1">
        <div>TRUSTED BY</div>
        <div>MODERN BUSINESSES</div>
      </div>

      {/* Logos Container */}
      <div className="flex items-center gap-7 sm:gap-9 lg:gap-11">
        {/* Stripe */}
        <div className="flex items-center hover:text-white transition-colors duration-200">
          <span className="font-bold text-[16.5px] tracking-[-0.04em] lowercase leading-none select-none">
            stripe
          </span>
        </div>

        {/* Notion */}
        <div className="flex items-center gap-1.5 hover:text-white transition-colors duration-200">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l11.455-.84c1.12-.094 1.4-.467 1.026-1.027-.373-.56-1.12-.653-2.24-.56L5.393 3.088c-.933.094-1.306.467-.934 1.12zm.84 3.826v12.223c0 1.027.466 1.4 1.493 1.307l12.774-.933c1.027-.094 1.307-.747 1.307-1.68V6.727c0-.933-.373-1.307-1.307-1.213L6.792 6.447c-.933.093-1.493.56-1.493 1.587zm12.307 1.307c.093.466 0 .933-.467 1.026-.56.094-1.027-.186-1.213-.653L13.51 6.82c-.187-.373-.467-.373-.747-.373-.373 0-.56.093-.746.373L7.72 13.914v-4.293c0-.654-.28-.934-.84-.934-.654 0-.84.28-.84.934v8.213c0 .654.28.934.84.934.653 0 .84-.28.84-.934v-4.106l4.667-7.28c.187-.28.373-.374.56-.374.28 0 .467.094.654.374l2.52 3.08zm-7.653 3.547L6.879 17.554c-.187.373 0 .746.373.84.467.093.84-.187 1.027-.56l3.08-4.853v4.666c0 .654.28.934.84.934.654 0 .84-.28.84-.934v-8.306c0-.654-.28-.934-.84-.934-.653 0-.84.28-.84.934v4.48z" />
          </svg>
          <span className="font-semibold text-[14px] tracking-tight">Notion</span>
        </div>

        {/* Linear */}
        <div className="flex items-center gap-1.5 hover:text-white transition-colors duration-200">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M2.75 3.328A11.96 11.96 0 0 1 12 0c6.627 0 12 5.373 12 12 0 3.73-1.704 7.065-4.383 9.25L2.75 3.328ZM1.027 5.864 18.136 22.973A11.956 11.956 0 0 1 12 24C5.373 24 0 18.627 0 12c0-2.316.657-4.48 1.027-6.136Z" />
          </svg>
          <span className="font-semibold text-[13.5px] tracking-tight">Linear</span>
        </div>

        {/* Figma */}
        <div className="flex items-center gap-1.5 hover:text-white transition-colors duration-200">
          <svg className="w-3 h-4 fill-current" viewBox="0 0 38 57">
            <path d="M19 28.5A9.5 9.5 0 1 1 28.5 19 9.5 9.5 0 0 1 19 28.5z" />
            <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" />
            <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" />
            <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" />
            <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" />
          </svg>
          <span className="font-normal text-[14px] tracking-tight">Figma</span>
        </div>

        {/* Vercel */}
        <div className="flex items-center gap-1.5 hover:text-white transition-colors duration-200">
          <svg className="w-3.5 h-3 fill-current" viewBox="0 0 76 65">
            <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
          </svg>
          <span className="font-semibold text-[13px] tracking-tight">Vercel</span>
        </div>

        {/* Slack */}
        <div className="flex items-center gap-1.5 hover:text-white transition-colors duration-200">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.52 2.52 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.52 2.52 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.52 2.52 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.52 2.52 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.52 2.52 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.52 2.52 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.52 2.52 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.52 2.52 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.52 2.52 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.52 2.52 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.52 2.52 0 0 1-2.522 2.523h-6.313z" />
          </svg>
          <span className="font-bold text-[14.5px] tracking-tight">slack</span>
        </div>
      </div>
    </div>
  );
}
