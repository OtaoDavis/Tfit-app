import type { ReactNode } from 'react';
import { AppLayout } from '@/components/layout/app-layout';

export default function ApplicationGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
