import type { ReactNode } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  headerVariant?: 'default' | 'search';
}

export function DashboardLayout({ children, headerVariant = 'default' }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#faf9f6]">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader variant={headerVariant} />
        <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
