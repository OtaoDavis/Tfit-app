import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PillarGridItemProps {
  title: string;
  icon: LucideIcon;
  href: string;
  description: string; // Added description prop
  className?: string;
}

export function PillarGridItem({ title, icon: Icon, href, description, className }: PillarGridItemProps) {
  return (
    <Link href={href} className={cn("block group h-full", className)}> {/* Ensure link takes full height of grid cell */}
      <Card className="bg-accent text-accent-foreground p-4 flex flex-col items-center justify-center text-center rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform group-hover:scale-105 group-hover:bg-accent/90 h-full">
        <Icon className="h-10 w-10 mb-2 text-primary group-hover:text-primary/90 transition-colors" />
        <span className="font-semibold text-base mb-1.5">{title}</span>
        <p className="text-xs text-accent-foreground/90 leading-tight px-1">{description}</p>
      </Card>
    </Link>
  );
}
