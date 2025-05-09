// src/components/icons/tf-head-icon.tsx
import Image from 'next/image';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TfHeadIconProps extends HTMLAttributes<HTMLDivElement> {
  // Component will rely on className to size the container div
}

export function TfHeadIcon({ className, ...props }: TfHeadIconProps) {
  return (
    // The className (e.g., "h-16 w-16") will size this div.
    // Add relative positioning for layout="fill" to work.
    <div className={cn("relative", className)} {...props}>
      <Image
        src="/tf_head.png" // Assumes tf_head.png is in the 'public' folder
        alt="The Treasured Collective Logo"
        layout="fill" // Makes the image fill the parent div
        objectFit="contain" // Ensures the image aspect ratio is maintained within the div
      />
    </div>
  );
}
