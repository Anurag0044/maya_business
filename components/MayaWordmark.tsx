import React from "react";
import { PATH_M, PATH_AYA } from "./MayaBrand";

interface MayaWordmarkProps {
  className?: string;
}

export default function MayaWordmark({ className = "h-2.5 w-auto" }: MayaWordmarkProps) {
  return (
    <svg
      viewBox="58 45 2165 370"
      className={className}
      shapeRendering="geometricPrecision"
      role="img"
      aria-label="MAYA"
    >
      <path d={PATH_M} fill="currentColor" fillRule="evenodd" />
      <path d={PATH_AYA} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}
