// src/components/icons/tf-head-icon.tsx
import type { SVGProps } from 'react';

export function TfHeadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props} // Spread props to allow className, width, height, etc.
    >
      {/* The outer circle color will be determined by the CSS 'color' property (e.g., text-primary) */}
      <circle cx="16" cy="16" r="15" fill="currentColor" />
      
      {/* The white logo parts, fill explicitly set to white */}
      {/* Dot for T's top */}
      <circle cx="16" cy="8" r="3" fill="#FFFFFF" />
      {/* Vertical stem for T and F */}
      <rect x="14" y="10" width="4" height="14" rx="1" fill="#FFFFFF" />
      {/* Top bar for F */}
      <rect x="14" y="14" width="10" height="4" rx="1" fill="#FFFFFF" />
      {/* Middle bar for F */}
      <rect x="14" y="20" width="7" height="4" rx="1" fill="#FFFFFF" />
    </svg>
  );
}
