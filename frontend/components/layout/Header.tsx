'use client';

import Link from 'next/link';
import { CartButton } from '@/components/cart';
import { UserMenu } from '@/components/auth';
import { LanguageSelector } from '@/components/ui';

export function Header() {
  return (
    <header className="sticky top-0 z-20 bg-background-dark/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">
              eco
            </span>
            <span className="font-bold text-white">Nature Marketplace</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <CartButton />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
