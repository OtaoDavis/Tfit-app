
import type { LucideIcon } from 'lucide-react';
import { Home, Apple, Users, UserCircle, Settings, Info, Activity, Brain } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  matchSegments?: number; 
}

export const mainNavItems: NavItem[] = [
  {
    title: 'Home',
    href: '/',
    icon: Home,
    matchSegments: 0, // Exact match for root
  },
  {
    title: 'Mindset',
    href: '/mindset',
    icon: Brain,
    matchSegments: 1,
  },
  {
    title: 'Nutrition',
    href: '/nutrition',
    icon: Apple,
    matchSegments: 1,
  },
  {
    title: 'Wellness',
    href: '/movement',
    icon: Activity,
    matchSegments: 1,
  },
  {
    title: 'Community',
    href: '/community',
    icon: Users,
    matchSegments: 1,
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: UserCircle,
    matchSegments: 1,
  },
];

export const settingsNavItems: NavItem[] = [
 {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    matchSegments: 1,
  },
  {
    title: 'About',
    href: '/about',
    icon: Info,
    matchSegments: 1,
  }
];
