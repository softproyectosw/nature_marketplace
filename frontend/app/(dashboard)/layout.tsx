import type { Metadata } from 'next';
import { BottomNav } from '@/components/ui';

/**
 * Dashboard Layout - Protected area wrapper
 * Includes bottom navigation and auth protection
 */

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Add auth check and redirect to /login if not authenticated
  
  return (
    <div className="min-h-screen bg-background-dark pb-[88px]">
      {children}
      <BottomNav />
    </div>
  );
}
