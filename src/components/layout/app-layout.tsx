"use client";
import type { ReactNode } from 'react';
import Link from 'next/link';
import { PanelLeft } from 'lucide-react';
import { TfHeadIcon } from '@/components/icons/tf-head-icon'; // Import the new icon
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { mainNavItems, settingsNavItems } from '@/config/navigation';
import { Button } from '@/components/ui/button';
import { ModeToggle } from './mode-toggle';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true} open={true}>
      <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r">
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2">
            <TfHeadIcon className="h-8 w-8 text-primary" /> {/* Use the new icon */}
            <h1 className="text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">
              The Treasured Collective
            </h1>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2 pr-0 flex-grow">
          <SidebarNav items={mainNavItems} />
        </SidebarContent>
        <SidebarFooter className="p-2">
           <SidebarNav items={settingsNavItems} />
           <div className="mt-auto p-2 flex justify-center group-data-[collapsible=icon]:hidden">
            <ModeToggle />
          </div>
           <div className="mt-auto p-2 hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <ModeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6">
          <MobileSidebarTrigger />
          <div className="flex-1">
            {/* Placeholder for breadcrumbs or search */}
          </div>
          {/* You can add user menu or other header items here */}
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function MobileSidebarTrigger() {
  const { isMobile, toggleSidebar } = useSidebar();
  if (!isMobile) return null;

  return (
    <Button
      variant="outline"
      size="icon"
      className="shrink-0 md:hidden"
      onClick={toggleSidebar}
      aria-label="Toggle navigation menu"
    >
      <PanelLeft className="h-5 w-5" />
    </Button>
  );
}
