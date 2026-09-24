import React, { useId } from "react";
import { PATH_M, PATH_AYA } from "./MayaBrand";

interface MayaWordmarkProps {
  className?: string;
  gradient?: boolean;
  isDark?: boolean;
}

export default function MayaWordmark({
  className = "h-2.5 w-auto",
  gradient = false,
  isDark = true,
}: MayaWordmarkProps) {
  const rawId = useId();
  const gradId = `maya-wordmark-grad-${rawId.replace(/:/g, "_")}`;

  return (
    <svg
      viewBox="58 45 2165 370"
      className={className}
      shapeRendering="geometricPrecision"
      role="img"
      aria-label="MAYA"
    >
      {gradient && (
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            {isDark ? (
              <>
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#F8FAFC" />
                <stop offset="70%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#CBD5E1" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#0B0F17" />
                <stop offset="100%" stopColor="#1E293B" />
              </>
            )}
          </linearGradient>
        </defs>
      )}
      <path
        d={PATH_M}
        fill={gradient ? `url(#${gradId})` : "currentColor"}
        fillRule="evenodd"
      />
      <path
        d={PATH_AYA}
        fill={gradient ? `url(#${gradId})` : "currentColor"}
        fillRule="evenodd"
      />
    </svg>
  );
}
