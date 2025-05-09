import { PillarGridItem } from '@/components/home/pillar-grid-item';
import { Brain, Apple, Dumbbell, Users } from 'lucide-react'; // Added Users, removed ClipboardList, CheckCircle2, Scale
import type { LucideIcon } from 'lucide-react';

interface Pillar {
  title: string;
  icon: LucideIcon;
  href: string;
  description: string; 
}

export default function HomePage() {
  const pillars: Pillar[] = [
    {
      title: 'Mindset',
      icon: Brain,
      href: '/#',
      description: 'Cultivate a resilient and positive mindset for lasting change.',
    },
    {
      title: 'Nutrition',
      icon: Apple,
      href: '/nutrition',
      description: 'Fuel your body with mindful, nourishing food choices.',
    },
    {
      title: 'Movement',
      icon: Dumbbell,
      href: '/#', 
      description: 'Discover enjoyable activities that energize and strengthen you.',
    },
    {
      title: 'Community',
      icon: Users,
      href: '/community',
      description: 'Connect, share, and grow with our supportive wellness family.',
    },
  ];

  return (
    <div className="container mx-auto py-8 flex flex-col items-center text-center">
      <h2 className="text-sm uppercase text-muted-foreground tracking-widest mb-1">
        The
      </h2>
      <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-2">
        Treasured Collective
      </h1>
      <p className="text-lg text-foreground mb-4">
        by Coach Roseanne
      </p>
      <p className="text-md text-muted-foreground max-w-md mb-10">
        You have one life, you have one body&mdash;so treasure it.
      </p>

      <div className="grid grid-cols-2 gap-6 w-full max-w-lg"> 
        {pillars.map((pillar) => (
          <PillarGridItem
            key={pillar.title}
            title={pillar.title}
            icon={pillar.icon}
            href={pillar.href}
            description={pillar.description} 
          />
        ))}
      </div>
    </div>
  );
}
