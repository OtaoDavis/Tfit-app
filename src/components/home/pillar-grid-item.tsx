import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PillarGridItemProps {
  title: string;
  icon: LucideIcon;
  href: string;
  className?: string;
}

export function PillarGridItem({ title, icon: Icon, href, className }: PillarGridItemProps) {
  return (
    <Link href={href} className={cn("block group", className)}>
      <Card className="bg-accent text-accent-foreground p-4 sm:p-6 aspect-square flex flex-col items-center justify-center text-center rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform group-hover:scale-105 group-hover:bg-accent/90">
        <Icon className="h-10 w-10 sm:h-12 sm:w-12 mb-2 sm:mb-3 text-primary group-hover:text-primary/90 transition-colors" />
        <span className="font-semibold text-sm sm:text-base">{title}</span>
      </Card>
    </Link>
  );
}
