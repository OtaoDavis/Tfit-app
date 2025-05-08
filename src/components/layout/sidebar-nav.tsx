"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/config/navigation';
import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar, // Import useSidebar
} from '@/components/ui/sidebar';

interface SidebarNavProps {
  items: NavItem[];
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar(); // Get sidebar context

  if (!items?.length) {
    return null;
  }

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false); // Close sidebar on mobile
    }
  };

  return (
    <SidebarMenu>
      {items.map((item, index) => {
        const Icon = item.icon;
        
        // Improved active link detection based on segments
        const currentPathSegments = pathname.split('/').filter(Boolean);
        const itemPathSegments = item.href.split('/').filter(Boolean);
        let isActive = false;

        if (item.matchSegments !== undefined) {
          if (item.href === '/') { // Root path
            isActive = pathname === '/';
          } else {
            isActive = currentPathSegments.length >= itemPathSegments.length &&
                       itemPathSegments.every((seg, i) => seg === currentPathSegments[i]) &&
                       (item.matchSegments === 0 || currentPathSegments.length === itemPathSegments.length);
             if (item.matchSegments > 0 && itemPathSegments.length === item.matchSegments) {
                isActive = currentPathSegments.slice(0, item.matchSegments).join('/') === itemPathSegments.slice(0, item.matchSegments).join('/');
             } else if (item.matchSegments === 0 && item.href === '/') {
                isActive = pathname === '/';
             } else {
                isActive = pathname.startsWith(item.href) && (pathname === item.href || pathname.charAt(item.href.length) === '/');
             }
             // Special handling for exact match on root '/'
             if (item.href === '/' && pathname !== '/') isActive = false;
             if (item.href === '/' && pathname === '/') isActive = true;

          }
        } else {
           // Default behavior: startsWith, but exact for '/'
          isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);
        }


        return (
          <SidebarMenuItem key={index}>
            <Link href={item.href} passHref legacyBehavior onClick={handleLinkClick}>
              <SidebarMenuButton
                variant="default"
                size="default"
                className={cn(
                  'justify-start w-full',
                  isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )}
                isActive={isActive}
                tooltip={{ children: item.title, className: "text-xs"}}
              >
                <Icon className="mr-2 h-5 w-5 shrink-0" />
                <span className="truncate group-data-[collapsible=icon]:hidden">
                  {item.title}
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
