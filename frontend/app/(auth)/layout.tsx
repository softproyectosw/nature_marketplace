import type { Metadata } from 'next';

/**
 * Auth Layout - Wrapper for login/register pages
 * No-index for SEO (auth pages shouldn't be indexed)
 */

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background-dark">
      {children}
    </div>
  );
}
